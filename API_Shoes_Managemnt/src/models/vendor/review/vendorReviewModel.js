import pool from '~/config/db'

// Lấy thông tin shop dựa vào owner_id của Vendor
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Lấy danh sách Đánh giá sản phẩm (Có Phân trang, Tìm kiếm comment, Lọc sao)
const getProductReviews = async (storeId, { search, rating, isActive, isReported, limit, offset }) => {
  let query = `
    SELECT pr.id, pr.user_id, u.fullname, pr.product_id, p.name AS product_name, 
           pr.order_id, pr.rating, pr.comment, pr.images, pr.is_active, pr.is_reported, 
           pr.report_reason, pr.created_at
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    JOIN users u ON pr.user_id = u.id
    WHERE p.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }
  // Lọc theo trạng thái ẩn/hiện của bình luận
  if (isActive !== undefined && isActive !== null) {
    query += ' AND pr.is_active = ?'
    queryParams.push(Number(isActive))
  }
  // Lọc theo trạng thái đã gửi báo cáo vi phạm chưa
  if (isReported !== undefined && isReported !== null) {
    query += ' AND pr.is_reported = ?'
    queryParams.push(Number(isReported))
  }

  query += ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// Đếm tổng số đánh giá sản phẩm (Bổ sung lọc isActive và isReported)
const countProductReviews = async (storeId, { search, rating, isActive, isReported }) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM product_reviews pr
    JOIN products p ON pr.product_id = p.id
    WHERE p.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND pr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND pr.rating = ?'
    queryParams.push(Number(rating))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND pr.is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (isReported !== undefined && isReported !== null) {
    query += ' AND pr.is_reported = ?'
    queryParams.push(Number(isReported))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 2. Lấy danh sách Đánh giá cửa hàng (Bổ sung lọc isActive và isReported)
const getStoreReviews = async (storeId, { search, rating, isActive, isReported, limit, offset }) => {
  let query = `
    SELECT sr.id, sr.user_id, u.fullname, sr.rating, sr.comment, sr.is_active, 
           sr.is_reported, sr.report_reason, sr.created_at
    FROM store_reviews sr
    JOIN users u ON sr.user_id = u.id
    WHERE sr.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND sr.comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND sr.rating = ?'
    queryParams.push(Number(rating))
  }
  // Lọc theo trạng thái ẩn/hiện của bình luận
  if (isActive !== undefined && isActive !== null) {
    query += ' AND sr.is_active = ?'
    queryParams.push(Number(isActive))
  }
  // Lọc theo trạng thái đã gửi báo cáo vi phạm chưa
  if (isReported !== undefined && isReported !== null) {
    query += ' AND sr.is_reported = ?'
    queryParams.push(Number(isReported))
  }

  query += ' ORDER BY sr.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// Đếm tổng số đánh giá cửa hàng (Bổ sung lọc isActive và isReported)
const countStoreReviews = async (storeId, { search, rating, isActive, isReported }) => {
  let query = 'SELECT COUNT(*) as total FROM store_reviews WHERE store_id = ?'
  const queryParams = [storeId]

  if (search) {
    query += ' AND comment LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (rating) {
    query += ' AND rating = ?'
    queryParams.push(Number(rating))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (isReported !== undefined && isReported !== null) {
    query += ' AND is_reported = ?'
    queryParams.push(Number(isReported))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Xem chi tiết một đánh giá sản phẩm (Bao gồm mảng ảnh Cloudinary)
const getProductReviewDetail = async (reviewId, storeId) => {
  const query = `
      SELECT pr.*, u.fullname, u.email, p.name AS product_name, p.images AS product_images
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      JOIN users u ON pr.user_id = u.id
      WHERE pr.id = ? AND p.store_id = ?
    `
  const [rows] = await pool.execute(query, [reviewId, storeId])
  return rows[0] || null
}

// 4. Xem chi tiết một đánh giá cửa hàng
const getStoreReviewDetail = async (reviewId, storeId) => {
  const query = `
      SELECT sr.*, u.fullname, u.email
      FROM store_reviews sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.id = ? AND sr.store_id = ?
    `
  const [rows] = await pool.execute(query, [reviewId, storeId])
  return rows[0] || null
}

// 5. Gửi báo cáo vi phạm đối với Đánh giá sản phẩm (Cập nhật cờ hệ thống)
const reportProductReview = async (reviewId, storeId, reportReason) => {
  const query = `
      UPDATE product_reviews pr
      JOIN products p ON pr.product_id = p.id
      SET pr.is_reported = TRUE, pr.report_reason = ?
      WHERE pr.id = ? AND p.store_id = ?
    `
  const [result] = await pool.execute(query, [reportReason, reviewId, storeId])
  return result.affectedRows > 0
}

// 6. Gửi báo cáo vi phạm đối với Đánh giá cửa hàng
const reportStoreReview = async (reviewId, storeId, reportReason) => {
  const query = `
      UPDATE store_reviews 
      SET is_reported = TRUE, report_reason = ?
      WHERE id = ? AND store_id = ?
    `
  const [result] = await pool.execute(query, [reportReason, reviewId, storeId])
  return result.affectedRows > 0
}

// 7. Thống kê Widget đầu trang (Tổng lượt đánh giá & Điểm trung bình của Shop)
const getReviewsOverviewStats = async (storeId) => {
  const query = `
    SELECT 
      COUNT(sr.id) AS totalStoreReviews,
      AVG(CASE WHEN sr.is_active = TRUE THEN sr.rating END) AS avgStoreRating,
      
      SUM(CASE WHEN sr.is_active = FALSE THEN 1 ELSE 0 END) + 
      (SELECT COUNT(*) FROM product_reviews pr JOIN products p ON pr.product_id = p.id WHERE p.store_id = ? AND pr.is_active = FALSE) AS totalInactiveReviews,
      
      SUM(CASE WHEN sr.is_reported = TRUE THEN 1 ELSE 0 END) + 
      (SELECT COUNT(*) FROM product_reviews pr JOIN products p ON pr.product_id = p.id WHERE p.store_id = ? AND pr.is_reported = TRUE) AS totalReportedReviews
      
    FROM store_reviews sr
    WHERE sr.store_id = ?
  `
  const [rows] = await pool.execute(query, [storeId, storeId, storeId])
  return {
    totalReviews: Number(rows[0].totalStoreReviews) || 0,
    averageRating: Number(rows[0].avgStoreRating) ? Number(rows[0].avgStoreRating).toFixed(1) : '0.0',
    inactiveReviews: Number(rows[0].totalInactiveReviews) || 0,
    reportedReviews: Number(rows[0].totalReportedReviews) || 0
  }
}

// 8. Kiểm tra chính chủ hàng loạt đối với Đánh giá sản phẩm
const checkMultipleProductReviewsOwnership = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return false
  const query = `
      SELECT COUNT(*) AS validCount 
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      WHERE pr.id IN (?) AND p.store_id = ?
    `
  const [rows] = await pool.query(query, [reviewIds, storeId])
  return rows[0].validCount === reviewIds.length
}

// 9. Báo cáo vi phạm HÀNG LOẠT đối với Đánh giá sản phẩm
const reportProductReviewsBulk = async (reviewIds, storeId, reportReason) => {
  const query = `
      UPDATE product_reviews pr
      JOIN products p ON pr.product_id = p.id
      SET pr.is_reported = TRUE, pr.report_reason = ?
      WHERE pr.id IN (?) AND p.store_id = ?
    `
  const [result] = await pool.query(query, [reportReason, reviewIds, storeId])
  return result.affectedRows
}

// 10. Kiểm tra chính chủ hàng loạt đối với Đánh giá cửa hàng
const checkMultipleStoreReviewsOwnership = async (reviewIds, storeId) => {
  if (!reviewIds || reviewIds.length === 0) return false
  const query = 'SELECT COUNT(*) AS validCount FROM store_reviews WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [reviewIds, storeId])
  return rows[0].validCount === reviewIds.length
}

// 11. Báo cáo vi phạm HÀNG LOẠT đối với Đánh giá cửa hàng
const reportStoreReviewsBulk = async (reviewIds, storeId, reportReason) => {
  const query = 'UPDATE store_reviews SET is_reported = TRUE, report_reason = ? WHERE id IN (?) AND store_id = ?'
  const [result] = await pool.query(query, [reportReason, reviewIds, storeId])
  return result.affectedRows
}

// 12. Gửi yêu cầu mở lại Đánh giá sản phẩm bị ẩn (Chỉ áp dụng khi is_active = FALSE và chưa bị report lại)
const requestProductReviewReopenBulk = async (reviewIds, storeId, reason) => {
  const placeholders = reviewIds.map(() => '?').join(', ')
  const query = `
    UPDATE product_reviews pr
    JOIN products p ON pr.product_id = p.id
    SET pr.is_reported = TRUE, pr.report_reason = ?
    WHERE pr.id IN (${placeholders}) AND p.store_id = ? AND pr.is_active = FALSE AND pr.is_reported = FALSE
  `
  const [result] = await pool.query(query, [reason, ...reviewIds, storeId])
  return result.affectedRows
}

// 13. Gửi yêu cầu mở lại Đánh giá cửa hàng bị ẩn (Chỉ áp dụng khi is_active = FALSE và chưa bị report lại)
const requestStoreReviewReopenBulk = async (reviewIds, storeId, reason) => {
  const placeholders = reviewIds.map(() => '?').join(', ')
  const query = `
    UPDATE store_reviews 
    SET is_reported = TRUE, report_reason = ?
    WHERE id IN (${placeholders}) AND store_id = ? AND is_active = FALSE AND is_reported = FALSE
  `
  const [result] = await pool.query(query, [reason, ...reviewIds, storeId])
  return result.affectedRows
}

export const vendorReviewModel = {
  getStoreByOwnerId,
  getProductReviews,
  countProductReviews,
  getStoreReviews,
  countStoreReviews,
  getProductReviewDetail,
  getStoreReviewDetail,
  reportProductReview,
  reportStoreReview,
  getReviewsOverviewStats,
  checkMultipleProductReviewsOwnership,
  reportProductReviewsBulk,
  checkMultipleStoreReviewsOwnership,
  reportStoreReviewsBulk,
  requestProductReviewReopenBulk,
  requestStoreReviewReopenBulk
}