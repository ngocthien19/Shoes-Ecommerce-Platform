import pool from '~/config/db'
import { ROLE_ID } from '~/utils/constants' // 🌟 MỚI: Gọi bộ hằng số hệ thống

// 1. Lấy danh sách Store toàn sàn (Phân trang + Tìm kiếm + Bộ lọc trạng thái + Sắp xếp động)
const getStoresForAdmin = async ({ search, isActive, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT id, name, owner_id, balance, rating_average, commission_rate, is_active, created_at 
    FROM stores 
    WHERE 1=1
  `
  const queryParams = []

  if (search) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(isActive)
  }

  // Sắp xếp động an toàn
  const validSortColumns = ['balance', 'rating_average', 'commission_rate', 'created_at']
  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC'
  const column = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
  query += ` ORDER BY ${column} ${order} LIMIT ? OFFSET ?`

  queryParams.push(limit, offset)

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số Store phục vụ phân trang
const countStoresForAdmin = async ({ search, isActive }) => {
  let query = 'SELECT COUNT(*) AS total FROM stores WHERE 1=1'
  const queryParams = []

  if (search) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(isActive)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Lấy số liệu Widgets tổng quan ở đầu trang Store Manager
const getStoresOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS totalStores,
      SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS activeStores,
      SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS bannedStores,
      IFNULL(SUM(balance), 0) AS totalSinkingBalance
    FROM stores
  `
  const [rows] = await pool.execute(query)
  return {
    totalStores: Number(rows[0].totalStores) || 0,
    activeStores: Number(rows[0].activeStores) || 0,
    bannedStores: Number(rows[0].bannedStores) || 0,
    totalSinkingBalance: Number(rows[0].totalSinkingBalance) || 0
  }
}

// 4. Xem chi tiết thông tin 1 Store
const getStoreDetailById = async (storeId) => {
  const query = `
    SELECT s.*, u.fullname AS owner_name, u.email AS owner_email 
    FROM stores s
    JOIN users u ON s.owner_id = u.id
    WHERE s.id = ?
  `
  const [rows] = await pool.execute(query, [storeId])
  return rows[0] || null
}

// 5. Cập nhật trạng thái Đóng băng / Kích hoạt lại hàng loạt Store bằng Checkbox
const updateStoreActiveStatusBulk = async (storeIds, isActive) => {
  const placeholders = storeIds.map(() => '?').join(', ')
  const query = `UPDATE stores SET is_active = ? WHERE id IN (${placeholders})`

  const [result] = await pool.execute(query, [isActive, ...storeIds])
  return result.affectedRows
}

// 6. Cập nhật tỷ lệ chiết khấu % hoa hồng độc quyền cho một hoặc nhiều Store
const updateStoreCommissionBulk = async (storeIds, targetRate) => {
  const placeholders = storeIds.map(() => '?').join(', ')
  const query = `UPDATE stores SET commission_rate = ? WHERE id IN (${placeholders})`

  const [result] = await pool.execute(query, [targetRate, ...storeIds])
  return result.affectedRows
}

// 7. Cưỡng chế điều chỉnh số dư ví balance (Xử lý khiếu nại / Phạt tiền lừa đảo)
const enforceStoreBalance = async (storeId, amount, type) => {
  const operator = type === 'plus' ? '+' : '-'
  const query = `UPDATE stores SET balance = balance ${operator} ? WHERE id = ?`

  const [result] = await pool.execute(query, [amount, storeId])
  return result.affectedRows
}

// 8. Kiểm tra tư cách và tính độc nhất của chủ Store
const checkStoreOwnerValidation = async (ownerId) => {
  const query = `
    SELECT u.role_id, s.id AS store_id 
    FROM users u
    LEFT JOIN stores s ON u.id = s.owner_id
    WHERE u.id = ?
  `
  const [rows] = await pool.execute(query, [ownerId])

  if (rows.length === 0) {
    return { isExist: false, isValidRole: false, isNotFound: true }
  }

  return {
    isExist: rows[0].store_id !== null,
    isValidRole: Number(rows[0].role_id) === ROLE_ID.USER,
    isNotFound: false
  }
}

// 9. Admin tự tay tạo mới một Cửa hàng (Đã cập nhật thêm trường ADDRESS)
const createStoreByAdmin = async ({ ownerId, name, bio, address, logo, banner, commissionRate }) => {
  const query = `
    INSERT INTO stores (owner_id, name, bio, address, logo, banner, commission_rate, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
  `
  const [result] = await pool.execute(query, [ownerId, name, bio, address, logo, banner, commissionRate])
  return result.insertId
}

// 10. Kiểm tra xem các Store được chọn đã từng phát sinh đơn hàng chưa (Tránh crash RESTRICT)
const checkStoresHaveOrders = async (storeIds) => {
  const placeholders = storeIds.map(() => '?').join(', ')
  const query = `SELECT DISTINCT store_id FROM orders WHERE store_id IN (${placeholders})`
  const [rows] = await pool.execute(query, storeIds)
  return rows.map(row => row.store_id)
}

// 11. Bốc mảng chứa thông tin file Logo/Banner của các Shop phục vụ dọn rác Cloudinary trước khi xóa cứng
const getStoresProfilesBulk = async (storeIds) => {
  const placeholders = storeIds.map(() => '?').join(', ')
  const query = `SELECT id, logo, banner FROM stores WHERE id IN (${placeholders})`
  const [rows] = await pool.execute(query, storeIds)
  return rows
}

// 12. Thực thi xóa cứng hoàn toàn dữ liệu Store khỏi hệ thống MySQL
const deleteStoresHardBulk = async (storeIds) => {
  if (storeIds.length === 0) return 0
  const placeholders = storeIds.map(() => '?').join(', ')
  const query = `DELETE FROM stores WHERE id IN (${placeholders})`
  const [result] = await pool.execute(query, storeIds)
  return result.affectedRows
}

export const adminStoreModel = {
  getStoresForAdmin,
  countStoresForAdmin,
  getStoresOverviewStats,
  getStoreDetailById,
  updateStoreActiveStatusBulk,
  updateStoreCommissionBulk,
  enforceStoreBalance,
  checkStoreOwnerValidation,
  createStoreByAdmin,
  checkStoresHaveOrders,
  getStoresProfilesBulk,
  deleteStoresHardBulk
}