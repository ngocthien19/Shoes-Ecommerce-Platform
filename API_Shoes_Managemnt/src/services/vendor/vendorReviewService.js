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
  const reviewType = filters.type || 'product' // Mặc định là 'product', ngoài ra có 'store'

  const filterParams = {
    search: filters.search || null,
    rating: filters.rating || null,
    limit,
    offset
  }

  let reviews = []
  let totalItems = 0

  // Chạy song song lấy số liệu tổng quan (Widget) phục vụ đầu trang
  const [overviewStats] = await Promise.all([
    vendorReviewModel.getReviewsOverviewStats(storeId)
  ])

  // Rẽ nhánh xử lý dựa vào phân loại Tab đầu trang của Frontend
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
const reportReview = async (userId, reviewId, reviewType, reportReason) => {
  const storeId = await getVerifiedStoreId(userId)
  let isReported = false

  if (!reportReason || reportReason.trim() === '') {
    throw new Error('Vui lòng cung cấp lý do bạn báo cáo vi phạm bình luận này.')
  }

  if (reviewType === 'product') {
    isReported = await vendorReviewModel.reportProductReview(reviewId, storeId, reportReason)
  } else if (reviewType === 'store') {
    isReported = await vendorReviewModel.reportStoreReview(reviewId, storeId, reportReason)
  } else {
    throw new Error('Loại đánh giá không hợp lệ để thực hiện gửi khiếu nại.')
  }

  if (!isReported) {
    throw new Error('Gửi báo cáo thất bại. Bản ghi không tồn tại hoặc không thuộc quyền quản lý của shop.')
  }

  return { message: 'Đã gửi báo cáo vi phạm lên ban quản trị hệ thống. Nội dung đang được kiểm duyệt.' }
}

export const vendorReviewService = {
  getVendorReviews,
  getReviewDetail,
  reportReview
}