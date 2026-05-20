import pool from '~/config/db'

const getAllCategories = async () => {
  const query = 'SELECT id, name, slug, description, image FROM categories WHERE is_active = TRUE'
  const [rows] = await pool.execute(query)
  return rows
}

export const categoryModel = {
  getAllCategories
}