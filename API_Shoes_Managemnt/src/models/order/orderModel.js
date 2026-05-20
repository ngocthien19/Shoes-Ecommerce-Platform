import pool from '~/config/db'

// 1. Lấy thông tin chi tiết các item trong giỏ kèm giá, tồn kho và store_id để chuẩn bị check đơn
const getCartItemsForCheckout = async (userId) => {
  const query = `
    SELECT c.variant_id, c.quantity, pv.stock, pv.product_id, p.price, p.store_id
    FROM cart c
    INNER JOIN product_variants pv ON c.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    WHERE c.user_id = ?
  `
  const [rows] = await pool.execute(query, [userId])
  return rows
}

// 2. Tạo một đơn hàng mới
const createOrder = async (connection, { userId, storeId, totalAmount, shippingAddress }) => {
  const query = `
    INSERT INTO orders (user_id, store_id, total_amount, shipping_address, status, payment_status)
    VALUES (?, ?, ?, ?, 'pending', 'unpaid')
  `
  const [result] = await connection.execute(query, [userId, storeId, totalAmount, shippingAddress])
  return result.insertId
}

// 3. Tạo chi tiết mặt hàng trong đơn (order_items)
const createOrderItem = async (connection, { orderId, variantId, quantity, price }) => {
  const query = `
    INSERT INTO order_items (order_id, variant_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `
  await connection.execute(query, [orderId, variantId, quantity, price])
}

// 4. Trừ số lượng kho của biến thể giày
const decreaseVariantStock = async (connection, variantId, quantity) => {
  const query = 'UPDATE product_variants SET stock = stock - ? WHERE id = ?'
  await connection.execute(query, [quantity, variantId])
}

// 5. Tăng số lượng đã bán (sold) ở bảng sản phẩm tổng quát
const increaseProductSold = async (connection, productId, quantity) => {
  const query = 'UPDATE products SET sold = sold + ? WHERE id = ?'
  await connection.execute(query, [quantity, productId])
}

// 6. Dọn sạch giỏ hàng của User sau khi đặt thành công
const clearUserCart = async (connection, userId) => {
  const query = 'DELETE FROM cart WHERE user_id = ?'
  await connection.execute(query, [userId])
}

export const orderModel = {
  getCartItemsForCheckout,
  createOrder,
  createOrderItem,
  decreaseVariantStock,
  increaseProductSold,
  clearUserCart
}