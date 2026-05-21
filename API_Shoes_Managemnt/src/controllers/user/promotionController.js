import { promotionService } from '~/services/user/promotionService.js'

const applyPromotion = async (req, res) => {
  try {
    const { code, storeId, currentOrderValue } = req.body

    // Validate dữ liệu cơ bản
    if (!code || !currentOrderValue) {
      return res.status(400).json({ message: 'Mã code và tổng giá trị đơn hàng hiện tại là bắt buộc.' })
    }

    // Nếu khách mua hàng chung toàn sàn, không truyền storeId thì mặc định truyền null xuống
    const result = await promotionService.applyPromotion(
      code,
      storeId ? Number(storeId) : null,
      Number(currentOrderValue)
    )

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi áp dụng mã khuyến mãi: ${error.message}` })
  }
}

export const promotionController = {
  applyPromotion
}