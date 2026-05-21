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
    const { page, limit, search, is_active, start_date, end_date } = req.query

    const result = await vendorPromotionService.getVendorPromotions(userId, {
      page, limit, search,
      isActive: is_active,
      startDate: start_date,
      endDate: end_date
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tải danh sách khuyến mãi: ${error.message}` })
  }
}

export const vendorPromotionController = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getVendorPromotions
}