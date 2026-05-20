import { orderService } from '~/services/user/orderService'

const createOrderCOD = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id || req.user?._id
    const { shippingAddress } = req.body

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Địa chỉ nhận hàng (shippingAddress) là bắt buộc.' })
    }

    const result = await orderService.createOrderCOD(userId, shippingAddress)
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đặt hàng: ${error.message}` })
  }
}

export const orderController = {
  createOrderCOD
}