import { vendorOrderService } from '~/services/vendor/vendorOrderService'

// 1. GET: Danh sách đơn hàng (Có phân trang và lọc theo trạng thái)
const getVendorOrders = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id

    // Đón thêm các tiêu chí lọc nâng cao từ URL của FE truyền lên
    const { page, limit, status, searchOrderId, paymentMethod, startDate, endDate } = req.query

    const result = await vendorOrderService.getVendorOrders(userId, {
      page,
      limit,
      status,
      searchOrderId,
      paymentMethod,
      startDate,
      endDate
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy danh sách đơn hàng: ${error.message}` })
  }
}

// 2. PUT: Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng là bắt buộc.' })
    }

    const result = await vendorOrderService.updateOrderStatus(userId, Number(id), status)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}` })
  }
}

// 3. PUT: Phản hồi yêu cầu hủy đơn từ khách hàng
const handleCancelRequest = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { decision, reason } = req.body

    if (!decision) {
      return res.status(400).json({ message: 'Quyết định xử lý (decision) là bắt buộc.' })
    }

    const result = await vendorOrderService.handleCancelRequest(userId, Number(id), { decision, reason })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xử lý yêu cầu hủy đơn: ${error.message}` })
  }
}

export const vendorOrderController = {
  getVendorOrders,
  updateOrderStatus,
  handleCancelRequest
}