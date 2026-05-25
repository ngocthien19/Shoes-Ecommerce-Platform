import pool from '~/config/db'
import { ROLE_ID } from '~/utils/constants'

// 1. Lấy danh sách tài khoản kèm đa bộ lọc vĩ mô + Sắp xếp động + Phân trang
const getUsersForAdmin = async ({ search, roleId, isActive, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT u.id, u.role_id, r.name AS role_name, u.fullname, u.email, u.phone, 
           u.avatar, u.is_active, u.is_verified, u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE 1=1
  `
  const queryParams = []

  // Tìm kiếm theo Tên, Email hoặc Số điện thoại
  if (search) {
    query += ' AND (u.fullname LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  // Lọc theo Chức vụ
  if (roleId) {
    query += ' AND u.role_id = ?'
    queryParams.push(Number(roleId))
  }

  // Lọc theo Trạng thái hoạt động (Đóng băng hay không)
  if (isActive !== undefined && isActive !== null) {
    query += ' AND u.is_active = ?'
    queryParams.push(Number(isActive))
  }

  // Khóa trục sắp xếp an toàn tránh SQL Injection
  const allowSortFields = ['created_at', 'fullname', 'email']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY u.${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số lượng user thỏa mãn bộ lọc để tính phân trang chuẩn
const countUsersForAdmin = async ({ search, roleId, isActive }) => {
  let query = 'SELECT COUNT(*) as total FROM users u WHERE 1=1'
  const queryParams = []

  if (search) {
    query += ' AND (u.fullname LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (roleId) {
    query += ' AND u.role_id = ?'
    queryParams.push(Number(roleId))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND u.is_active = ?'
    queryParams.push(Number(isActive))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Xem chi tiết thông tin một tài khoản
const getUserDetailById = async (userId) => {
  const query = `
    SELECT u.id, u.role_id, r.name AS role_name, u.fullname, u.email, u.phone, 
           u.avatar, u.is_active, u.is_verified, u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `
  const [rows] = await pool.execute(query, [userId])
  return rows[0] || null
}

// 4. Cấu hình phân quyền hàng loạt cho mảng ID từ Checkbox (Cấm thay đổi tài khoản ADMIN tối cao khác để bảo vệ hệ thống)
const updateUserRoleBulk = async (userIds, targetRoleId) => {
  const placeholders = userIds.map(() => '?').join(', ')

  const query = `
    UPDATE users 
    SET role_id = ? 
    WHERE id IN (${placeholders}) AND id != 1
  `
  const [result] = await pool.execute(query, [targetRoleId, ...userIds])
  return result.affectedRows
}

// 5. Đóng băng / Mở khóa tài khoản hàng loạt diện rộng (Global Ban Bulk)
const updateUserActiveStatusBulk = async (userIds, isActive) => {
  const placeholders = userIds.map(() => '?').join(', ')

  // Nếu khóa tài khoản (isActive = 0), ép refresh_token = NULL
  // để cơ chế JWT lập tức đẩy user văng khỏi ứng dụng ngay tại chỗ.
  const query = isActive
    ? `UPDATE users SET is_active = TRUE WHERE id IN (${placeholders}) AND id != 1`
    : `UPDATE users SET is_active = FALSE, refresh_token = NULL WHERE id IN (${placeholders}) AND id != 1`

  const [result] = await pool.execute(query, userIds)
  return result.affectedRows
}

// 6. Thống kê thông số Widgets nạp lên đầu trang Dashboard quản lý nhân sự
const getUsersOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(id) AS totalUsers,
      SUM(CASE WHEN role_id = ${ROLE_ID.MANAGER} THEN 1 ELSE 0 END) AS totalManagers,
      SUM(CASE WHEN role_id = ${ROLE_ID.VENDOR} THEN 1 ELSE 0 END) AS totalVendors,
      SUM(CASE WHEN role_id = ${ROLE_ID.USER} THEN 1 ELSE 0 END) AS totalRegularUsers,
      SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS totalBannedUsers
    FROM users
  `
  const [rows] = await pool.execute(query)
  return {
    totalUsers: Number(rows[0].totalUsers) || 0,
    totalManagers: Number(rows[0].totalManagers) || 0,
    totalVendors: Number(rows[0].totalVendors) || 0,
    totalRegularUsers: Number(rows[0].totalRegularUsers) || 0,
    totalBannedUsers: Number(rows[0].totalBannedUsers) || 0
  }
}

// 7. Kiểm tra xem Email đã tồn tại dưới DB chưa
const checkEmailExist = async (email) => {
  const query = 'SELECT id FROM users WHERE email = ?'
  const [rows] = await pool.execute(query, [email])
  return rows.length > 0
}

// 8. Admin tạo mới tài khoản nhân sự trực tiếp
const createNewUserByAdmin = async ({ roleId, fullname, email, password, phone, avatar }) => {
  const query = `
    INSERT INTO users (role_id, fullname, email, password, phone, avatar, is_verified) 
    VALUES (?, ?, ?, ?, ?, ?, TRUE)
  `
  const [result] = await pool.execute(query, [Number(roleId), fullname, email, password, phone, avatar])
  return result.insertId
}

// 9. Kiểm tra xem danh sách User có dính líu đến đơn hàng nào không (Tránh crash khóa ngoại RESTRICT)
const checkUsersHaveOrders = async (userIds) => {
  const placeholders = userIds.map(() => '?').join(', ')
  const query = `SELECT DISTINCT user_id FROM orders WHERE user_id IN (${placeholders})`
  const [rows] = await pool.execute(query, userIds)
  return rows.map(row => row.user_id)
}

// 10. Lấy danh sách avatar (JSON) của các user được chọn phục vụ dọn rác Cloudinary trước khi xóa cứng
const getUsersAvatarsBulk = async (userIds) => {
  const placeholders = userIds.map(() => '?').join(', ')
  const query = `SELECT id, avatar FROM users WHERE id IN (${placeholders})`
  const [rows] = await pool.execute(query, userIds)
  return rows
}

// 11. Thực thi xóa cứng những user hợp lệ khỏi hệ thống
const deleteUsersHardBulk = async (userIds) => {
  if (userIds.length === 0) return 0
  const placeholders = userIds.map(() => '?').join(', ')
  const query = `DELETE FROM users WHERE id IN (${placeholders}) AND id != 1`
  const [result] = await pool.execute(query, userIds)
  return result.affectedRows
}

export const adminUserModel = {
  getUsersForAdmin,
  countUsersForAdmin,
  getUserDetailById,
  updateUserRoleBulk,
  updateUserActiveStatusBulk,
  getUsersOverviewStats,
  createNewUserByAdmin,
  checkUsersHaveOrders,
  deleteUsersHardBulk,
  checkEmailExist,
  getUsersAvatarsBulk
}