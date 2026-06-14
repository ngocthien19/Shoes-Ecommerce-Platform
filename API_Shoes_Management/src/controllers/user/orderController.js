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
    const result = await orderService.vnpayIPN(req.query)
    if (result.code === '00') {
      const txnRef = req.query.vnp_TxnRef
      const orderIds = txnRef.split('_').slice(0, -1).join(',')

      return res.redirect(`${env.FRONTEND_URL}/order-success?orderIds=${orderIds}&method=VNPAY`)
    }
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=failed`)
  } catch (error) {
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=error`)
  }
}

const momoReturn = async (req, res) => {
  try {
    const result = await orderService.processMoMoReturn(req.query)
    if (result.isSuccess) {
      const orderIdQuery = req.query.orderId
      const orderIds = orderIdQuery.split('_').slice(0, -1).join(',')

      return res.redirect(`${env.FRONTEND_URL}/order-success?orderIds=${orderIds}&method=MOMO`)
    }
    return res.redirect(`${env.FRONTEND_URL}/cart?payment=failed`)
  } catch (error) {
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

export const orderController = { createOrderCOD, createOrderOnline,
  vnpayReturn, momoReturn, momoReturnIPN }