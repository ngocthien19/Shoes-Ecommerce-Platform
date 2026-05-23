import { vendorReviewService } from '~/services/vendor/vendorReviewService'

// 1. GET: Lấy danh sách bình luận (Phân trang, tìm kiếm chữ, lọc sao, lọc phân loại)
const getVendorReviews = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { page, limit, type, rating, search, isActive, isReported } = req.query

    const result = await vendorReviewService.getVendorReviews(userId, {
      page, limit, type, rating, search, isActive, isReported
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy danh sách đánh giá: ${error.message}` })
  }
}

// 2. GET: Lấy thông tin chi tiết 1 bình luận (Hỗ trợ bốc mảng ảnh Cloudinary)
const getReviewDetail = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { type } = req.query

    if (!type) {
      return res.status(400).json({ message: 'Tham số loại đánh giá (type=product/store) là bắt buộc.' })
    }

    const result = await vendorReviewService.getReviewDetail(userId, Number(id), type)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy chi tiết đánh giá: ${error.message}` })
  }
}

// 3. PUT: Thay thế chức năng xóa bằng gửi đơn tố cáo lên Manager/Admin xử lý ẩn bài
const reportReview = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { type } = req.query
    const { reason } = req.body

    if (!type) {
      return res.status(400).json({ message: 'Tham số loại đánh giá (type) là bắt buộc để thực hiện báo cáo.' })
    }

    const result = await vendorReviewService.reportReview(userId, Number(id), type, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi gửi báo cáo khiếu nại đánh giá: ${error.message}` })
  }
}

// 4. PATCH gửi đơn tố cáo hàng loạt từ tích chọn Checkbox
const reportReviewsBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { type } = req.query
    const { reviewIds, reason } = req.body

    if (!type) {
      return res.status(400).json({ message: 'Tham số phân loại đánh giá (type=product/store) là bắt buộc.' })
    }

    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách mã đánh giá (reviewIds) phải là một mảng và không được trống.' })
    }

    // Chặn undefined cho lý do báo cáo vi phạm, ép về câu lý do mặc định sạch sẽ nếu trống
    const finalReason = reason !== undefined ? reason : 'Nội dung đánh giá không phù hợp hoặc chứa từ ngữ vi phạm tiêu chuẩn cộng đồng.'

    const result = await vendorReviewService.reportReviewsBulk(userId, reviewIds, type, finalReason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi gửi báo cáo khiếu nại hàng loạt đánh giá: ${error.message}` })
  }
}

export const vendorReviewController = {
  getVendorReviews,
  getReviewDetail,
  reportReview,
  reportReviewsBulk
}