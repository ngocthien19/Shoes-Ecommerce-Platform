export const DEV_API_URL = 'http://localhost:3000'

export const ROLE_ID = {
  ADMIN: 1,
  MANAGER: 2,
  VENDOR: 3,
  USER: 4
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  CANCEL_REQUESTED: 'cancel_requested'
}

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded'
}

export const PAYMENT_METHODS = {
  COD: 'COD',
  VNPAY: 'VNPAY',
  MOMO: 'MOMO'
}

export const CANCEL_REASONS = [
  'Thay đổi ý định mua hàng',
  'Sai địa chỉ giao hàng',
  'Thời gian giao hàng quá lâu',
  'Đặt nhầm sản phẩm/kích cỡ',
  'Lý do khác'
]

// Định nghĩa các chế độ lọc thời gian cho Dashboard Thống kê
export const ANALYTICS_TYPES = {
  TODAY: 'today',
  SEVEN_DAYS: '7days',
  ONE_MONTH: '1month',
  CUSTOM: 'custom'
}

export const PRODUCT_MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BANNED: 'banned',
  PENDING_REAPPROVAL: 'pending_reapproval'
}