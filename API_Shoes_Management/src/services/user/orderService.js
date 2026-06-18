import pool from '~/config/db'
import crypto from 'crypto'
import qs from 'qs'
import { env } from '~/config/environment'
import { orderModel } from '~/models/user/order/orderModel'
import { PaymentProvider } from '~/providers/PaymentProvider'
import { PAYMENT_METHODS, PAYMENT_STATUS, ORDER_STATUS, NOTIFICATION_TYPES } from '~/utils/constants'
import { notificationService } from '~/services/notification/notificationService'

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

      const specificStoreDiscount = data.storeDiscounts ? data.storeDiscounts[storeId] : { amount: 0, code: null }
      const discountAmount = Number(specificStoreDiscount?.amount) || 0
      const appliedVoucher = specificStoreDiscount?.code || null

      const totalAmount = Math.max(0, subTotal - discountAmount)
      totalAllShops += totalAmount
      const commissionRateSnapshot = storeItems[0].commission_rate || 10.00

      const orderId = await orderModel.createOrder(connection, {
        userId,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        storeId: Number(storeId),
        totalAmount,
        discount_amount: discountAmount,
        commission_rate_snapshot: commissionRateSnapshot,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        appliedVoucher: appliedVoucher
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
    return { createdOrderIds, totalAllShops, itemsByStore }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Hàm gửi thông báo cho Vendor
const sendNotificationToVendor = async (storeId, orderId, buyerName, totalAmount, type, title) => {
  try {
    const [storeRows] = await pool.execute('SELECT owner_id, name FROM stores WHERE id = ?', [storeId])
    if (storeRows.length === 0) return

    const ownerId = storeRows[0].owner_id
    const storeName = storeRows[0].name
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)

    let message = ''
    if (type === NOTIFICATION_TYPES.ORDER_CREATED) {
      message = `Có đơn hàng mới #${orderId} từ khách hàng ${buyerName} với tổng tiền ${formattedAmount}`
    } else if (type === NOTIFICATION_TYPES.ORDER_PAID) {
      message = `Đơn hàng #${orderId} từ khách hàng ${buyerName} đã được thanh toán thành công với tổng tiền ${formattedAmount}. Vui lòng xác nhận và chuẩn bị hàng.`
    }

    await notificationService.createAndPushNotification({
      userId: ownerId,
      title: title,
      content: JSON.stringify({
        message: message,
        orderId: orderId,
        storeName: storeName,
        buyerName: buyerName,
        amount: totalAmount
      }),
      type: type,
      referenceId: orderId
    })
  } catch (error) {
    console.error(`Lỗi gửi thông báo cho Vendor về đơn hàng #${orderId}:`, error)
  }
}

// Hàm gửi thông báo cho User
const sendNotificationToUser = async (userId, orderId, title, message, type) => {
  try {
    await notificationService.createAndPushNotification({
      userId: userId,
      title: title,
      content: JSON.stringify({
        message: message,
        orderId: orderId
      }),
      type: type,
      referenceId: orderId
    })
  } catch (error) {
    console.error(`Lỗi gửi thông báo cho User về đơn hàng #${orderId}:`, error)
  }
}

// 1. Luồng thanh toán COD
const createOrderCOD = async (userId, payload) => {
  const { createdOrderIds, itemsByStore } = await coreCreateOrderTransaction(userId, { ...payload, paymentMethod: PAYMENT_METHODS.COD })

  // Lấy tên người đặt
  const [userRows] = await pool.execute('SELECT fullname FROM users WHERE id = ?', [userId])
  const buyerName = userRows.length > 0 ? userRows[0].fullname : 'Khách hàng'

  // Gửi thông báo cho user và vendor
  for (const orderId of createdOrderIds) {
    // Lấy thông tin đơn hàng
    const [orderRows] = await pool.execute('SELECT store_id, total_amount FROM orders WHERE id = ?', [orderId])
    if (orderRows.length > 0) {
      const storeId = orderRows[0].store_id
      const totalAmount = orderRows[0].total_amount

      // Gửi thông báo cho Vendor
      await sendNotificationToVendor(storeId, orderId, buyerName, totalAmount, NOTIFICATION_TYPES.ORDER_CREATED, 'Đơn hàng mới')
    }

    // Gửi thông báo cho User
    await sendNotificationToUser(
      userId,
      orderId,
      'Đặt hàng thành công',
      `Đơn hàng #${orderId} đã được đặt thành công. Cửa hàng sẽ sớm xác nhận và giao hàng.`,
      NOTIFICATION_TYPES.ORDER_CREATED
    )
  }

  return { message: 'Đặt đơn hàng COD thành công!', orderIds: createdOrderIds }
}

// 2. Luồng thanh toán Online (VNPAY)
const createOrderOnline = async (userId, payload, ipAddr) => {
  const { createdOrderIds, totalAllShops, itemsByStore } = await coreCreateOrderTransaction(userId, payload)
  const txnRef = createdOrderIds.join('_') + '_' + Date.now()

  let paymentUrl = ''

  if (payload.paymentMethod === PAYMENT_METHODS.VNPAY) {
    paymentUrl = PaymentProvider.createVNPayUrl(txnRef, totalAllShops, ipAddr)
  } else if (payload.paymentMethod === PAYMENT_METHODS.MOMO) {
    paymentUrl = await PaymentProvider.createMoMoUrl(txnRef, totalAllShops)
  }

  // Lấy tên người đặt
  const [userRows] = await pool.execute('SELECT fullname FROM users WHERE id = ?', [userId])
  const buyerName = userRows.length > 0 ? userRows[0].fullname : 'Khách hàng'

  // Gửi thông báo cho user và vendor khi tạo đơn (chờ thanh toán)
  for (const orderId of createdOrderIds) {
    // Lấy thông tin đơn hàng
    const [orderRows] = await pool.execute('SELECT store_id, total_amount FROM orders WHERE id = ?', [orderId])
    if (orderRows.length > 0) {
      const storeId = orderRows[0].store_id
      const totalAmount = orderRows[0].total_amount

      // Gửi thông báo cho Vendor (đang chờ thanh toán)
      await sendNotificationToVendor(storeId, orderId, buyerName, totalAmount, NOTIFICATION_TYPES.ORDER_PENDING_PAYMENT, 'Đơn hàng chờ thanh toán')
    }

    // Gửi thông báo cho User
    await sendNotificationToUser(
      userId,
      orderId,
      'Đơn hàng đang chờ thanh toán',
      `Đơn hàng #${orderId} đã được tạo. Vui lòng thanh toán để hoàn tất đặt hàng.`,
      NOTIFICATION_TYPES.ORDER_PENDING_PAYMENT
    )
  }

  return { message: 'Tạo đơn chờ thanh toán thành công!', orderIds: createdOrderIds, paymentUrl }
}

// 3. Webhook IPN xử lý giao dịch khi VNPAY gọi về
const vnpayIPN = async (vnp_Params) => {
  const secureHash = vnp_Params['vnp_SecureHash']

  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']

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

      // Gửi thông báo cho User và Vendor khi thanh toán VNPAY thành công
      for (const orderId of orderIds) {
        const userId = await orderModel.getOrderUserId(orderId)
        if (userId) {
          // Lấy thông tin đơn hàng và tên khách hàng
          const [orderRows] = await pool.execute(`
            SELECT o.store_id, o.total_amount, u.fullname as buyer_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
          `, [orderId])

          if (orderRows.length > 0) {
            const { store_id: storeId, total_amount: totalAmount, buyer_name: buyerName } = orderRows[0]
            const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)

            // Gửi thông báo cho Vendor
            await sendNotificationToVendor(storeId, orderId, buyerName, totalAmount, NOTIFICATION_TYPES.ORDER_PAID, 'Đơn hàng đã thanh toán')

            // Gửi thông báo cho User
            await sendNotificationToUser(
              userId,
              orderId,
              'Thanh toán thành công',
              `Đơn hàng #${orderId} đã được thanh toán thành công qua VNPAY với số tiền ${formattedAmount}. Cửa hàng sẽ sớm xác nhận và giao hàng.`,
              NOTIFICATION_TYPES.ORDER_PAID
            )
          }
        }
      }

      return { code: '00', message: 'Confirm Success' }
    } else {
      return { code: '00', message: 'Success but not paid' }
    }
  }

  return { code: '97', message: 'Checksum failed' }
}

// MoMo IPN
const momoIPN = async (reqBody) => {
  const {
    partnerCode, orderId, requestId, amount, orderInfo, orderType,
    transId, resultCode, message, payType, responseTime, extraData, signature
  } = reqBody

  const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
  const expectedSignature = crypto.createHmac('sha256', env.MOMO_SECRET_KEY).update(rawSignature).digest('hex')

  if (signature === expectedSignature) {
    if (resultCode === 0) {
      const parts = orderId.split('_')
      const orderIds = parts.slice(0, parts.length - 1).map(Number)

      await orderModel.updatePaymentStatusBulk(orderIds, PAYMENT_STATUS.PAID, ORDER_STATUS.PROCESSING)

      // Gửi thông báo cho User và Vendor khi thanh toán MoMo thành công
      for (const orderId of orderIds) {
        const userId = await orderModel.getOrderUserId(orderId)
        if (userId) {
          // Lấy thông tin đơn hàng và tên khách hàng
          const [orderRows] = await pool.execute(`
            SELECT o.store_id, o.total_amount, u.fullname as buyer_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
          `, [orderId])

          if (orderRows.length > 0) {
            const { store_id: storeId, total_amount: totalAmount, buyer_name: buyerName } = orderRows[0]
            const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)

            // Gửi thông báo cho Vendor
            await sendNotificationToVendor(storeId, orderId, buyerName, totalAmount, NOTIFICATION_TYPES.ORDER_PAID, 'Đơn hàng đã thanh toán')

            // Gửi thông báo cho User
            await sendNotificationToUser(
              userId,
              orderId,
              'Thanh toán thành công',
              `Đơn hàng #${orderId} đã được thanh toán thành công qua MoMo với số tiền ${formattedAmount}. Cửa hàng sẽ sớm xác nhận và giao hàng.`,
              NOTIFICATION_TYPES.ORDER_PAID
            )
          }
        }
      }

      return { success: true }
    }
  }
  throw new Error('Giao dịch MoMo thất bại hoặc sai chữ ký bảo mật.')
}

// MoMo Return
const processMoMoReturn = async (queryData) => {
  const { resultCode, message, orderId } = queryData

  if (resultCode === '0') {
    const parts = orderId.split('_')
    const orderIds = parts.slice(0, parts.length - 1).map(Number)

    await orderModel.updatePaymentStatusBulk(orderIds, PAYMENT_STATUS.PAID, ORDER_STATUS.PROCESSING)

    // Gửi thông báo cho User và Vendor khi thanh toán MoMo thành công
    for (const orderId of orderIds) {
      const userId = await orderModel.getOrderUserId(orderId)
      if (userId) {
        // Lấy thông tin đơn hàng và tên khách hàng
        const [orderRows] = await pool.execute(`
          SELECT o.store_id, o.total_amount, u.fullname as buyer_name 
          FROM orders o 
          JOIN users u ON o.user_id = u.id 
          WHERE o.id = ?
        `, [orderId])

        if (orderRows.length > 0) {
          const { store_id: storeId, total_amount: totalAmount, buyer_name: buyerName } = orderRows[0]
          const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)

          // Gửi thông báo cho Vendor
          await sendNotificationToVendor(storeId, orderId, buyerName, totalAmount, NOTIFICATION_TYPES.ORDER_PAID, 'Đơn hàng đã thanh toán')

          // Gửi thông báo cho User
          await sendNotificationToUser(
            userId,
            orderId,
            'Thanh toán thành công',
            `Đơn hàng #${orderId} đã được thanh toán thành công qua MoMo với số tiền ${formattedAmount}. Cửa hàng sẽ sớm xác nhận và giao hàng.`,
            NOTIFICATION_TYPES.ORDER_PAID
          )
        }
      }
    }

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

export const orderService = {
  createOrderCOD,
  createOrderOnline,
  vnpayIPN,
  momoIPN,
  processMoMoReturn
}