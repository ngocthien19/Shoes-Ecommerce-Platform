import { managerReviewService } from '~/services/manager/managerReviewService'
import { REVIEW_TYPES } from '~/utils/constants'

// 1. GET: Lấy danh sách đánh giá bị tố cáo + Phân trang + Lọc + Widgets
const getReportedReviews = async (req, res) => {
  try {
    const { page, limit, type, rating, search, storeId, startDate, endDate, sortBy, sortOrder } = req.query

    // 🌟 Đã bọc thêm validate type ngay tại danh sách để chặn request bậy bạ làm hỏng SQL ngầm
    if (type && !Object.values(REVIEW_TYPES).includes(type)) {
      return res.status(400).json({ message: 'Tham số phân loại \'type\' không hợp lệ. Chỉ chấp nhận product hoặc store.' })
    }

    const result = await managerReviewService.getReportedReviewsList({
      page, limit, type, rating, search, storeId, startDate, endDate, sortBy, sortOrder
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách tố cáo: ${error.message}` })
  }
}

// 2. GET: Xem chi tiết 1 bình luận bị tố cáo để phục vụ đối soát
const getReviewDetail = async (req, res) => {
  try {
    const { id } = req.params
    const { type } = req.query

    if (!Object.values(REVIEW_TYPES).includes(type)) {
      return res.status(400).json({ message: 'Tham số phân loại \'type\' không hợp lệ hoặc đang thiếu.' })
    }

    const result = await managerReviewService.getReviewDetail(Number(id), type)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết đơn tố cáo: ${error.message}` })
  }
}

// 3. PATCH: Xử lý phân xử khiếu nại hàng loạt (Duyệt ẩn / Bác bỏ đơn từ Checkbox)
const resolveReviewsBulk = async (req, res) => {
  try {
    const { type } = req.query
    const { reviewIds, action } = req.body

    if (!Object.values(REVIEW_TYPES).includes(type)) {
      return res.status(400).json({ message: 'Tham số phân loại \'type\' không hợp lệ. Chỉ chấp nhận product hoặc store.' })
    }

    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Hành động \'action\' không hợp lệ. Chỉ chấp nhận \'accept\' hoặc \'reject\'.' })
    }

    const result = await managerReviewService.resolveReviewsBulk(reviewIds, type, action)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi phân xử đánh giá: ${error.message}` })
  }
}

export const managerReviewController = {
  getReportedReviews,
  getReviewDetail,
  resolveReviewsBulk
}