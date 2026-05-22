import { vendorAnalyticsModel } from '~/models/vendor/analytic/vendorAnalyticsModel'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorAnalyticsModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký hoặc sở hữu cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chưa kích hoạt.')
  return store.id
}

const getRevenueAnalytics = async (userId, { startDate, endDate }) => {
  const storeId = await getVerifiedStoreId(userId)

  if (!startDate || !endDate) {
    const today = new Date()
    const priorDate = new Date(new Date().setDate(today.getDate() - 30))

    // Chuyển về định dạng chuỗi YYYY-MM-DD
    startDate = startDate || priorDate.toISOString().split('T')[0]
    endDate = endDate || today.toISOString().split('T')[0]
  }

  // Chạy song song cả 5 hàm thống kê dữ liệu nâng cao
  const [overview, totalProductsSold, chartData, topProducts, categoryData] = await Promise.all([
    vendorAnalyticsModel.getRevenueOverview(storeId, startDate, endDate),
    vendorAnalyticsModel.getTotalProductsSold(storeId, startDate, endDate),
    vendorAnalyticsModel.getRevenueChartData(storeId, startDate, endDate),
    vendorAnalyticsModel.getTopSellingProducts(storeId, startDate, endDate),
    vendorAnalyticsModel.getRevenueByCategory(storeId, startDate, endDate)
  ])

  return {
    timeRange: { startDate, endDate },
    widgets: {
      totalRevenue: Number(overview.totalRevenue),
      totalOrdersSuccess: Number(overview.totalOrdersSuccess),
      totalProductsSold: totalProductsSold
    },
    chartData: chartData.map(item => ({
      date: item.date.toISOString().split('T')[0],
      revenue: Number(item.dailyRevenue),
      orders: Number(item.dailyOrders)
    })),
    topSellingProducts: topProducts.map(item => ({
      id: item.id,
      name: item.name,
      images: item.images,
      totalSold: Number(item.total_sold),
      totalRevenue: Number(item.total_revenue)
    })),
    revenueByCategory: categoryData.map(item => ({
      categoryId: item.category_id,
      categoryName: item.category_name,
      revenue: Number(item.revenue)
    }))
  }
}

export const vendorAnalyticsService = {
  getRevenueAnalytics
}