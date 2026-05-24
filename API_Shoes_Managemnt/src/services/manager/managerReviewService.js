import { managerReviewModel } from '~/models/manager/review/managerReviewModel'
import { REVIEW_TYPES } from '~/utils/constants'

// 1. Tải danh sách đơn khiếu nại kèm phân trang, tìm kiếm, lọc nâng cao và Widgets
const getReportedReviewsList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit
  const reviewType = filters.type || REVIEW_TYPES.PRODUCT

  const filterParams = {
    search: filters.search || null,
    rating: filters.rating || null,
    storeId: filters.storeId || null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    sortBy: filters.sortBy || null,
    sortOrder: filters.sortOrder || null,
    limit,
    offset
  }

  let reviews = []
  let totalItems = 0

  // Lấy thông số Widgets nạp lên đầu trang
  const [overviewStats] = await Promise.all([
    managerReviewModel.getManagerReviewsOverviewStats()
  ])

  // Rẽ nhánh xử lý mượt mà dựa vào hằng số toàn cục
  if (reviewType === REVIEW_TYPES.PRODUCT) {
    [reviews, totalItems] = await Promise.all([
      managerReviewModel.getReportedProductReviews(filterParams),
      managerReviewModel.countReportedProductReviews(filterParams)
    ])
  } else if (reviewType === REVIEW_TYPES.STORE) {
    [reviews, totalItems] = await Promise.all([
      managerReviewModel.getReportedStoreReviews(filterParams),
      managerReviewModel.countReportedStoreReviews(filterParams)
    ])
  } else {
    throw new Error('Loại khiếu nại (type) không hợp lệ. Chỉ chấp nhận \'product\' hoặc \'store\'.')
  }

  return {
    overview: overviewStats,
    pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page, limit },
    reviews
  }
}

// 2. Xem chi tiết thông tin một đơn tố cáo
const getReviewDetail = async (reviewId, reviewType) => {
  let review = null

  if (reviewType === REVIEW_TYPES.PRODUCT) {
    review = await managerReviewModel.getProductReviewDetail(reviewId)
  } else if (reviewType === REVIEW_TYPES.STORE) {
    review = await managerReviewModel.getStoreReviewDetail(reviewId)
  } else {
    throw new Error('Phân loại đánh giá không hợp lệ.')
  }

  if (!review) throw new Error('Không tìm thấy dữ liệu chi tiết của mã khiếu nại này.')
  return review
}

// 3. Xử lý giải quyết khiếu nại hàng loạt (Checkbox & Đơn lẻ)
const resolveReviewsBulk = async (reviewIds, reviewType, action) => {
  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    throw new Error('Danh sách ID đánh giá cần xử lý không hợp lệ.')
  }

  // Khớp lệnh hành động: accept = Ẩn hiển thị (is_active = false) | reject = Giữ bài (is_active = true)
  let isActiveTarget = true
  if (action === 'accept') isActiveTarget = false
  else if (action === 'reject') isActiveTarget = true
  else throw new Error('Hành động xử lý (action) không hợp lệ. Chỉ chấp nhận \'accept\' hoặc \'reject\'.')

  let affectedRows = 0

  if (reviewType === REVIEW_TYPES.PRODUCT) {
    affectedRows = await managerReviewModel.handleProductReviewsBulk(reviewIds, isActiveTarget)
  } else if (reviewType === REVIEW_TYPES.STORE) {
    affectedRows = await managerReviewModel.handleStoreReviewsBulk(reviewIds, isActiveTarget)
  } else {
    throw new Error('Loại đánh giá không hợp lệ để xử lý khớp lệnh.')
  }

  return {
    message: action === 'accept'
      ? `Đã chấp nhận khiếu nại, tiến hành ẨN hiển thị hoàn toàn ${affectedRows} đánh giá vi phạm.`
      : `Đã bác bỏ khiếu nại, GIỮ NGUYÊN hiển thị bình thường cho ${affectedRows} đánh giá.`
  }
}

export const managerReviewService = {
  getReportedReviewsList,
  getReviewDetail,
  resolveReviewsBulk
}