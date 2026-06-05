import pool from '~/config/db'

// 1. Kiểm tra số lượng tồn kho (stock) thực tế của một biến thể
const checkVariantStock = async (variantId) => {
  const query = 'SELECT stock FROM product_variants WHERE id = ?'
  const [rows] = await pool.execute(query, [variantId])
  return rows[0] ? rows[0].stock : 0
}

// 2. Tìm xem biến thể này đã tồn tại trong giỏ hàng của User chưa
const findCartItem = async (userId, variantId) => {
  const query = 'SELECT id, quantity FROM cart WHERE user_id = ? AND variant_id = ?'
  const [rows] = await pool.execute(query, [userId, variantId])
  return rows[0]
}

// 3. Thêm mới một dòng sản phẩm vào giỏ hàng
const addToCart = async (userId, variantId, quantity) => {
  const query = 'INSERT INTO cart (user_id, variant_id, quantity) VALUES (?, ?, ?)'
  const [result] = await pool.execute(query, [userId, variantId, quantity])
  return result
}

// 4. Cập nhật cộng dồn số lượng (hoặc sửa đổi trực tiếp)
const updateCartQuantity = async (userId, variantId, quantity) => {
  const query = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND variant_id = ?'
  const [result] = await pool.execute(query, [quantity, userId, variantId])
  return result
}

// 5. Lấy danh sách giỏ hàng của User kèm thông tin chi tiết sản phẩm để hiển thị UI
const getCartByUserId = async (userId) => {
  const query = `
    SELECT 
      c.id AS cart_id,
      c.variant_id,
      c.quantity AS cart_quantity,
      pv.size,
      pv.color,
      pv.stock AS current_stock,
      p.id AS product_id,
      p.name AS product_name,
      p.slug AS product_slug,
      p.price AS base_price,
      p.images,
      s.id AS store_id,
      s.name AS store_name
    FROM cart c
    INNER JOIN product_variants pv ON c.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    INNER JOIN stores s ON p.store_id = s.id
    WHERE c.user_id = ?
    ORDER BY c.id DESC
  `
  const [rows] = await pool.execute(query, [userId])
  return rows
}

// 6. Xóa một item khỏi giỏ hàng
const removeMultipleFromCart = async (userId, variantIds) => {
  if (!variantIds || variantIds.length === 0) return { affectedRows: 0 }

  const query = 'DELETE FROM cart WHERE user_id = ? AND variant_id IN (?)'

  const [result] = await pool.query(query, [userId, variantIds])
  return result
}

export const cartModel = {
  checkVariantStock,
  findCartItem,
  addToCart,
  updateCartQuantity,
  getCartByUserId,
  removeFromCart: removeMultipleFromCart
}