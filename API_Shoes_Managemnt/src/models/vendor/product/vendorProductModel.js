import pool from '~/config/db'

// 1. Lấy thông tin shop dựa vào owner_id của Vendor để lấy store_id và kiểm tra quyền
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 2. Kiểm tra tính chính chủ: Sản phẩm này có thuộc quyền quản lý của Shop này không
const checkProductOwnership = async (productId, storeId) => {
  const query = 'SELECT id FROM products WHERE id = ? AND store_id = ?'
  const [rows] = await pool.execute(query, [productId, storeId])
  return rows.length > 0
}

// 3. Thêm mới một sản phẩm gốc vào bảng products
const createProduct = async ({ storeId, categoryId, name, slug, description, price, images }) => {
  const query = `
    INSERT INTO products (store_id, category_id, name, slug, description, price, images, rating_avg, sold, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0.00, 0, TRUE)
  `
  const [result] = await pool.execute(query, [storeId, categoryId, name, slug, description, price, images])
  return result
}

// 4. Chỉnh sửa thông tin sản phẩm gốc
const updateProduct = async (productId, { categoryId, name, description, price, images }) => {
  const query = `
    UPDATE products 
    SET category_id = ?, name = ?, description = ?, price = ?, images = ?
    WHERE id = ?
  `
  const [result] = await pool.execute(query, [categoryId, name, description, price, images, productId])
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

// 8. Lấy danh sách sản phẩm của cửa hàng kèm Phân trang, Tìm kiếm, Lọc Dropdown và Sắp xếp
const getVendorProductsWithFilters = async (storeId, { search, categoryId, isActive, minPrice, maxPrice, sortBy, limit, offset }) => {
  let query = 'SELECT * FROM products WHERE store_id = ?'
  const queryParams = [storeId]

  // A. Tìm kiếm theo tên sản phẩm
  if (search !== undefined && search !== null) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }

  // B. Lọc theo Dropdown Danh mục
  if (categoryId !== undefined && categoryId !== null) {
    query += ' AND category_id = ?'
    queryParams.push(Number(categoryId))
  }

  // C. Lọc theo Dropdown Trạng thái hoạt động (1: Đang bán, 0: Ẩn)
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }

  // D. Lọc theo khoảng giá
  if (minPrice !== undefined && minPrice !== null) {
    query += ' AND price >= ?'
    queryParams.push(Number(minPrice))
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    query += ' AND price <= ?'
    queryParams.push(Number(maxPrice))
  }

  // E. Xử lý Sắp xếp (Nối chuỗi trực tiếp, không dùng tham số biến)
  const allowedSortFields = {
    'ctime': 'created_at DESC',
    'oldest': 'created_at ASC',
    'price_asc': 'price ASC',
    'price_desc': 'price DESC',
    'sold': 'sold DESC',
    'rating': 'rating_avg DESC'
  }
  const orderOrder = allowedSortFields[sortBy] || 'created_at DESC'
  query += ` ORDER BY ${orderOrder}`

  // F. Xử lý Phân trang (Bắt buộc ép kiểu dữ liệu chuỗi hoặc số nguyên cho LIMIT/OFFSET)
  query += ' LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset)) // Chuyển sang chuỗi để trình điều khiển tương thích hoàn toàn

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
  // Lấy thông tin sản phẩm gốc
  const pQuery = 'SELECT * FROM products WHERE id = ? AND store_id = ?'
  const [pRows] = await pool.execute(pQuery, [productId, storeId])
  if (pRows.length === 0) return null

  // Lấy danh sách biến thể tương ứng
  const vQuery = 'SELECT id, size, color, stock FROM product_variants WHERE product_id = ?'
  const [vRows] = await pool.execute(vQuery, [productId])

  return {
    ...pRows[0],
    variants: vRows
  }
}

// 11. Thống kê nhanh số liệu sản phẩm phục vụ các thẻ Widget ở đầu trang
const getProductsOverviewStats = async (storeId) => {
  const query = `
    SELECT 
      COUNT(*) AS totalProducts,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activeProducts,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactiveProducts,
      COUNT(DISTINCT CASE WHEN v.total_stock = 0 OR v.total_stock IS NULL THEN p.id END) AS outOfStockProducts
    FROM products p
    LEFT JOIN (
      SELECT product_id, SUM(stock) AS total_stock 
      FROM product_variants 
      GROUP BY product_id
    ) v ON p.id = v.product_id
    WHERE p.store_id = ?
  `
  const [rows] = await pool.execute(query, [storeId])
  return {
    totalProducts: Number(rows[0].totalProducts) || 0,
    activeProducts: Number(rows[0].activeProducts) || 0,
    inactiveProducts: Number(rows[0].inactiveProducts) || 0,
    outOfStockProducts: Number(rows[0].outOfStockProducts) || 0
  }
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
  getProductsOverviewStats
}