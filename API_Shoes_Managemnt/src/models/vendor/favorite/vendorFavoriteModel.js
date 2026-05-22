import pool from '~/config/db'

const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Lấy danh sách sản phẩm kèm lượt tim + Đa bộ lọc nâng cao
const getMostFavoritedProducts = async (storeId, { search, categoryId, isActive, minFavorites, maxFavorites, limit, offset }) => {
  let query = `
    SELECT p.id, p.name, p.slug, p.price, p.sold, p.rating_avg, p.images, p.is_active, p.category_id,
           COUNT(f.product_id) AS total_favorites
    FROM products p
    LEFT JOIN favorites f ON p.id = f.product_id
    WHERE p.store_id = ?
  `
  const queryParams = [storeId]

  if (search) {
    query += ' AND p.name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND p.category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND p.is_active = ?'
    queryParams.push(Number(isActive))
  }

  query += ' GROUP BY p.id'

  // Lọc theo số lượng tim sau khi đã GROUP BY (Dùng HAVING)
  if (minFavorites) {
    query += ' HAVING total_favorites >= ?'
    queryParams.push(Number(minFavorites))
  }
  if (maxFavorites) {
    // Nếu đã có HAVING ở trên thì nối AND, chưa có thì dùng HAVING
    query += minFavorites ? ' AND total_favorites <= ?' : ' HAVING total_favorites <= ?'
    queryParams.push(Number(maxFavorites))
  }

  query += ' ORDER BY total_favorites DESC, p.created_at DESC LIMIT ? OFFSET ?'
  queryParams.push(String(limit), String(offset))

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 2. Đếm tổng số dòng thỏa mãn bộ lọc để phân trang chuẩn
const countFavoritedProductsUnique = async (storeId, { search, categoryId, isActive }) => {
  let query = 'SELECT COUNT(*) as total FROM products WHERE store_id = ?'
  const queryParams = [storeId]

  if (search) {
    query += ' AND name LIKE ?'
    queryParams.push(`%${search}%`)
  }
  if (categoryId) {
    query += ' AND category_id = ?'
    queryParams.push(Number(categoryId))
  }
  if (isActive !== undefined && isActive !== null) {
    query += ' AND is_active = ?'
    queryParams.push(Number(isActive))
  }

  const [rows] = await pool.execute(query, queryParams)
  return rows[0].total
}

// 3. Thống kê siêu Widget (Tìm đôi giày nhiều tim nhất + Tổng số lượt tim)
const getFavoritesOverviewStats = async (storeId) => {
  // Lấy tổng số lượt tim và số lượng sản phẩm có tim
  const queryStats = `
    SELECT 
      COUNT(f.product_id) AS totalStoreFavorites,
      COUNT(DISTINCT f.product_id) AS uniqueProductsFavorited
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    WHERE p.store_id = ?
  `
  // Lấy tên đôi giày được thích nhiều nhất
  const queryTopProduct = `
    SELECT p.name, COUNT(f.product_id) AS total_favorites
    FROM products p
    JOIN favorites f ON p.id = f.product_id
    WHERE p.store_id = ?
    GROUP BY p.id
    ORDER BY total_favorites DESC
    LIMIT 1
  `

  const [[rowsStats], [rowsTop]] = await Promise.all([
    pool.execute(queryStats, [storeId]),
    pool.execute(queryTopProduct, [storeId])
  ])

  return {
    totalFavoritesAllTime: Number(rowsStats[0].totalStoreFavorites) || 0,
    uniqueProductsFavorited: Number(rowsStats[0].uniqueProductsFavorited) || 0,
    mostFavoritedProduct: rowsTop[0] ? `${rowsTop[0].name} (${rowsTop[0].total_favorites} ❤)` : 'Chưa có'
  }
}

export const vendorFavoriteModel = {
  getStoreByOwnerId,
  getMostFavoritedProducts,
  countFavoritedProductsUnique,
  getFavoritesOverviewStats
}