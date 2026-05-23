import pool from '~/config/db'

// A. Lấy danh sách sản phẩm toàn sàn kèm phân trang và đa bộ lọc (Danh mục, Cửa hàng, Tìm kiếm tên)
const getProductsForManager = async ({ search, categoryId, storeId, status, sortBy, sortOrder, limit, offset }) => {
  // 🌟 ĐÃ SỬA: Bổ sung sortBy và sortOrder vào bộ tham số nhận vào ở trên
  let query = `
    SELECT p.id, p.name AS product_name, p.slug, p.price, p.sold, p.is_active, p.status, p.created_at,
           s.name AS store_name, c.name AS category_name
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `
  const queryParams = []

  // 1. Tìm kiếm theo tên sản phẩm
  if (search) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }

  // 2. Lọc theo danh mục
  if (categoryId) {
    query += ' AND p.category_id = ?'
    queryParams.push(Number(categoryId))
  }

  // 3. Lọc theo cửa hàng cụ thể
  if (storeId) {
    query += ' AND p.store_id = ?'
    queryParams.push(Number(storeId))
  }

  // 4. Lọc theo trạng thái kiểm duyệt (approved/banned)
  if (status) {
    query += ' AND p.status = ?'
    queryParams.push(status)
  }

  // 5. 🌟 XỬ LÝ LOGIC SẮP XẾP AN TOÀN (WHITE-LIST VALIDATION)
  const allowSortFields = ['price', 'product_name', 'sold', 'created_at']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'

  // Đảm bảo sortOrder chỉ có thể là ASC hoặc DESC để chặn SQL Injection
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  // Nối chuỗi sắp xếp (Xử lý trường hợp đặc biệt của cột tên sản phẩm trong DB là p.name)
  query += ` ORDER BY p.${finalSortBy === 'product_name' ? 'name' : finalSortBy} ${finalSortOrder}`

  // 6. Phân trang dữ liệu
  query += ' LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  // Thực thi câu lệnh
  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// B. Đếm tổng số sản phẩm thỏa mãn bộ lọc để trả về thông số phân trang chuẩn cho Frontend
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

// C. Cập nhật trạng thái kiểm duyệt (status = 'approved' hoặc 'banned') của sản phẩm
const updateProductModerationStatus = async (productId, status) => {
  const query = 'UPDATE products SET status = ? WHERE id = ?'
  const [result] = await pool.execute(query, [status, productId])
  return result.affectedRows
}

// D. Lấy thông tin chi tiết sản phẩm và email chủ shop phục vụ việc gửi thư cảnh báo khi bị khóa hàng
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

// Thống kê số liệu sản phẩm phục vụ các thẻ Widget đầu trang của Manager
const getProductsOverviewStats = async () => {
  const query = `
    SELECT 
      COUNT(*) AS totalProducts,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedProducts,
      SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) AS bannedProducts
    FROM products
  `
  const [rows] = await pool.execute(query)
  return {
    totalProducts: Number(rows[0].totalProducts) || 0,
    approvedProducts: Number(rows[0].approvedProducts) || 0,
    bannedProducts: Number(rows[0].bannedProducts) || 0
  }
}

const getProductDetailForManager = async (productSlug) => {
  const query = `
    SELECT 
      -- 1. Lấy toàn bộ các cột thông tin của sản phẩm
      p.*, 
      -- 2. Lấy tên danh mục
      c.name AS category_name,
      -- 3. Bốc thêm thông tin chi tiết của Cửa hàng phục vụ trang soi của Manager
      s.name AS store_name,
      s.address AS store_address,
      s.balance AS store_balance,
      s.is_active AS store_is_active,
      s.created_at AS store_created_at,
      -- 4. Bốc thêm thông tin liên hệ của chủ shop
      u.email AS owner_email,
      u.fullname AS owner_name
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON s.owner_id = u.id -- 🌟 JOIN thêm bảng users để bốc email/tên chủ sở hữu
    WHERE p.slug = ?
  `
  const [rows] = await pool.execute(query, [productSlug])
  return rows[0] || null
}

// F. Cập nhật trạng thái kiểm duyệt hàng loạt cho mảng ID từ Checkbox [2, 3, 5]
const updateProductsStatusBulk = async (productIds, status) => {
  const query = 'UPDATE products SET status = ? WHERE id IN (?)'
  // Sử dụng pool.query cho toán tử IN và bọc mảng productIds vào trong một mảng lớn
  const [result] = await pool.query(query, [status, productIds])
  return result.affectedRows
}

// G. Lấy thông tin sản phẩm và chủ shop dựa theo mảng ID để phục vụ gửi Mail hàng loạt
const getProductsAndOwnersInfoBulk = async (productIds) => {
  const query = `
    SELECT p.id AS product_id, p.name AS product_name, s.name AS store_name, u.fullname, u.email
    FROM products p
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON s.owner_id = u.id
    WHERE p.id IN (?)
  `
  const [rows] = await pool.query(query, [productIds])
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