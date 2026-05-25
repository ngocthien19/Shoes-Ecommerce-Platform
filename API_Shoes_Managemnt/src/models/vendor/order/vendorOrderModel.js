import pool from '~/config/db'
import { ORDER_STATUS } from '~/utils/constants'

// Lấy thông tin shop dựa vào owner_id của Vendor
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Lấy danh sách đơn hàng thuộc về Shop (Phân trang + Lọc trạng thái)
const getVendorOrders = async (storeId, { status, searchOrderId, paymentMethod, startDate, endDate, limit, offset }) => {
  let query = `
    SELECT id, user_id, total_amount, status, payment_status, payment_method, 
           shipping_address, cancel_reason, created_at
    FROM orders
    WHERE store_id = ?
  `
  const queryParams = [storeId]

  // A. Lọc theo trạng thái đơn hàng (Dropdown)
  if (status) {
    query += ' AND status = ?'
    queryParams.push(status)
  }

  // B. Tìm kiếm đích danh theo mã đơn hàng (Ô Tìm kiếm nhanh)
  if (searchOrderId) {
    query += ' AND id = ?'
    queryParams.push(Number(searchOrderId))
  }

  // C. Lọc theo phương thức thanh toán (Dropdown)
  if (paymentMethod) {
    query += ' AND payment_method = ?'
    queryParams.push(paymentMethod)
  }

  // D. Lọc theo khoảng thời gian đặt hàng (Bộ chọn ngày)
  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  // Sắp xếp đơn hàng mới nhất lên đầu và phân trang
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số đơn hàng của shop thỏa mãn các điều kiện lọc ở trên
const countVendorOrders = async (storeId, { status, searchOrderId, paymentMethod, startDate, endDate }) => {
  let query = 'SELECT COUNT(*) as total FROM orders WHERE store_id = ?'
  const queryParams = [storeId]

  if (status) {
    query += ' AND status = ?'
    queryParams.push(status)
  }
  if (searchOrderId) {
    query += ' AND id = ?'
    queryParams.push(Number(searchOrderId))
  }
  if (paymentMethod) {
    query += ' AND payment_method = ?'
    queryParams.push(paymentMethod)
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
  return rows[0].total
}

// Lấy chi tiết các mặt hàng giày trong đơn hàng từ bảng order_items và product_variants
const getOrderItemsByStore = async (orderId) => {
  const query = `
    SELECT oi.id, oi.variant_id, p.name, p.images, oi.quantity, oi.price, v.size, v.color
    FROM order_items oi
    JOIN product_variants v ON oi.variant_id = v.id
    JOIN products p ON v.product_id = p.id
    WHERE oi.order_id = ?
  `
  const [rows] = await pool.execute(query, [orderId])
  return rows
}

// 2. Cập nhật trạng thái vận đơn và ghi nhận lý do hủy nếu có
const updateOrderStatus = async (orderId, status, cancelReason = null) => {
  let query = 'UPDATE orders SET status = ?'
  const queryParams = [status]

  if (cancelReason !== null) {
    query += ', cancel_reason = ?'
    queryParams.push(cancelReason)
  }

  query += ' WHERE id = ?'
  queryParams.push(orderId)

  const [result] = await pool.execute(query, queryParams)
  return result
}

// Kiểm tra quyền sở hữu đơn hàng (Xác minh đơn này có đúng là đặt tại store này không)
const checkOrderOwnership = async (orderId, storeId) => {
  const query = 'SELECT id FROM orders WHERE id = ? AND store_id = ?'
  const [rows] = await pool.execute(query, [orderId, storeId])
  return rows.length > 0
}

// Lấy trạng thái hiện tại của một đơn hàng
const getOrderStatus = async (orderId) => {
  const query = 'SELECT status FROM orders WHERE id = ?'
  const [rows] = await pool.execute(query, [orderId])
  return rows[0] ? rows[0].status : null
}

// Thống kê nhanh các số liệu đơn hàng phục vụ 5 thẻ Widget ở đầu trang
const getOrdersOverviewStats = async (storeId) => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS pendingOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS processingOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS shippedOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS deliveredOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS cancelRequestedOrders,
      SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS cancelledOrders
    FROM orders
    WHERE store_id = ?
  `
  const [rows] = await pool.execute(query, [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCEL_REQUESTED,
    ORDER_STATUS.CANCELED,
    storeId
  ])

  return {
    pendingOrders: Number(rows[0].pendingOrders) || 0,
    processingOrders: Number(rows[0].processingOrders) || 0,
    shippedOrders: Number(rows[0].shippedOrders) || 0,
    deliveredOrders: Number(rows[0].deliveredOrders) || 0,
    cancelRequestedOrders: Number(rows[0].cancelRequestedOrders) || 0,
    cancelledOrders: Number(rows[0].cancelledOrders) || 0
  }
}

// Toàn bộ danh sách mã đơn hàng này có phải đều đặt tại Shop này không
const checkMultipleOrdersOwnership = async (orderIds, storeId) => {
  if (!orderIds || orderIds.length === 0) return false

  const query = 'SELECT COUNT(*) AS validCount FROM orders WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [orderIds, storeId])

  return rows[0].validCount === orderIds.length
}

// Cập nhật trạng thái hàng loạt cho mảng ID đơn hàng từ Checkbox
const updateOrderStatusBulk = async (orderIds, status, storeId) => {
  const query = 'UPDATE orders SET status = ? WHERE id IN (?) AND store_id = ?'
  const [result] = await pool.query(query, [status, orderIds, storeId])
  return result.affectedRows
}

// Hàm xử lý kết thúc đơn hàng: Lật trạng thái paid + Cộng tiền vào ví Store (Bọc trong Transaction)
const completeOrderAndCreditStore = async (orderId, storeId, totalAmount) => {
  const connection = await pool.getConnection()
  try {
    // 1. Khởi động Transaction
    await connection.beginTransaction()

    // 2. Lấy tỷ lệ hoa hồng (commission_rate) hiện tại của cửa hàng
    const [storeRows] = await connection.execute(
      'SELECT commission_rate FROM stores WHERE id = ?',
      [storeId]
    )
    if (storeRows.length === 0) throw new Error('Cửa hàng không tồn tại.')
    const commissionRate = Number(storeRows[0].commission_rate) || 10.00

    // 3. Tính toán dòng tiền thực tế Vendor nhận được sau khi trừ "tiền phế" của Admin
    const adminCommission = totalAmount * (commissionRate / 100)
    const vendorNetProfit = totalAmount - adminCommission

    // 4. Cập nhật đơn hàng sang delivered và payment_status sang paid
    await connection.execute(
      `UPDATE orders 
       SET status = 'delivered', payment_status = 'paid' 
       WHERE id = ?`,
      [orderId]
    )

    // 5. Bơm tiền thực nhận vào ví balance của Store
    await connection.execute(
      `UPDATE stores 
       SET balance = balance + ? 
       WHERE id = ?`,
      [vendorNetProfit, storeId]
    )

    // 6. Chốt đơn thành công, lưu lại mọi thay đổi vào DB
    await connection.commit()
    return { adminCommission, vendorNetProfit }
  } catch (error) {
    // Nếu có bất kỳ lỗi gì xảy ra, lập tức khôi phục lại dữ liệu ban đầu
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const vendorOrderModel = {
  getStoreByOwnerId,
  getVendorOrders,
  countVendorOrders,
  getOrderItemsByStore,
  updateOrderStatus,
  checkOrderOwnership,
  getOrderStatus,
  getOrdersOverviewStats,
  checkMultipleOrdersOwnership,
  updateOrderStatusBulk,
  completeOrderAndCreditStore
}