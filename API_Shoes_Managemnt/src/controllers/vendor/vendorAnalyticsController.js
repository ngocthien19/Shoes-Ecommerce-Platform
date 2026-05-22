import { vendorAnalyticsService } from '~/services/vendor/vendorAnalyticsService'

const getRevenueAnalytics = async (req, res) => {
  try {
    // Lấy userId từ mã token sau khi đi qua chiếc kính lọc authMiddleware
    const userId = req.jwtDecoded?.id

    // Đón nhận 2 bộ lọc thời gian cực kỳ quan trọng từ URL Query (?startDate=...&endDate=...)
    const { startDate, endDate } = req.query

    // Gọi xuống tầng Service để xử lý gộp 5 luồng dữ liệu
    const result = await vendorAnalyticsService.getRevenueAnalytics(userId, {
      startDate,
      endDate
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi khi lấy báo cáo thống kê doanh thu: ${error.message}`
    })
  }
}

export const vendorAnalyticsController = {
  getRevenueAnalytics
}