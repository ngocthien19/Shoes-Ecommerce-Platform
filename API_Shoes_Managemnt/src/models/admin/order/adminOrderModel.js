import pool from '~/config/db'
import { ORDER_STATUS, PAYMENT_STATUS } from '~/utils/constants'

// 1. Admin lấy danh sách đơn hàng toàn sàn (Phân trang + Bộ lọc trạng thái, mã đơn, thời gian)
const getAllOrdersSystem = async ({ status, searchOrderId, startDate, endDate, limit, offset }) => {
  let query = `
    SELECT o.id AS order_id, o.user_id, o.store_id, o.total_amount, o.discount_amount,
           o.status, o.payment_status, o.payment_method, o.created_at,
           s.name AS store_name, u.fullname AS buyer_name
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.id
    INNER JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `
  const queryParams = []

  if (status) {
    query += ' AND o.status = ?'
    queryParams.push(status)
  }
  if (searchOrderId) {
    query += ' AND o.id = ?'
    queryParams.push(Number(searchOrderId))
  }
  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số đơn hàng phục vụ tính toán phân trang ở Frontend
const countAllOrdersSystem = async ({ status, searchOrderId, startDate, endDate }) => {
  let query = 'SELECT COUNT(*) AS total FROM orders WHERE 1=1'
  const queryParams = []

  if (status) {
    query += ' AND status = ?'
    queryParams.push(status)
  }
  if (searchOrderId) {
    query += ' AND id = ?'
    queryParams.push(Number(searchOrderId))
  }
  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0]?.total || 0
}

// 3. Xem chi tiết một đơn hàng toàn cục (Bốc kèm thông tin người mua, người bán, và mảng giày)
const getOrderDetailSystem = async (orderId) => {
  const orderQuery = `
    SELECT o.*, s.name AS store_name, u.fullname AS buyer_name, u.email AS buyer_email
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.id
    INNER JOIN users u ON o.user_id = u.id
    WHERE o.id = ?
  `
  const [orderRows] = await pool.execute(orderQuery, [orderId])
  const order = orderRows[0]

  if (!order) return null

  const itemsQuery = `
    SELECT oi.id AS item_id, oi.variant_id, oi.quantity, oi.price, 
           pv.size, pv.color, p.name AS product_name
    FROM order_items oi
    INNER JOIN product_variants pv ON oi.variant_id = pv.id
    INNER JOIN products p ON pv.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [items] = await pool.execute(itemsQuery, [orderId])
  order.items = items

  return order
}

// 4. Ép hủy đơn + Lật trạng thái hoàn tiền + Hoàn kho
const forceCancelOrderTransaction = async (orderId, adminNote) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Khóa dòng đơn hàng để tránh xung đột dữ liệu (Race Condition)
    const [orderRows] = await connection.execute(
      'SELECT payment_status FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    )
    const order = orderRows[0]
    if (!order) throw new Error('Đơn hàng không tồn tại trên hệ thống.')

    // Nếu đơn hàng cũ đã paid -> lật sang 'refunded' để kế toán đối soát hoàn ngoài
    const nextPaymentStatus = order.payment_status === PAYMENT_STATUS.PAID
      ? PAYMENT_STATUS.REFUNDED
      : order.payment_status

    // A. Cập nhật trạng thái đơn về CANCELLED và lật payment_status sang trạng thái mới kèm ghi chú Admin
    await connection.execute(
      `UPDATE orders 
       SET status = ?, payment_status = ?, cancel_reason = ? 
       WHERE id = ?`,
      [ORDER_STATUS.CANCELLED, nextPaymentStatus, `[ADMIN FORCE CANCEL] ${adminNote}`, orderId]
    )

    // B. Lấy danh sách sản phẩm trong đơn để tiến hành hoàn trả kho
    const [items] = await connection.execute(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    )

    // C. Cộng trả lại số lượng tồn kho (stock) cho từng biến thể giày trên sàn
    for (const item of items) {
      await connection.execute(
        'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.variant_id]
      )
    }

    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Thống kê nhanh số liệu đơn hàng toàn sàn phục vụ 5 thẻ Widget đầu trang Admin
const getOrdersOverviewStatsSystem = async () => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processingOrders,
      SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shippedOrders,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders,
      COUNT(id) AS totalOrders -- Tổng số đơn hàng từ trước đến nay toàn hệ thống
    FROM orders
  `
  const [rows] = await pool.execute(query)

  return {
    pendingOrders: Number(rows[0].pendingOrders) || 0,
    processingOrders: Number(rows[0].processingOrders) || 0,
    shippedOrders: Number(rows[0].shippedOrders) || 0,
    deliveredOrders: Number(rows[0].deliveredOrders) || 0,
    cancelledOrders: Number(rows[0].cancelledOrders) || 0,
    totalOrders: Number(rows[0].totalOrders) || 0
  }
}

export const adminOrderModel = {
  getAllOrdersSystem,
  countAllOrdersSystem,
  getOrderDetailSystem,
  forceCancelOrderTransaction,
  getOrdersOverviewStatsSystem
}