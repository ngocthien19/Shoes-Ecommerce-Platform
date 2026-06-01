import pool from '~/config/db'
import crypto from 'crypto'
import qs from 'qs'
import { env } from '~/config/environment'
import { orderModel } from '~/models/user/order/orderModel'
import { PaymentProvider } from '~/providers/PaymentProvider'
import { PAYMENT_METHODS, PAYMENT_STATUS, ORDER_STATUS } from '~/utils/constants'

// Tạo đơn hàng và trừ kho (Dùng chung cho cả COD và Online)
const coreCreateOrderTransaction = async (userId, data) => {
  const cartItems = await orderModel.getCartItemsForCheckout(userId)
  if (!cartItems || cartItems.length === 0) throw new Error('Giỏ hàng của bạn đang trống rỗng.')

  for (const item of cartItems) {
    if (item.quantity > item.stock) throw new Error(`Sản phẩm trong kho không đủ đáp ứng (Hiện còn: ${item.stock}).`)
  }

  const itemsByStore = cartItems.reduce((acc, item) => {
    if (!acc[item.store_id]) acc[item.store_id] = []
    acc[item.store_id].push(item)
    return acc
  }, {})

  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const createdOrderIds = []
    let totalAllShops = 0

    for (const storeId in itemsByStore) {
      const storeItems = itemsByStore[storeId]
      const subTotal = storeItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
      const totalAmount = Math.max(0, subTotal - (Number(data.discountAmount) / Object.keys(itemsByStore).length))

      totalAllShops += totalAmount
      const commissionRateSnapshot = storeItems[0].commission_rate || 10.00

      // Khởi tạo đơn hàng luôn ở trạng thái UNPAID
      const orderId = await orderModel.createOrder(connection, {
        userId,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        storeId: Number(storeId),
        totalAmount,
        discount_amount: data.discountAmount,
        commission_rate_snapshot: commissionRateSnapshot,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod
      })

      createdOrderIds.push(orderId)

      for (const item of storeItems) {
        await orderModel.createOrderItem(connection, { orderId, variantId: item.variant_id, quantity: item.quantity, price: item.price })
        await orderModel.decreaseVariantStock(connection, item.variant_id, item.quantity)
        await orderModel.increaseProductSold(connection, item.product_id, item.quantity)
      }
    }

    await orderModel.clearUserCart(connection, userId)
    await connection.commit()
    return { createdOrderIds, totalAllShops }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// 1. Luồng thanh toán COD
const createOrderCOD = async (userId, payload) => {
  const { createdOrderIds } = await coreCreateOrderTransaction(userId, { ...payload, paymentMethod: PAYMENT_METHODS.COD })
  return { message: 'Đặt đơn hàng COD thành công!', orderIds: createdOrderIds }
}

// 2. Luồng thanh toán Online (VNPAY)
const createOrderOnline = async (userId, payload, ipAddr) => {
  const { createdOrderIds, totalAllShops } = await coreCreateOrderTransaction(userId, payload)
  const txnRef = createdOrderIds.join('_') + '_' + Date.now()

  let paymentUrl = ''

  // Rẽ nhánh tùy theo user chọn cổng nào
  if (payload.paymentMethod === PAYMENT_METHODS.VNPAY) {
    paymentUrl = PaymentProvider.createVNPayUrl(txnRef, totalAllShops, ipAddr)
  } else if (payload.paymentMethod === PAYMENT_METHODS.MOMO) {
    paymentUrl = await PaymentProvider.createMoMoUrl(txnRef, totalAllShops)
  }

  return { message: 'Tạo đơn chờ thanh toán thành công!', orderIds: createdOrderIds, paymentUrl }
}

// 3. Webhook IPN xử lý giao dịch khi VNPAY gọi về
const vnpayIPN = async (vnp_Params) => {
  const secureHash = vnp_Params['vnp_SecureHash']

  // Xóa chữ ký cũ đi trước khi băm lại
  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']

  // Phải dùng đúng hàm sortObject của VNPAY thay vì sort thường
  vnp_Params = PaymentProvider.sortObject(vnp_Params)

  const signData = qs.stringify(vnp_Params, { encode: false })
  const hmac = crypto.createHmac('sha512', env.VNP_HASH_SECRET)
  const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex')

  if (secureHash === signed) {
    if (vnp_Params['vnp_ResponseCode'] === '00') {
      const txnRef = vnp_Params['vnp_TxnRef']
      const parts = txnRef.split('_')
      const orderIds = parts.slice(0, parts.length - 1).map(Number)

      await orderModel.updatePaymentStatusBulk(orderIds, PAYMENT_STATUS.PAID, ORDER_STATUS.PROCESSING)
      return { code: '00', message: 'Confirm Success' }
    } else {
      return { code: '00', message: 'Success but not paid' }
    }
  }

  return { code: '97', message: 'Checksum failed' }
}

const momoIPN = async (reqBody) => {
  const {
    partnerCode, orderId, requestId, amount, orderInfo, orderType,
    transId, resultCode, message, payType, responseTime, extraData, signature
  } = reqBody

  // Băm lại chữ ký xem có đúng của MoMo gửi không
  const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
  const expectedSignature = crypto.createHmac('sha256', env.MOMO_SECRET_KEY).update(rawSignature).digest('hex')

  if (signature === expectedSignature) {
    if (resultCode === 0) { // 0 là mã thành công của MoMo
      const parts = orderId.split('_')
      const orderIds = parts.slice(0, parts.length - 1).map(Number)

      await orderModel.updatePaymentStatusBulk(orderIds, PAYMENT_STATUS.PAID, ORDER_STATUS.PROCESSING)
      return { success: true }
    }
  }
  throw new Error('Giao dịch MoMo thất bại hoặc sai chữ ký bảo mật.')
}

const processMoMoReturn = async (queryData) => {
  const { resultCode, message, orderId } = queryData

  if (resultCode === '0') {
    // Bóc tách ID đơn hàng
    const parts = orderId.split('_')
    const orderIds = parts.slice(0, parts.length - 1).map(Number)

    // Gọi Model cập nhật DB ngay tại tầng Service
    await orderModel.updatePaymentStatusBulk(orderIds, PAYMENT_STATUS.PAID, ORDER_STATUS.PROCESSING)

    return {
      isSuccess: true,
      message: 'Thanh toán MoMo thành công',
      momoMessage: message
    }
  }

  return {
    isSuccess: false,
    message: 'Giao dịch MoMo thất bại hoặc bị hủy.',
    momoMessage: message
  }
}

export const orderService = { createOrderCOD, createOrderOnline, vnpayIPN, momoIPN, processMoMoReturn }