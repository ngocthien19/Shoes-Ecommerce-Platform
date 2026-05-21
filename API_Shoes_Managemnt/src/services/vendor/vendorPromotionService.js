import { vendorPromotionModel } from '~/models/vendor/promotion/vendorPromotionModel.js'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorPromotionModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký hoặc sở hữu cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chưa kích hoạt.')
  return store.id
}

// Thêm khuyến mãi
const createPromotion = async (userId, data) => {
  const storeId = await getVerifiedStoreId(userId)

  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.')
  }

  const percent = Number(data.discountValue)
  if (isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Giá trị giảm giá theo phần trăm phải nằm trong khoảng từ 1 đến 100.')
  }

  // CHUẨN HÓA MÃ: Chuyển hết thành chữ viết hoa, loại bỏ khoảng trắng dư thừa để User dễ nhập
  if (data.name) {
    data.name = data.name.trim().toUpperCase().replace(/\s+/g, '')
  } else {
    throw new Error('Mã giảm giá không được để trống.')
  }

  const promotionId = await vendorPromotionModel.createPromotion(storeId, data)
  return { message: 'Tạo mã khuyến mãi thành công.', promotionId }
}

// Sửa khuyến mãi
const updatePromotion = async (id, userId, data) => {
  const storeId = await getVerifiedStoreId(userId)

  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.')
  }

  const percent = Number(data.discountValue)
  if (isNaN(percent) || percent <= 0 || percent > 100) {
    throw new Error('Giá trị giảm giá theo phần trăm phải nằm trong khoảng từ 1 đến 100.')
  }

  // CHUẨN HÓA MÃ KHI SỬA
  if (data.name) {
    data.name = data.name.trim().toUpperCase().replace(/\s+/g, '')
  } else {
    throw new Error('Mã giảm giá không được để trống.')
  }

  const isUpdated = await vendorPromotionModel.updatePromotion(id, storeId, data)
  if (!isUpdated) throw new Error('Khuyến mãi không tồn tại hoặc không thuộc quyền sở hữu của Shop.')
  return { message: 'Cập nhật khuyến mãi thành công.' }
}

// Xóa khuyến mãi
const deletePromotion = async (id, userId) => {
  const storeId = await getVerifiedStoreId(userId)
  const isDeleted = await vendorPromotionModel.deletePromotion(id, storeId)
  if (!isDeleted) throw new Error('Khuyến mãi không tồn tại hoặc không thuộc quyền sở hữu của Shop.')
  return { message: 'Xóa khuyến mãi thành công.' }
}

// Xem chi tiết khuyến mãi
const getPromotionById = async (id, userId) => {
  const storeId = await getVerifiedStoreId(userId)
  const promotion = await vendorPromotionModel.getPromotionById(id, storeId)
  if (!promotion) throw new Error('Không tìm thấy chương trình khuyến mãi yêu cầu.')
  return promotion
}

// Danh sách khuyến mãi phân trang + lọc tìm kiếm
const getVendorPromotions = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    limit,
    offset
  }

  // Chạy song song cả 3 câu lệnh truy vấn để tối ưu hiệu năng tối đa
  const [promotions, totalItems, overviewStats] = await Promise.all([
    vendorPromotionModel.getVendorPromotions(storeId, filterParams),
    vendorPromotionModel.countVendorPromotions(storeId, filterParams),
    vendorPromotionModel.getPromotionsOverviewStats(storeId)
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    promotions
  }
}

export const vendorPromotionService = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getVendorPromotions
}