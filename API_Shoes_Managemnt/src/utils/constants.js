export const ROLE_ID = {
  ADMIN: 1,
  MANAGER: 2,
  VENDOR: 3,
  USER: 4
}

// Định nghĩa các chế độ lọc thời gian cho Dashboard Thống kê
export const ANALYTICS_TYPES = {
  TODAY: 'today',
  SEVEN_DAYS: '7days',
  ONE_MONTH: '1month',
  CUSTOM: 'custom'
}

// Bạn cũng có thể định nghĩa thêm các trạng thái đơn hàng tại đây để dùng chung cho toàn dự án
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELED: 'cancelled',
  CANCEL_REQUESTED: 'cancel_requested'
}

// Trạng thái phê duyệt sản phẩm của Manager
export const PRODUCT_MODERATION_STATUS = {
  APPROVED: 'approved',
  BANNED: 'banned',
  PENDING_REAPPROVAL: 'pending_reapproval'
}

// Phân loại đánh giá hệ thống (Dùng cho cả User viết bài, Vendor xem và Manager phân xử khiếu nại)
export const REVIEW_TYPES = {
  PRODUCT: 'product',
  STORE: 'store'
}