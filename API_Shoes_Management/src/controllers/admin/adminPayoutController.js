import { adminPayoutService } from '~/services/admin/adminPayoutService'

// 1. GET: Lấy danh sách lệnh rút tiền toàn sàn
const getPayoutList = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query
    const result = await adminPayoutService.getPayoutList({ page, limit, status, search })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách lệnh rút tiền: ${error.message}` })
  }
}

// 2. GET SINGLE: Lấy thông tin chi tiết của 1 lệnh rút tiền cụ thể dựa vào ID từ URL
const getPayoutDetail = async (req, res) => {
  try {
    const { id } = req.params
    const result = await adminPayoutService.getPayoutDetail(id)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải chi tiết lệnh rút tiền: ${error.message}` })
  }
}

// 3. PUT: Phê duyệt hoặc Từ chối lệnh rút tiền đơn lẻ
const processPayout = async (req, res) => {
  try {
    const { id } = req.params
    const { targetStatus, adminNote } = req.body

    const result = await adminPayoutService.processPayout(id, { targetStatus, adminNote })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi phê duyệt lệnh rút: ${error.message}` })
  }
}

export const adminPayoutController = {
  getPayoutList,
  getPayoutDetail,
  processPayout
}