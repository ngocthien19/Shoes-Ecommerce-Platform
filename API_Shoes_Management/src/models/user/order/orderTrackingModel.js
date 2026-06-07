import pool from '~/config/db'

// 1. USER lấy lịch sử đơn hàng (Lấy thêm thông tin người nhận và tiền giảm giá)
const getOrderHistoryByUserId = async (userId) => {
  const query = `
    SELECT o.id AS order_id, o.store_id, o.recipient_name, o.recipient_phone, 
           o.total_amount, o.discount_amount, o.shipping_address, 
           o.status, o.payment_status, o.payment_method, o.created_at,
           o.applied_voucher,
           s.name AS store_name
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `
  const [orders] = await pool.execute(query, [userId])
  return orders
}

// 2. USER: Lấy chi tiết các đôi giày nằm trong đơn hàng đó để hiển thị lên UI
const getOrderItemsByOrderId = async (orderId) => {
  const query = `
    SELECT oi.id AS item_id, oi.quantity, oi.price, pv.size, pv.color, p.name AS product_name, p.images
    FROM order_items oi
    INNER JOIN product_variants pv ON oi.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [items] = await pool.execute(query, [orderId])
  return items
}

// 3. USER: Tìm thông tin một đơn hàng (Bổ sung đầy đủ các trường dữ liệu bọc lót đối soát)
const getOrderById = async (orderId) => {
  const query = 'SELECT * FROM orders WHERE id = ?'
  const [rows] = await pool.execute(query, [orderId])
  return rows[0]
}

// 4. USER: Cập nhật trạng thái khi USER bấm hủy đơn
const updateOrderStatus = async (orderId, status) => {
  const query = 'UPDATE orders SET status = ? WHERE id = ?'
  const [result] = await pool.execute(query, [status, orderId])
  return result
}

// 5. HỆ THỐNG (CRON JOB): Tự động xác nhận đơn hàng sau 30 phút
const autoConfirmOrders = async () => {
  const query = `
    UPDATE orders 
    SET status = 'processing' 
    WHERE status = 'pending' 
    AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 30
  `
  const [result] = await pool.execute(query)
  return result.affectedRows
}

// 6. Rút yêu cầu hủy đơn hàng
const withdrawCancelOrder = async (orderId) => {
  const query = 'UPDATE orders SET status = \'processing\' WHERE id = ?'
  const [result] = await pool.execute(query, [orderId])
  return result
}

export const orderTrackingModel = {
  getOrderHistoryByUserId,
  getOrderItemsByOrderId,
  getOrderById,
  updateOrderStatus,
  autoConfirmOrders,
  withdrawCancelOrder
}