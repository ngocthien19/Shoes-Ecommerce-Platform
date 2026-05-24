import pool from '~/config/db'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// A. Lấy danh sách sản phẩm toàn sàn kèm phân trang và đa bộ lọc
const getProductsForManager = async ({ search, categoryId, storeId, status, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT p.id, p.name AS product_name, p.slug, p.price, p.sold, p.is_active, p.status, p.created_at,
           s.name AS store_name, c.name AS category_name
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND p.category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (storeId) {
    query += ' AND p.store_id = ?'
    queryParams.push(Number(storeId))
  }
  if (status) {
    query += ' AND p.status = ?'
    queryParams.push(status)
  }

  // XỬ LÝ LOGIC SẮP XẾP AN TOÀN (WHITE-LIST VALIDATION)
  const allowSortFields = ['price', 'product_name', 'sold', 'created_at']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY p.${finalSortBy === 'product_name' ? 'name' : finalSortBy} ${finalSortOrder}`
  query += ' LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// B. Đếm tổng số sản phẩm thỏa mãn bộ lọc để phân trang chuẩn
const countProductsForManager = async ({ search, categoryId, storeId, status }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND p.category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (storeId) {
    query += ' AND p.store_id = ?'
    queryParams.push(Number(storeId))
  }
  if (status) {
    query += ' AND p.status = ?'
    queryParams.push(status)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// C. Cập nhật trạng thái kiểm duyệt đơn lẻ
const updateProductModerationStatus = async (productId, status) => {
  const isActiveTarget = (status === PRODUCT_MODERATION_STATUS.APPROVED) ? 1 : 0

  const query = 'UPDATE products SET status = ?, is_active = ? WHERE id = ?'
  const [result] = await pool.execute(query, [status, isActiveTarget, productId])
  return result.affectedRows
}
// D. Lấy thông tin chi tiết sản phẩm và email chủ shop phục vụ việc gửi thư cảnh báo
const getProductAndOwnerInfo = async (productId) => {
  const query = `
    SELECT p.name AS product_name, s.name AS store_name, u.fullname, u.email
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE p.id = ?
  `
  const [rows] = await pool.execute(query, [productId])
  return rows[0] || null
}

// E. Đếm thêm số lượng sản phẩm đang chờ phê duyệt lại (Pending Reapproval)
const getProductsOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS totalProducts,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedProducts,
      SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) AS bannedProducts,
      SUM(CASE WHEN status = 'pending_reapproval' THEN 1 ELSE 0 END) AS pendingReapprovalProducts
    FROM products
  `
  const [rows] = await pool.execute(query)
  return {
    totalProducts: Number(rows[0].totalProducts) || 0,
    approvedProducts: Number(rows[0].approvedProducts) || 0,
    bannedProducts: Number(rows[0].bannedProducts) || 0,
    pendingReapprovalProducts: Number(rows[0].pendingReapprovalProducts) || 0 // Thẻ số liệu mới cho Dashboard
  }
}

// Lấy chi tiết thông tin sản phẩm phục vụ trang soi của Manager
const getProductDetailForManager = async (productSlug) => {
  const query = `
    SELECT p.*, c.name AS category_name, s.name AS store_name, s.address AS store_address,
           s.balance AS store_balance, s.is_active AS store_is_active, s.created_at AS store_created_at,
           u.email AS owner_email, u.fullname AS owner_name
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON s.owner_id = u.id
    WHERE p.slug = ?
  `
  const [rows] = await pool.execute(query, [productSlug])
  return rows[0] || null
}

// F. Cập nhật trạng thái hàng loạt an toàn chống lỗi COM_STMT_EXECUTE (Dùng cho cả Duyệt loạt và Duyệt lẻ)
const updateProductsStatusBulk = async (productIds, status) => {
  const placeholders = productIds.map(() => '?').join(', ')

  const isActiveTarget = (status === PRODUCT_MODERATION_STATUS.APPROVED) ? 1 : 0

  const query = `UPDATE products SET status = ?, is_active = ? WHERE id IN (${placeholders})`

  const [result] = await pool.execute(query, [status, isActiveTarget, ...productIds])
  return result.affectedRows
}

// G. Lấy thông tin gửi Mail hàng loạt tương thích dấu chấm hỏi động
const getProductsAndOwnersInfoBulk = async (productIds) => {
  const placeholders = productIds.map(() => '?').join(', ')
  const query = `
    SELECT p.id AS product_id, p.name AS product_name, s.name AS store_name, u.fullname, u.email
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE p.id IN (${placeholders})
  `
  const [rows] = await pool.execute(query, productIds)
  return rows
}

export const managerProductModel = {
  getProductsForManager,
  countProductsForManager,
  updateProductModerationStatus,
  getProductAndOwnerInfo,
  getProductsOverviewStats,
  getProductDetailForManager,
  updateProductsStatusBulk,
  getProductsAndOwnersInfoBulk
}