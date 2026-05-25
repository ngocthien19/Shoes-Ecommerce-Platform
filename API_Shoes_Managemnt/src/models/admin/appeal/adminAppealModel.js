import pool from '~/config/db'

// 1. Tạo mới đơn khiếu nại (Vendor gửi công khai)
const createAppeal = async ({ storeId, appealReason, evidenceImages }) => {
  const query = `
    INSERT INTO store_appeals (store_id, appeal_reason, evidence_images) 
    VALUES (?, ?, ?)
  `
  const [result] = await pool.execute(query, [storeId, appealReason, evidenceImages])
  return result.insertId
}

// 2. Lấy danh sách đơn khiếu nại (Dành cho Manager/Admin xem - Phân trang + Bộ lọc status)
const getAppeals = async ({ status, limit, offset }) => {
  let query = `
    SELECT a.*, s.name AS store_name, u.email AS owner_email, u.fullname AS owner_name
    FROM store_appeals a
    JOIN stores s ON a.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `
  const queryParams = []
  if (status) {
    query += ' AND a.status = ?'
    queryParams.push(status)
  }
  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(limit, offset)

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 3. Đếm tổng số đơn khiếu nại để phân trang
const countAppeals = async (status) => {
  let query = 'SELECT COUNT(*) AS total FROM store_appeals WHERE 1=1'
  const queryParams = []
  if (status) {
    query += ' AND status = ?'
    queryParams.push(status)
  }
  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 4. Xem chi tiết 1 đơn cứu xét
const getAppealDetailById = async (appealId) => {
  const query = `
    SELECT a.*, s.name AS store_name, s.is_active AS store_current_status, u.email AS owner_email
    FROM store_appeals a
    JOIN stores s ON a.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE a.id = ?
  `
  const [rows] = await pool.execute(query, [appealId])
  return rows[0] || null
}

// 5. Cập nhật trạng thái đơn cứu xét (approved / rejected) kèm ghi chú của ban quản trị
const updateAppealStatus = async (appealId, status, managerNote) => {
  const query = 'UPDATE store_appeals SET status = ?, manager_note = ? WHERE id = ?'
  const [result] = await pool.execute(query, [status, managerNote, appealId])
  return result.affectedRows
}

// 6. Truy tìm ID và trạng thái Shop của Vendor dựa vào owner_id lấy từ Token đăng nhập
const getStoreStatusByOwnerId = async (ownerId) => {
  const query = 'SELECT id, name, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0] || null
}

export const adminAppealModel = {
  createAppeal,
  getAppeals,
  countAppeals,
  getAppealDetailById,
  updateAppealStatus,
  getStoreStatusByOwnerId
}