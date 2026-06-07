import pool from '~/config/db'

const getStoreDetailById = async (storeId) => {
  const query = `
    SELECT 
      s.id, 
      s.name, 
      s.bio,
      s.logo, 
      s.banner,
      s.rating_average, 
      s.address, 
      s.created_at,
      s.is_active,
      (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id AND p.is_active = TRUE) AS total_products
    FROM stores s
    WHERE s.id = ? AND s.is_active = TRUE
  `

  const [rows] = await pool.execute(query, [storeId])
  return rows[0]
}

const getProductsByStoreId = async (storeId, page = 1, limit = 8) => {
  const offset = (page - 1) * limit

  // 1. Đếm tổng sản phẩm của store
  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM products WHERE store_id = ? AND is_active = TRUE',
    [storeId]
  )
  const total = countResult[0].total

  // 2. Lấy sản phẩm có phân trang
  const query = `
    SELECT 
      p.id, p.store_id, p.category_id, p.name, p.slug, p.description, p.price, p.sold, 
      p.rating_avg, p.view_count, p.images,
      prom.name AS promotion_name,
      prom.discount_value AS discount_percentage,
      (p.price * (1 - IFNULL(prom.discount_value, 0) / 100)) AS sale_price
    FROM products p
    LEFT JOIN product_promotions pp ON p.id = pp.product_id
    LEFT JOIN promotions prom ON pp.promotion_id = prom.id AND prom.is_active = TRUE
    WHERE p.store_id = ? AND p.is_active = TRUE
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `

  const [products] = await pool.execute(query, [storeId, String(limit), String(offset)])

  let productsWithVariants = []

  if (products.length > 0) {
    const productIds = products.map(p => p.id)
    const [variants] = await pool.execute(
      `SELECT id, product_id, size, color, stock 
       FROM product_variants 
       WHERE product_id IN (${productIds.join(',')})`
    )

    productsWithVariants = products.map(p => ({
      ...p,
      variants: variants.filter(v => v.product_id === p.id).map(({ product_id, ...rest }) => rest)
    }))
  }

  return {
    products: productsWithVariants,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const storeModel = {
  getStoreDetailById,
  getProductsByStoreId
}