import { orderTrackingService } from '~/services/user/orderTrackingService'

const getOrderHistory = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await orderTrackingService.getOrderHistory(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải lịch sử mua hàng: ${error.message}` })
  }
}

const cancelOrderByUser = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params

    const result = await orderTrackingService.cancelOrderByUser(userId, Number(orderId))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý yêu cầu hủy đơn: ${error.message}` })
  }
}

const withdrawCancelRequest = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params

    const result = await orderTrackingService.withdrawCancelRequest(userId, Number(orderId))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi rút yêu cầu hủy đơn: ${error.message}` })
  }
}

export const orderTrackingController = {
  getOrderHistory,
  cancelOrderByUser,
  withdrawCancelRequest
}