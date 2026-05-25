import pool from '~/config/db'

// 1. Hàm bốc số liệu tổng quan (Tổng GMV, Tổng hoa hồng sàn thu về, tổng số đơn hàng thành công)
const getFinancialOverviewStats = async ({ startDate, endDate }) => {
  const query = `
    SELECT 
      COUNT(o.id) AS totalDeliveredOrders,
      SUM(o.total_amount) AS totalGMV,
      SUM(o.total_amount * (s.commission_rate / 100)) AS totalCommissionRevenue
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE o.status = 'delivered'
      AND o.payment_status = 'paid' 
      AND o.created_at BETWEEN ? AND ?
  `
  const [rows] = await pool.execute(query, [startDate, endDate])
  return {
    totalDeliveredOrders: Number(rows[0].totalDeliveredOrders) || 0,
    totalGMV: Number(rows[0].totalGMV) || 0,
    totalCommissionRevenue: Number(rows[0].totalCommissionRevenue) || 0
  }
}

// 2. Hàm bốc dữ liệu biểu đồ (Thống kê doanh thu theo từng ngày để vẽ Chart ở Frontend)
const getRevenueChartData = async ({ startDate, endDate }) => {
  const query = `
    SELECT 
      DATE(o.created_at) AS dateGroup,
      COUNT(o.id) AS orderCount,
      SUM(o.total_amount) AS dailyGMV,
      SUM(o.total_amount * (s.commission_rate / 100)) AS dailyCommission
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE o.status = 'delivered'
      AND o.payment_status = 'paid' 
      AND o.created_at BETWEEN ? AND ?
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at) ASC
  `
  const [rows] = await pool.execute(query, [startDate, endDate])
  return rows
}

// 3. Bảng xếp hạng doanh thu hoa hồng cắt về của top các Cửa hàng (Stores)
const getTopStoresByCommission = async ({ startDate, endDate, limit = 5 }) => {
  const query = `
    SELECT 
      s.id AS store_id,
      s.name AS store_name,
      COUNT(o.id) AS completedOrders,
      SUM(o.total_amount) AS storeGMV,
      SUM(o.total_amount * (s.commission_rate / 100)) AS commissionContributed
    FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE o.status = 'delivered'
      AND o.payment_status = 'paid' 
      AND o.created_at BETWEEN ? AND ?
    GROUP BY s.id
    ORDER BY commissionContributed DESC
    LIMIT ?
  `
  // Ép kiểu String cho tham số LIMIT tương thích hoàn toàn Prepared Statement
  const [rows] = await pool.execute(query, [startDate, endDate, String(limit)])
  return rows
}

export const adminFinancialModel = {
  getFinancialOverviewStats,
  getRevenueChartData,
  getTopStoresByCommission
}