import { vendorReviewModel } from '~/models/vendor/review/vendorReviewModel'
import { REVIEW_TYPES, NOTIFICATION_TYPES } from '~/utils/constants'
import { userModel } from '~/models/user/userModel'
import { notificationService } from '~/services/notification/notificationService'

const getVerifiedStore = async (userId) => {
  const store = await vendorReviewModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký hoặc sở hữu cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chưa kích hoạt.')
  return store
}

// Lấy danh sách đánh giá phân trang, tìm kiếm văn bản và lọc theo số sao
const getVendorReviews = async (userId, filters) => {
  const store = await getVerifiedStore(userId)
  const storeId = store.id

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit
  const reviewType = filters.type || REVIEW_TYPES.PRODUCT

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
  if (reviewType === REVIEW_TYPES.PRODUCT) {
    [reviews, totalItems] = await Promise.all([
      vendorReviewModel.getProductReviews(storeId, filterParams),
      vendorReviewModel.countProductReviews(storeId, filterParams)
    ])
  } else if (reviewType === REVIEW_TYPES.STORE) {
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
  const store = await getVerifiedStore(userId)
  const storeId = store.id
  let review = null

  if (reviewType === REVIEW_TYPES.PRODUCT) {
    review = await vendorReviewModel.getProductReviewDetail(reviewId, storeId)
  } else if (reviewType === REVIEW_TYPES.STORE) {
    review = await vendorReviewModel.getStoreReviewDetail(reviewId, storeId)
  } else {
    throw new Error('Loại đánh giá không hợp lệ để lấy dữ liệu chi tiết.')
  }

  if (!review) throw new Error('Không tìm thấy bản ghi đánh giá hoặc bạn không có quyền xem.')
  return review
}

// Đệ trình đơn tố cáo, báo cáo vi phạm bình luận lên sàn quản trị
const reportReviewsBulk = async (userId, reviewIds, reviewType, reportReason) => {
  const store = await getVerifiedStore(userId)
  const storeId = store.id

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    throw new Error('Danh sách ID đánh giá không hợp lệ hoặc đang trống.')
  }

  if (!reportReason || reportReason.trim() === '') {
    throw new Error('Vui lòng cung cấp lý do bạn báo cáo vi phạm các bình luận này.')
  }

  let affectedRows = 0

  if (reviewType === REVIEW_TYPES.PRODUCT) {
    const isAllOwner = await vendorReviewModel.checkMultipleProductReviewsOwnership(reviewIds, storeId)
    if (!isAllOwner) throw new Error('Danh sách chứa đánh giá sản phẩm không thuộc quyền quản lý của shop bạn.')
    affectedRows = await vendorReviewModel.reportProductReviewsBulk(reviewIds, storeId, reportReason)
  } else if (reviewType === REVIEW_TYPES.STORE) {
    const isAllOwner = await vendorReviewModel.checkMultipleStoreReviewsOwnership(reviewIds, storeId)
    if (!isAllOwner) throw new Error('Danh sách chứa đánh giá cửa hàng không thuộc về shop bạn.')
    affectedRows = await vendorReviewModel.reportStoreReviewsBulk(reviewIds, storeId, reportReason)
  } else {
    throw new Error('Loại đánh giá không hợp lệ để thực hiện gửi khiếu nại hàng loạt.')
  }

  if (affectedRows === 0) {
    throw new Error('Gửi báo cáo thất bại. Không có bản ghi nào phù hợp được cập nhật.')
  }

  // BẮN THÔNG BÁO CHO TẤT CẢ MANAGER
  let logoUrl = ''
  try {
    const parsedLogo = store.logo ? (typeof store.logo === 'string' ? JSON.parse(store.logo) : store.logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (e) { console.log('Không parse được logo shop') }

  const managerIds = await userModel.getAllManagerIds()
  for (const managerId of managerIds) {
    await notificationService.createAndPushNotification({
      userId: managerId,
      title: 'Có đơn tố cáo đánh giá mới',
      content: JSON.stringify({
        message: `Gian hàng "${store.store_name}" vừa báo cáo vi phạm đối với ${affectedRows} đánh giá.`,
        image: logoUrl
      }),
      type: NOTIFICATION_TYPES.REVIEW_REPORTED,
      referenceId: store.id
    }).catch(err => console.error(err))
  }

  return { message: `Đã gửi báo cáo vi phạm thành công cho ${affectedRows} đánh giá lên ban quản trị hệ thống.` }
}

// 4. Đệ trình đơn tố cáo đơn lẻ (Tối ưu bằng cách tái sử dụng hàm Bulk)
const reportReview = async (userId, reviewId, reviewType, reportReason) => {
  return await reportReviewsBulk(userId, [Number(reviewId)], reviewType, reportReason)
}

// 5. Gửi yêu cầu xin mở lại đánh giá bị khóa
const requestReviewsReopenBulk = async (userId, reviewIds, type, reason) => {
  const store = await getVerifiedStore(userId)
  const storeId = store.id

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    throw new Error('Danh sách mã đánh giá (reviewIds) không hợp lệ hoặc trống.')
  }

  const finalReason = reason?.trim() ? reason : 'Giải trình: Gian hàng đã xử lý xong khiếu nại với khách, mong Ban quản trị kiểm tra và hiển thị lại đánh giá này.'
  let affectedRows = 0

  if (type === REVIEW_TYPES.PRODUCT) {
    affectedRows = await vendorReviewModel.requestProductReviewReopenBulk(reviewIds, storeId, finalReason)
  } else if (type === REVIEW_TYPES.STORE) {
    affectedRows = await vendorReviewModel.requestStoreReviewReopenBulk(reviewIds, storeId, finalReason)
  } else {
    throw new Error('Phân loại đánh giá không hợp lệ. Chỉ chấp nhận \'product\' hoặc \'store\'.')
  }

  if (affectedRows === 0) {
    throw new Error('Gửi yêu cầu thất bại. Các đánh giá được chọn có thể không bị ẩn hoặc đang trong trạng thái chờ duyệt sẵn rồi.')
  }

  // BẮN THÔNG BÁO XIN CỨU XÉT CHO TẤT CẢ MANAGER
  let logoUrl = ''
  try {
    const parsedLogo = store.logo ? (typeof store.logo === 'string' ? JSON.parse(store.logo) : store.logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (e) { console.log('Không parse được logo shop') }

  const managerIds = await userModel.getAllManagerIds()
  for (const managerId of managerIds) {
    await notificationService.createAndPushNotification({
      userId: managerId,
      title: 'Yêu cầu mở lại đánh giá bị ẩn',
      content: JSON.stringify({
        message: `Gian hàng "${store.store_name}" vừa xin mở lại ${affectedRows} đánh giá.`,
        image: logoUrl
      }),
      type: NOTIFICATION_TYPES.REVIEW_REOPEN_REQUESTED,
      referenceId: store.id
    }).catch(err => console.error(err))
  }

  return {
    message: `Đã gửi đơn khiếu nại mở lại thành công cho ${affectedRows} đánh giá bị ẩn lên Ban quản trị sàn.`
  }
}

export const vendorReviewService = {
  getVendorReviews,
  getReviewDetail,
  reportReview,
  reportReviewsBulk,
  requestReviewsReopenBulk
}