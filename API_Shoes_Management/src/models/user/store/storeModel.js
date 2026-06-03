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

export const storeModel = {
  getStoreDetailById
}