import { vendorReviewService } from '~/services/vendor/vendorReviewService'

// 1. GET: Lấy danh sách bình luận (Phân trang, tìm kiếm chữ, lọc sao, lọc phân loại)
const getVendorReviews = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { page, limit, type, rating, search } = req.query

    const result = await vendorReviewService.getVendorReviews(userId, {
      page, limit, type, rating, search
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

export const vendorReviewController = {
  getVendorReviews,
  getReviewDetail,
  reportReview
}