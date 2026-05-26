import { orderService } from '~/services/user/orderService'

const createOrderCOD = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id

    const { recipientName, recipientPhone, shippingAddress, discountAmount } = req.body

    // Tiến hành gọi Service và truyền trọn gói mớ dữ liệu đối soát xuống
    const result = await orderService.createOrderCOD(userId, {
      recipientName,
      recipientPhone,
      shippingAddress,
      discountAmount: Number(discountAmount) || 0
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý đặt hàng: ${error.message}` })
  }
}

export const orderController = {
  createOrderCOD
}