import { vendorReviewModel } from '~/models/vendor/review/vendorReviewModel'

// Hàm kiểm tra quyền hạn tài khoản Shop
const getVerifiedStoreId = async (userId) => {
  const store = await vendorReviewModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký hoặc sở hữu cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chưa kích hoạt.')
  return store.id
}

// Lấy danh sách đánh giá phân trang, tìm kiếm văn bản và lọc theo số sao
const getVendorReviews = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit
  const reviewType = filters.type || 'product'

  // Gom các tham số bộ lọc bổ sung trường mới
  const filterParams = {
    search: filters.search || null,
    rating: filters.rating || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    isReported: filters.isReported !== undefined ? filters.isReported : null,
    limit,
    offset
  }

  let reviews = []
  let totalItems = 0

  const [overviewStats] = await Promise.all([
    vendorReviewModel.getReviewsOverviewStats(storeId)
  ])

  // Rẽ nhánh xử lý dựa vào phân loại Tab
  if (reviewType === 'product') {
    [reviews, totalItems] = await Promise.all([
      vendorReviewModel.getProductReviews(storeId, filterParams),
      vendorReviewModel.countProductReviews(storeId, filterParams)
    ])
  } else if (reviewType === 'store') {
    [reviews, totalItems] = await Promise.all([
      vendorReviewModel.getStoreReviews(storeId, filterParams),
      vendorReviewModel.countStoreReviews(storeId, filterParams)
    ])
  } else {
    throw new Error('Loại đánh giá (type) không hợp lệ. Chỉ chấp nhận product hoặc store.')
  }

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    reviews
  }
}

// Xem chi tiết một đánh giá (Sản phẩm hoặc Cửa hàng)
const getReviewDetail = async (userId, reviewId, reviewType) => {
  const storeId = await getVerifiedStoreId(userId)
  let review = null

  if (reviewType === 'product') {
    review = await vendorReviewModel.getProductReviewDetail(reviewId, storeId)
  } else if (reviewType === 'store') {
    review = await vendorReviewModel.getStoreReviewDetail(reviewId, storeId)
  } else {
    throw new Error('Loại đánh giá không hợp lệ để lấy dữ liệu chi tiết.')
  }

  if (!review) throw new Error('Không tìm thấy bản ghi đánh giá hoặc bạn không có quyền xem.')
  return review
}

// Đệ trình đơn tố cáo, báo cáo vi phạm bình luận lên sàn quản trị
const reportReviewsBulk = async (userId, reviewIds, reviewType, reportReason) => {
  const storeId = await getVerifiedStoreId(userId)

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    throw new Error('Danh sách ID đánh giá không hợp lệ hoặc đang trống.')
  }

  if (!reportReason || reportReason.trim() === '') {
    throw new Error('Vui lòng cung cấp lý do bạn báo cáo vi phạm các bình luận này.')
  }

  let affectedRows = 0

  if (reviewType === 'product') {
    // Kiểm tra tính chính chủ hàng loạt của mảng ID review sản phẩm
    const isAllOwner = await vendorReviewModel.checkMultipleProductReviewsOwnership(reviewIds, storeId)
    if (!isAllOwner) throw new Error('Danh sách chứa đánh giá sản phẩm không thuộc quyền quản lý của shop bạn.')

    // Thực thi cập nhật cờ hàng loạt dưới DB
    affectedRows = await vendorReviewModel.reportProductReviewsBulk(reviewIds, storeId, reportReason)

  } else if (reviewType === 'store') {
    // Kiểm tra tính chính chủ hàng loạt của mảng ID review cửa hàng
    const isAllOwner = await vendorReviewModel.checkMultipleStoreReviewsOwnership(reviewIds, storeId)
    if (!isAllOwner) throw new Error('Danh sách chứa đánh giá cửa hàng không thuộc về shop bạn.')

    // Thực thi cập nhật cờ hàng loạt dưới DB
    affectedRows = await vendorReviewModel.reportStoreReviewsBulk(reviewIds, storeId, reportReason)

  } else {
    throw new Error('Loại đánh giá không hợp lệ để thực hiện gửi khiếu nại hàng loạt.')
  }

  if (affectedRows === 0) {
    throw new Error('Gửi báo cáo thất bại. Không có bản ghi nào phù hợp được cập nhật.')
  }

  return { message: `Đã gửi báo cáo vi phạm thành công cho ${affectedRows} đánh giá lên ban quản trị hệ thống.` }
}

// 4. Đệ trình đơn tố cáo đơn lẻ (Tối ưu bằng cách tái sử dụng hàm Bulk)
const reportReview = async (userId, reviewId, reviewType, reportReason) => {
  return await reportReviewsBulk(userId, [Number(reviewId)], reviewType, reportReason)
}

export const vendorReviewService = {
  getVendorReviews,
  getReviewDetail,
  reportReview,
  reportReviewsBulk
}