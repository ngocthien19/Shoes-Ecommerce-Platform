import { vendorPromotionService } from '/services/vendor/vendorPromotionService'

const createPromotion = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date, is_active } = req.body

    const result = await vendorPromotionService.createPromotion(userId, {
      name, description,
      discountValue: discount_value,
      minOrderValue: min_order_value,
      maxDiscountAmount: max_discount_amount,
      startDate: start_date,
      endDate: end_date,
      isActive: is_active
    })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tạo khuyến mãi: ${error.message}` })
  }
}

const updatePromotion = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { name, description, discount_value, min_order_value, max_discount_amount, start_date, end_date, is_active } = req.body

    const result = await vendorPromotionService.updatePromotion(Number(id), userId, {
      name, description,
      discountValue: discount_value,
      minOrderValue: min_order_value,
      maxDiscountAmount: max_discount_amount,
      startDate: start_date,
      endDate: end_date,
      isActive: is_active
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi sửa khuyến mãi: ${error.message}` })
  }
}

const deletePromotion = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params

    const result = await vendorPromotionService.deletePromotion(Number(id), userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xóa khuyến mãi: ${error.message}` })
  }
}

const getPromotionById = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params

    const result = await vendorPromotionService.getPromotionById(Number(id), userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi lấy chi tiết khuyến mãi: ${error.message}` })
  }
}

const getVendorPromotions = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { page, limit, search, is_active, start_date, end_date, sortBy, sortOrder } = req.query

    const result = await vendorPromotionService.getVendorPromotions(userId, {
      page, limit, search,
      isActive: is_active,
      startDate: start_date,
      endDate: end_date,
      sortBy, sortOrder
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tải danh sách khuyến mãi: ${error.message}` })
  }
}

// 6. PATCH: Checkbox thay đổi trạng thái hoạt động hàng loạt
const togglePromotionsActiveBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { promotionIds, isActive } = req.body
    const result = await vendorPromotionService.togglePromotionsActiveBulk(userId, promotionIds, isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý trạng thái khuyến mãi loạt: ${error.message}` })
  }
}

// 7. DELETE: Checkbox xóa hàng loạt khuyến mãi
const deletePromotionsBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { promotionIds } = req.body
    const result = await vendorPromotionService.deletePromotionsBulk(userId, promotionIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xóa hàng loạt khuyến mãi: ${error.message}` })
  }
}

// 8. PATCH: Nút gạt trạng thái đơn lẻ cuối dòng Table
const togglePromotionActiveSingle = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { isActive } = req.body
    const result = await vendorPromotionService.togglePromotionActiveSingle(userId, id, isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật trạng thái khuyến mãi: ${error.message}` })
  }
}

export const vendorPromotionController = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getVendorPromotions,
  togglePromotionsActiveBulk,
  deletePromotionsBulk,
  togglePromotionActiveSingle
}