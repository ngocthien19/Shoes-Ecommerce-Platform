import pool from '~/config/db'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// 1. Lấy thông tin shop dựa vào owner_id của Vendor để lấy store_id và kiểm tra quyền
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, name AS store_name, logo, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 2. Kiểm tra tính chính chủ: Sản phẩm này có thuộc quyền quản lý của Shop này không
const checkProductOwnership = async (productId, storeId) => {
  const query = 'SELECT id FROM products WHERE id = ? AND store_id = ?'
  const [rows] = await pool.execute(query, [productId, storeId])
  return rows.length > 0
}

// 3. Thêm mới sản phẩm - Ép ẩn khỏi sàn (is_active = 0) và gán trạng thái pending chờ duyệt
const createProduct = async ({ storeId, categoryId, name, slug, description, price, images }) => {
  const query = `
    INSERT INTO products (store_id, category_id, name, slug, description, price, images, rating_avg, sold, is_active, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0.00, 0, FALSE, ?)
  `
  const [result] = await pool.execute(query, [
    storeId,
    categoryId,
    name,
    slug,
    description,
    price,
    images,
    PRODUCT_MODERATION_STATUS.PENDING
  ])
  return result
}

// 4. Chỉnh sửa sản phẩm - Tự động đá văng về trạng thái pending chờ duyệt lại và hạ is_active về 0
const updateProduct = async (productId, { categoryId, name, description, price, images }) => {
  const query = `
    UPDATE products 
    SET category_id = ?, name = ?, description = ?, price = ?, images = ?, is_active = FALSE, status = ?
    WHERE id = ?
  `
  const [result] = await pool.execute(query, [
    categoryId,
    name,
    description,
    price,
    images,
    PRODUCT_MODERATION_STATUS.PENDING,
    productId
  ])
  return result
}

// 5. Lấy thông tin hình ảnh của sản phẩm trước khi thực hiện xóa cứng
const getProductImages = async (productId) => {
  const query = 'SELECT images FROM products WHERE id = ?'
  const [rows] = await pool.execute(query, [productId])
  return rows[0]
}

// 6. Xóa cứng hoàn toàn sản phẩm khỏi bảng products (Các variants tự động xóa theo nhờ cấu hình ON DELETE CASCADE)
const hardDeleteProduct = async (productId) => {
  const query = 'DELETE FROM products WHERE id = ?'
  const [result] = await pool.execute(query, [productId])
  return result
}

// 7. Thêm biến thể mới (Size, Màu, Số lượng tồn kho) vào bảng product_variants
const createVariant = async ({ productId, size, color, stock }) => {
  const query = `
    INSERT INTO product_variants (product_id, size, color, stock)
    VALUES (?, ?, ?, ?)
  `
  const [result] = await pool.execute(query, [productId, size, color, stock])
  return result
}

// 8. Lấy danh sách sản phẩm cửa hàng (N nạp thêm p.status vào mảng SELECT để hiển thị thẻ trạng thái)
const getVendorProductsWithFilters = async (storeId, { search, categoryId, isActive, minPrice, maxPrice, sortBy, limit, offset }) => {
  let query = `
    SELECT 
      p.id, p.store_id, p.category_id, p.name, p.slug, p.description, p.price, 
      p.sold, p.rating_avg, p.images, p.is_active, p.status, p.created_at,
      c.name AS category_name
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.store_id = ?
  `
  const queryParams = [storeId]

  if (search !== undefined && search !== null) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId !== undefined && categoryId !== null) {
    query += ' AND p.category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND p.is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (minPrice !== undefined && minPrice !== null) {
    query += ' AND p.price >= ?'
    queryParams.push(Number(minPrice))
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    query += ' AND p.price <= ?'
    queryParams.push(Number(maxPrice))
  }

  const allowedSortFields = {
    'ctime': 'p.created_at DESC',
    'oldest': 'p.created_at ASC',
    'price_asc': 'p.price ASC',
    'price_desc': 'p.price DESC',
    'sold': 'p.sold DESC',
    'rating': 'p.rating_avg DESC'
  }
  const orderOrder = allowedSortFields[sortBy] || 'p.created_at DESC'
  query += ` ORDER BY ${orderOrder} LIMIT ? OFFSET ?`
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 9. Đếm tổng số lượng sản phẩm thỏa điều kiện lọc để tính tổng số trang
const countVendorProductsWithFilters = async (storeId, { search, categoryId, isActive, minPrice, maxPrice }) => {
  let query = 'SELECT COUNT(*) as total FROM products WHERE store_id = ?'
  const queryParams = [storeId]

  if (search !== undefined && search !== null) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId !== undefined && categoryId !== null) {
    query += ' AND category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }
  if (minPrice !== undefined && minPrice !== null) {
    query += ' AND price >= ?'
    queryParams.push(Number(minPrice))
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    query += ' AND price <= ?'
    queryParams.push(Number(maxPrice))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 10. Lấy chi tiết 1 sản phẩm kèm toàn bộ biến thể size/màu của nó
const getProductDetailWithVariants = async (productId, storeId) => {
  const pQuery = 'SELECT * FROM products WHERE id = ? AND store_id = ?'
  const [pRows] = await pool.execute(pQuery, [productId, storeId])
  if (pRows.length === 0) return null

  const vQuery = 'SELECT id, size, color, stock FROM product_variants WHERE product_id = ?'
  const [vRows] = await pool.execute(vQuery, [productId])

  return {
    ...pRows[0],
    variants: vRows
  }
}

// 11. Thống kê số liệu Widgets đầu trang Vendor dựa trên 5 trạng thái kiểm duyệt chuẩn chỉnh
const getProductsOverviewStats = async (storeId) => {
  const query = `
    SELECT 
      COUNT(*) AS totalProducts,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.APPROVED}' THEN 1 ELSE 0 END) AS activeProducts,
      SUM(CASE WHEN status IN ('${PRODUCT_MODERATION_STATUS.PENDING}', '${PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL}') THEN 1 ELSE 0 END) AS pendingProducts,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.REJECTED}' THEN 1 ELSE 0 END) AS rejectedProducts,
      SUM(CASE WHEN status = '${PRODUCT_MODERATION_STATUS.BANNED}' THEN 1 ELSE 0 END) AS bannedProducts
    FROM products 
    WHERE store_id = ?
  `
  const [rows] = await pool.execute(query, [storeId])
  return {
    totalProducts: Number(rows[0].totalProducts) || 0,
    activeProducts: Number(rows[0].activeProducts) || 0,
    pendingProducts: Number(rows[0].pendingProducts) || 0,
    rejectedProducts: Number(rows[0].rejectedProducts) || 0,
    bannedProducts: Number(rows[0].bannedProducts) || 0
  }
}

// 12. Kiểm tra danh sách ID sản phẩm từ Checkbox xem có hoàn toàn thuộc về Store này không
const checkMultipleProductsOwnership = async (productIds, storeId) => {
  if (!productIds || productIds.length === 0) return false
  const query = 'SELECT COUNT(*) AS validCount FROM products WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [productIds, storeId])
  return rows[0].validCount === productIds.length
}

// 13. Ẩn/Hiện loạt qua checkbox - Khóa cứng điều kiện: Chỉ những sản phẩm đã APPROVED mới được phép ẩn/hiện tự do!
const updateProductsStatusBulk = async (productIds, isActive, storeId) => {
  const query = `
    UPDATE products 
    SET is_active = ? 
    WHERE id IN (?) AND store_id = ? AND status = ?
  `
  const [result] = await pool.query(query, [isActive, productIds, storeId, PRODUCT_MODERATION_STATUS.APPROVED])
  return result.affectedRows
}

// 14. Lấy toàn bộ thông tin hình ảnh của danh sách sản phẩm trước khi xóa hàng loạt
const getMultipleProductImages = async (productIds, storeId) => {
  const query = 'SELECT images FROM products WHERE id IN (?) AND store_id = ?'
  const [rows] = await pool.query(query, [productIds, storeId])
  return rows
}

// 15. Xóa cứng hàng loạt sản phẩm từ Checkbox
const hardDeleteProductsBulk = async (productIds, storeId) => {
  const query = 'DELETE FROM products WHERE id IN (?) AND store_id = ?'
  const [result] = await pool.query(query, [productIds, storeId])
  return result.affectedRows
}

// 16. Vendor gửi yêu cầu phê duyệt lại cho danh sách sản phẩm bị Banned
const requestProductsReapprovalBulk = async (productIds, storeId) => {
  const placeholders = productIds.map(() => '?').join(', ')
  const query = `
    UPDATE products 
    SET status = ? 
    WHERE id IN (${placeholders}) AND store_id = ? AND status = ?
  `
  const [result] = await pool.execute(query, [
    PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL,
    ...productIds,
    storeId,
    PRODUCT_MODERATION_STATUS.BANNED
  ])
  return result.affectedRows
}

export const vendorProductModel = {
  getStoreByOwnerId,
  checkProductOwnership,
  createProduct,
  updateProduct,
  getProductImages,
  hardDeleteProduct,
  createVariant,
  getVendorProductsWithFilters,
  countVendorProductsWithFilters,
  getProductDetailWithVariants,
  getProductsOverviewStats,
  checkMultipleProductsOwnership,
  updateProductsStatusBulk,
  getMultipleProductImages,
  hardDeleteProductsBulk,
  requestProductsReapprovalBulk
}