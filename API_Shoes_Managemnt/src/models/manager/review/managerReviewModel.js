import pool from '~/config/db'

// 1. Lấy danh sách tố cáo Đánh giá sản phẩm (Phân trang + Lọc đa điều kiện vĩ mô + Sắp xếp động)
const getReportedProductReviews = async ({ search, rating, storeId, startDate, endDate, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT pr.id, pr.user_id, u.fullname AS user_name, pr.product_id, p.name AS product_name, 
           pr.order_id, pr.rating, pr.comment, pr.images, pr.is_active, pr.is_reported, 
           pr.report_reason, pr.created_at, s.name AS store_name
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON pr.user_id = u.id
    WHERE pr.is_reported = TRUE
  `
  const queryParams = []

  // Các bộ lọc cũ của b
  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }

  // Lọc vĩ mô theo Store ID cụ thể
  if (storeId) {
    query += ' AND p.store_id = ?'
    queryParams.push(Number(storeId))
  }

  // Lọc theo khoảng thời gian đệ đơn tố cáo
  if (startDate) {
    query += ' AND pr.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND pr.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  // XỬ LÝ LOGIC SẮP XẾP ĐỘNG AN TOÀN CHỐNG SQL INJECTION
  const allowSortFields = ['created_at', 'rating']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY pr.${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// Đếm tổng số lượng tố cáo Đánh giá sản phẩm phục vụ phân trang chuẩn (Phải đồng bộ bộ lọc với hàm lấy)
const countReportedProductReviews = async ({ search, rating, storeId, startDate, endDate }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    WHERE pr.is_reported = TRUE
  `
  const queryParams = []

  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (storeId) {
    query += ' AND p.store_id = ?'
    queryParams.push(Number(storeId))
  }
  if (startDate) {
    query += ' AND pr.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND pr.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 2. Xem chi tiết đích danh một Đánh giá sản phẩm bị tố cáo (Giữ nguyên phom chuẩn)
const getProductReviewDetail = async (reviewId) => {
  const query = `
    SELECT pr.id AS review_id, pr.rating, pr.comment, pr.images AS review_images, 
           pr.is_active, pr.is_reported, pr.report_reason, pr.created_at,
           u.id AS user_id, u.fullname AS user_name, u.email AS user_email,
           p.id AS product_id, p.name AS product_name, p.slug AS product_slug, p.images AS product_images,
           s.id AS store_id, s.name AS store_name
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN stores s ON p.store_id = s.id
    JOIN users u ON pr.user_id = u.id
    WHERE pr.id = ?
  `
  const [rows] = await pool.execute(query, [reviewId])
  return rows[0] || null
}

// 3. Xử lý hàng loạt Đánh giá sản phẩm
const handleProductReviewsBulk = async (reviewIds, action) => {
  const placeholders = reviewIds.map(() => '?').join(', ')

  let query = ''
  if (action === 'approved') {
    // Đồng ý khiếu nại: Lật ngược cờ is_active (1 thành 0, 0 thành 1) và gỡ report
    query = `
      UPDATE product_reviews 
      SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  } else {
    // Từ chối khiếu nại: Giữ nguyên cờ is_active, chỉ gỡ report
    query = `
      UPDATE product_reviews 
      SET is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  }

  const [result] = await pool.execute(query, [...reviewIds])
  return result.affectedRows
}

// 1. Lấy danh sách tố cáo Đánh giá cửa hàng (Phân trang + Lọc đa điều kiện vĩ mô + Sắp xếp động)
const getReportedStoreReviews = async ({ search, rating, storeId, startDate, endDate, sortBy, sortOrder, limit, offset }) => {
  let query = `
    SELECT sr.id, sr.user_id, u.fullname AS user_name, sr.store_id, s.name AS store_name, 
           sr.rating, sr.comment, sr.is_active, sr.is_reported, sr.report_reason, sr.created_at
    FROM store_reviews sr
    JOIN stores s ON sr.store_id = s.id
    JOIN users u ON sr.user_id = u.id
    WHERE sr.is_reported = TRUE
  `
  const queryParams = []

  if (search) {
    query += ' AND sr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND sr.rating = ?'
    queryParams.push(Number(rating))
  }

  // Lọc vĩ mô theo Store ID cụ thể
  if (storeId) {
    query += ' AND sr.store_id = ?'
    queryParams.push(Number(storeId))
  }

  // Lọc theo khoảng thời gian đệ đơn tố cáo
  if (startDate) {
    query += ' AND sr.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND sr.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  // XỬ LÝ LOGIC SẮP XẾP ĐỘNG AN TOÀN CHỐNG SQL INJECTION
  const allowSortFields = ['created_at', 'rating']
  const finalSortBy = allowSortFields.includes(sortBy) ? sortBy : 'created_at'
  const finalSortOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

  query += ` ORDER BY sr.${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// Đếm tổng số lượng tố cáo Đánh giá cửa hàng phục vụ phân trang chuẩn (Phải đồng bộ bộ lọc với hàm lấy)
const countReportedStoreReviews = async ({ search, rating, storeId, startDate, endDate }) => {
  let query = 'SELECT COUNT(*) as total FROM store_reviews WHERE is_reported = TRUE'
  const queryParams = []

  if (search) {
    query += ' AND comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND rating = ?'
    queryParams.push(Number(rating))
  }
  if (storeId) {
    query += ' AND store_id = ?'
    queryParams.push(Number(storeId))
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

// 2. Xem chi tiết đích danh một Đánh giá cửa hàng bị tố cáo (Giữ nguyên phom chuẩn)
const getStoreReviewDetail = async (reviewId) => {
  const query = `
    SELECT sr.id AS review_id, sr.rating, sr.comment, sr.is_active, sr.is_reported, sr.report_reason, sr.created_at,
           u.id AS user_id, u.fullname AS user_name, u.email AS user_email,
           s.id AS store_id, s.name AS store_name, s.logo AS store_logo
    FROM store_reviews sr
    JOIN stores s ON sr.store_id = s.id
    JOIN users u ON sr.user_id = u.id
    WHERE sr.id = ?
  `
  const [rows] = await pool.execute(query, [reviewId])
  return rows[0] || null
}

// 3. Xử lý hàng loạt Đánh giá cửa hàng
const handleStoreReviewsBulk = async (reviewIds, action) => {
  const placeholders = reviewIds.map(() => '?').join(', ')

  let query = ''
  if (action === 'approved') {
    query = `
      UPDATE store_reviews 
      SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  } else {
    query = `
      UPDATE store_reviews 
      SET is_reported = FALSE 
      WHERE id IN (${placeholders}) AND is_reported = TRUE
    `
  }

  const [result] = await pool.execute(query, [...reviewIds])
  return result.affectedRows
}

const getManagerReviewsOverviewStats = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM product_reviews WHERE is_reported = TRUE) AS pendingProductReports,
      (SELECT COUNT(*) FROM store_reviews WHERE is_reported = TRUE) AS pendingStoreReports,
      (SELECT COUNT(*) FROM product_reviews WHERE is_active = FALSE) AS bannedProductReviews,
      (SELECT COUNT(*) FROM store_reviews WHERE is_active = FALSE) AS bannedStoreReviews
  `
  const [rows] = await pool.execute(query)
  return {
    pendingProductReports: Number(rows[0].pendingProductReports) || 0,
    pendingStoreReports: Number(rows[0].pendingStoreReports) || 0,
    totalBannedReviews: (Number(rows[0].bannedProductReviews) + Number(rows[0].bannedStoreReviews)) || 0
  }
}

const getReviewOwnersInfoBulk = async (reviewIds, reviewType) => {
  if (!reviewIds || reviewIds.length === 0) return []
  const placeholders = reviewIds.map(() => '?').join(',')
  let query = ''

  if (reviewType === 'product') {
    query = `
      SELECT pr.id AS review_id, pr.is_active, p.name AS target_name, u.fullname AS reviewer_name, s.owner_id
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      JOIN users u ON pr.user_id = u.id
      WHERE pr.id IN (${placeholders})
    `
  } else {
    query = `
      SELECT sr.id AS review_id, sr.is_active, s.name AS target_name, u.fullname AS reviewer_name, s.owner_id
      FROM store_reviews sr
      JOIN stores s ON sr.store_id = s.id
      JOIN users u ON sr.user_id = u.id
      WHERE sr.id IN (${placeholders})
    `
  }
  const [rows] = await pool.execute(query, reviewIds)
  return rows
}

export const managerReviewModel = {
  getReportedProductReviews,
  countReportedProductReviews,
  getProductReviewDetail,
  handleProductReviewsBulk,
  getReportedStoreReviews,
  countReportedStoreReviews,
  getStoreReviewDetail,
  handleStoreReviewsBulk,
  getManagerReviewsOverviewStats,
  getReviewOwnersInfoBulk
}