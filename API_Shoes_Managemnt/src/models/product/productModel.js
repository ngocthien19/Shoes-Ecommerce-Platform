import pool from '~/config/db'

const getFlashSaleProducts = async (limit = 8) => {
  const query = `
    SELECT 
      p.id, 
      p.store_id, 
      p.category_id, 
      p.name, 
      p.slug, 
      p.description, 
      p.price, 
      p.sold, 
      p.rating_avg, 
      p.view_count, 
      p.images,
      MAX(pr.name) AS promotion_name,
      MAX(pr.discount_value) AS discount_percentage,
      ROUND(p.price * (1 - MAX(pr.discount_value) / 100), 2) AS sale_price
    FROM products p
    INNER JOIN product_promotions pp ON p.id = pp.product_id
    INNER JOIN promotions pr ON pp.promotion_id = pr.id
    WHERE p.is_active = TRUE 
      AND pr.is_active = TRUE
      AND NOW() BETWEEN pr.start_date AND pr.end_date 
    GROUP BY p.id 
    ORDER BY p.view_count DESC 
    LIMIT ?
  `

  const [rows] = await pool.execute(query, [String(limit)])
  return rows
}

const getTopSellingProducts = async (limit = 8) => {
  const query = `
    SELECT id, store_id, category_id, name, slug, description, price, sold, rating_avg, view_count, images 
    FROM products 
    WHERE is_active = TRUE
    ORDER BY sold DESC LIMIT ?
  `
  const [rows] = await pool.execute(query, [String(limit)])
  return rows
}

const getLatestProducts = async (limit = 8) => {
  const query = `
    SELECT id, store_id, category_id, name, slug, description, price, sold, rating_avg, view_count, images, created_at 
    FROM products 
    WHERE is_active = TRUE
    ORDER BY created_at DESC LIMIT ?
  `
  const [rows] = await pool.execute(query, [String(limit)])
  return rows
}

const getProductBySlug = async (slug) => {
  const query = `
    SELECT id, store_id, category_id, name, slug, description, price, sold, rating_avg, view_count, images 
    FROM products 
    WHERE slug = ? AND is_active = TRUE
  `
  const [rows] = await pool.execute(query, [slug])
  return rows[0] // Trả về 1 sản phẩm duy nhất
}

const getProductVariants = async (productId) => {
  const query = 'SELECT id, size, color, stock FROM product_variants WHERE product_id = ?'
  const [rows] = await pool.execute(query, [productId])
  return rows
}

const getRelatedProducts = async (categoryId, currentProductId, limit = 4) => {
  const query = `
    SELECT id, store_id, category_id, name, slug, price, sold, rating_avg, images 
    FROM products 
    WHERE category_id = ? AND id != ? AND is_active = TRUE 
    LIMIT ?
  `
  const [rows] = await pool.execute(query, [categoryId, currentProductId, String(limit)])
  return rows
}

const increaseViewCount = async (productId) => {
  await pool.execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [productId])
}

export const productModel = {
  getFlashSaleProducts,
  getTopSellingProducts,
  getLatestProducts,
  getProductBySlug,
  getProductVariants,
  getRelatedProducts,
  increaseViewCount
}