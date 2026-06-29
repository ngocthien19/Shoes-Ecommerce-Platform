import { orderService } from '~/services/user/orderService'
import { env } from '~/config/environment'

const createOrderCOD = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { recipientName, recipientPhone, shippingAddress, discountAmount, paymentMethod, storeDiscounts } = req.body
    const result = await orderService.createOrderCOD(userId, {
      recipientName,
      recipientPhone,
      shippingAddress,
      discountAmount: Number(discountAmount) || 0,
      paymentMethod,
      storeDiscounts
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đặt hàng: ${error.message}` })
  }
}

const createOrderOnline = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { recipientName, recipientPhone, shippingAddress, discountAmount, paymentMethod, storeDiscounts } = req.body
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const result = await orderService.createOrderOnline(userId, {
      recipientName,
      recipientPhone,
      shippingAddress,
      discountAmount: Number(discountAmount) || 0,
      paymentMethod,
      storeDiscounts
    }, ipAddr)

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đặt hàng Online: ${error.message}` })
  }
}

const vnpayReturn = async (req, res) => {
  try {
    // 👉 LOG để debug
    console.log('=== VNPAY RETURN ===')
    console.log('Query params:', req.query)

    const result = await orderService.vnpayIPN(req.query)
    const txnRef = req.query.vnp_TxnRef
    const vnp_ResponseCode = req.query.vnp_ResponseCode

    // 👉 LOG kết quả
    console.log('VNPAY IPN Result:', result)
    console.log('vnp_ResponseCode:', vnp_ResponseCode)
    console.log('isSuccess:', result.isSuccess)

    // Kiểm tra isSuccess và response code
    if (result.isSuccess && vnp_ResponseCode === '00') {
      const orderIds = txnRef.split('_').slice(0, -1).join(',')
      console.log('✅ Redirect to order-success:', orderIds)
      return res.redirect(`${env.FRONTEND_URL}/order-success?orderIds=${orderIds}&method=VNPAY&payment=success`)
    }

    // Thanh toán thất bại hoặc bị hủy
    let orderIds = ''
    if (txnRef) {
      orderIds = txnRef.split('_').slice(0, -1).join(',')
    }
    console.log('❌ Redirect to cart failed:', orderIds)
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=failed${orderIds ? `&orderIds=${orderIds}` : ''}`)
  } catch (error) {
    console.error('❌ VNPAY Return Error:', error)
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=error`)
  }
}

const momoReturn = async (req, res) => {
  try {
    // 👉 LOG để debug
    console.log('=== MOMO RETURN ===')
    console.log('Query params:', req.query)

    const result = await orderService.processMoMoReturn(req.query)
    const orderIdQuery = req.query.orderId
    const resultCode = req.query.resultCode

    // 👉 LOG kết quả
    console.log('MoMo Result:', result)
    console.log('resultCode:', resultCode)
    console.log('isSuccess:', result.isSuccess)

    // Kiểm tra isSuccess và resultCode
    if (result.isSuccess && resultCode === '0') {
      const orderIds = orderIdQuery.split('_').slice(0, -1).join(',')
      console.log('✅ Redirect to order-success:', orderIds)
      return res.redirect(`${env.FRONTEND_URL}/order-success?orderIds=${orderIds}&method=MOMO&payment=success`)
    }

    // Thanh toán thất bại hoặc bị hủy
    let orderIds = ''
    if (orderIdQuery) {
      orderIds = orderIdQuery.split('_').slice(0, -1).join(',')
    }
    console.log('❌ Redirect to cart failed:', orderIds)
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=failed${orderIds ? `&orderIds=${orderIds}` : ''}`)
  } catch (error) {
    console.error('❌ MoMo Return Error:', error)
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=error`)
  }
}

const momoReturnIPN = async (req, res) => {
  try {
    await orderService.momoIPN(req.body)
    return res.status(204).send()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const orderController = {
  createOrderCOD,
  createOrderOnline,
  vnpayReturn,
  momoReturn,
  momoReturnIPN
}