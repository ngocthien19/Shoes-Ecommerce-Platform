import { orderService } from '~/services/user/orderService'

const createOrderCOD = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { recipientName, recipientPhone, shippingAddress, discountAmount, paymentMethod, appliedVoucher } = req.body
    const result = await orderService.createOrderCOD(userId, {
      recipientName,
      recipientPhone,
      shippingAddress,
      discountAmount: Number(discountAmount) || 0,
      paymentMethod,
      appliedVoucher
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đặt hàng: ${error.message}` })
  }
}

const createOrderOnline = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { recipientName, recipientPhone, shippingAddress, discountAmount, paymentMethod, appliedVoucher } = req.body

    // Lấy IP thật của khách hàng
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const result = await orderService.createOrderOnline(userId, {
      recipientName,
      recipientPhone,
      shippingAddress,
      discountAmount: Number(discountAmount) || 0,
      paymentMethod,
      appliedVoucher
    }, ipAddr)

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đặt hàng Online: ${error.message}` })
  }
}

const vnpayReturnIPN = async (req, res) => {
  try {
    const result = await orderService.vnpayIPN(req.query)
    return res.status(200).json({ RspCode: result.code, Message: result.message })
  } catch (error) {
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' })
  }
}

const momoReturn = async (req, res) => {
  try {
    // Đẩy toàn bộ cục query xuống Service xử lý
    const result = await orderService.processMoMoReturn(req.query)

    if (result.isSuccess) {
      return res.status(200).json({
        message: result.message,
        momoMessage: result.momoMessage
      })
    }

    return res.status(400).json({
      message: result.message,
      momoMessage: result.momoMessage
    })
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xử lý redirect MoMo.' })
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
  vnpayReturnIPN, momoReturn, momoReturnIPN }