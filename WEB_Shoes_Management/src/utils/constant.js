export const DEV_API_URL = 'http://localhost:3000'

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