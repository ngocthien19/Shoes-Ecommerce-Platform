import pool from '~/config/db'

// Lấy thông tin shop dựa vào owner_id của Vendor
const getStoreByOwnerId = async (ownerId) => {
  const query = 'SELECT id, is_active FROM stores WHERE owner_id = ?'
  const [rows] = await pool.execute(query, [ownerId])
  return rows[0]
}

// 1. Thống kê số liệu tổng quan (Widgets đầu trang)
const getRevenueOverview = async (storeId, startDate, endDate) => {
  let query = `
    SELECT 
      IFNULL(SUM(total_amount), 0) AS totalRevenue,
      COUNT(id) AS totalOrdersSuccess
    FROM orders
    WHERE store_id = ? AND status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return {
    totalRevenue: Number(rows[0].totalRevenue),
    totalOrdersSuccess: Number(rows[0].totalOrdersSuccess)
  }
}

// 2. Thống kê tổng số lượng đôi giày đã bán ra thực tế
const getTotalProductsSold = async (storeId, startDate, endDate) => {
  let query = `
    SELECT IFNULL(SUM(oi.quantity), 0) AS totalProductSold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ? AND o.status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  const [rows] = await pool.execute(query, queryParams)
  return Number(rows[0].totalProductSold)
}

// 3. Lấy dữ liệu doanh thu theo từng ngày để Frontend vẽ biểu đồ (Line/Bar Chart)
const getRevenueChartData = async (storeId, startDate, endDate) => {
  let query = `
    SELECT 
      DATE(created_at) AS date,
      IFNULL(SUM(total_amount), 0) AS dailyRevenue,
      COUNT(id) AS dailyOrders
    FROM orders
    WHERE store_id = ? AND status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += ' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC'

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 4. 🔥 MỚI: Top 5 sản phẩm bán chạy nhất kèm doanh thu đem lại của riêng mẫu đó
const getTopSellingProducts = async (storeId, startDate, endDate) => {
  let query = `
    SELECT 
      p.id, 
      p.name, 
      p.images,
      IFNULL(SUM(oi.quantity), 0) AS total_sold,
      IFNULL(SUM(oi.quantity * oi.price), 0) AS total_revenue
    FROM order_items oi
    JOIN product_variants pv ON oi.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ? AND o.status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += `
    GROUP BY p.id
    ORDER BY total_sold DESC, total_revenue DESC
    LIMIT 5
  `

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

// 5. 🔥 MỚI: Thống kê doanh thu theo Danh mục (Phục vụ vẽ Pie Chart)
const getRevenueByCategory = async (storeId, startDate, endDate) => {
  let query = `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      IFNULL(SUM(oi.quantity * oi.price), 0) AS revenue
    FROM order_items oi
    JOIN product_variants pv ON oi.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.store_id = ? AND o.status = 'delivered'
  `
  const queryParams = [storeId]

  if (startDate) {
    query += ' AND o.created_at >= ?'
    queryParams.push(`${startDate} 00:00:00`)
  }
  if (endDate) {
    query += ' AND o.created_at <= ?'
    queryParams.push(`${endDate} 23:59:59`)
  }

  query += ' GROUP BY c.id'

  const [rows] = await pool.execute(query, queryParams)
  return rows
}

export const vendorAnalyticsModel = {
  getStoreByOwnerId,
  getRevenueOverview,
  getTotalProductsSold,
  getRevenueChartData,
  getTopSellingProducts,
  getRevenueByCategory
}