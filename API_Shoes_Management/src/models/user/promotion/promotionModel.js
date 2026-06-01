import pool from '~/config/db'

// Tìm kiếm mã giảm giá còn hiệu lực
const getActivePromotionByCode = async (code, storeId) => {
  // Quét mã giảm giá: Có thể là mã chung của toàn sàn (store_id IS NULL)
  // HOẶC mã riêng của chính shop mà khách đang mua hàng (store_id = ?)
  const query = `
    SELECT id, store_id, name, discount_value, min_order_value, max_discount_amount, start_date, end_date
    FROM promotions
    WHERE name = ? 
      AND (store_id IS NULL OR store_id = ?) 
      AND is_active = TRUE 
      AND NOW() BETWEEN start_date AND end_date
  `
  const [rows] = await pool.execute(query, [code, storeId])
  return rows[0]
}

export const promotionModel = {
  getActivePromotionByCode
}