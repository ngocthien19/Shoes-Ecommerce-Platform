import { FiPackage, FiHome, FiFlag, FiDollarSign, FiAlertCircle, FiShoppingCart, FiMessageCircle, FiTag, FiBell, FiUser, FiMail, FiClock, FiMapPin, FiPhone } from 'react-icons/fi'
import { NOTIFICATION_TYPES, ROLE_ID } from '~/utils/constant'

export const getIconByType = (type) => {
  switch (type) {
  case NOTIFICATION_TYPES.PRODUCT_PENDING:
  case NOTIFICATION_TYPES.PRODUCT_APPROVED:
  case NOTIFICATION_TYPES.PRODUCT_REJECTED:
  case NOTIFICATION_TYPES.PRODUCT_BANNED:
  case NOTIFICATION_TYPES.PRODUCT_REAPPROVAL:
    return { icon: FiPackage, color: 'text-blue-500', bg: 'bg-blue-50' }
  case NOTIFICATION_TYPES.STORE_PENDING:
  case NOTIFICATION_TYPES.STORE_APPROVED:
  case NOTIFICATION_TYPES.STORE_REJECTED:
  case NOTIFICATION_TYPES.STORE_BANNED:
    return { icon: FiHome, color: 'text-purple-500', bg: 'bg-purple-50' }
  case NOTIFICATION_TYPES.REVIEW_REPORTED:
  case NOTIFICATION_TYPES.REVIEW_REOPEN_REQUESTED:
  case NOTIFICATION_TYPES.REVIEW_RESOLVED_APPROVED:
  case NOTIFICATION_TYPES.REVIEW_RESOLVED_BANNED:
    return { icon: FiFlag, color: 'text-amber-500', bg: 'bg-amber-50' }
  case NOTIFICATION_TYPES.PAYOUT_REQUESTED:
  case NOTIFICATION_TYPES.PAYOUT_APPROVED:
  case NOTIFICATION_TYPES.PAYOUT_REJECTED:
    return { icon: FiDollarSign, color: 'text-green-500', bg: 'bg-green-50' }
  case NOTIFICATION_TYPES.APPEAL_REQUESTED:
  case NOTIFICATION_TYPES.APPEAL_APPROVED:
  case NOTIFICATION_TYPES.APPEAL_REJECTED:
    return { icon: FiAlertCircle, color: 'text-red-500', bg: 'bg-red-50' }
  case 'ORDER_NEW':
  case 'ORDER_CANCELLED':
  case 'ORDER_DELIVERED':
    return { icon: FiShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50' }
  case 'CHAT_MESSAGE':
    return { icon: FiMessageCircle, color: 'text-teal-500', bg: 'bg-teal-50' }
  case 'PROMOTION_EXPIRED':
    return { icon: FiTag, color: 'text-pink-500', bg: 'bg-pink-50' }
  default:
    return { icon: FiBell, color: 'text-gray-500', bg: 'bg-gray-50' }
  }
}

export const parseContent = (content) => {
  try {
    return JSON.parse(content)
  } catch {
    return { message: content }
  }
}

export const getLinkByType = (notification, userRole) => {
  const { type, reference_id } = notification

  if (userRole === ROLE_ID.VENDOR) {
    switch (type) {
    case NOTIFICATION_TYPES.PRODUCT_PENDING:
    case NOTIFICATION_TYPES.PRODUCT_APPROVED:
    case NOTIFICATION_TYPES.PRODUCT_REJECTED:
    case NOTIFICATION_TYPES.PRODUCT_BANNED:
    case NOTIFICATION_TYPES.PRODUCT_REAPPROVAL:
      return reference_id ? `/vendor/products/detail/${reference_id}` : null
    case NOTIFICATION_TYPES.STORE_PENDING:
    case NOTIFICATION_TYPES.STORE_APPROVED:
    case NOTIFICATION_TYPES.STORE_REJECTED:
    case NOTIFICATION_TYPES.STORE_BANNED:
      return '/vendor/profile-store'
    case NOTIFICATION_TYPES.PAYOUT_REQUESTED:
    case NOTIFICATION_TYPES.PAYOUT_APPROVED:
    case NOTIFICATION_TYPES.PAYOUT_REJECTED:
      return '/vendor/payouts'
    case NOTIFICATION_TYPES.REVIEW_REPORTED:
    case NOTIFICATION_TYPES.REVIEW_REOPEN_REQUESTED:
      return '/vendor/reviews'
    default:
      return null
    }
  }

  if (userRole === ROLE_ID.USER) {
    switch (type) {
    case 'ORDER_NEW':
    case 'ORDER_DELIVERED':
    case 'ORDER_CANCELLED':
      return reference_id ? `/orders/${reference_id}` : '/orders'
    case 'CHAT_MESSAGE':
      return '/chat'
    default:
      return null
    }
  }

  if (userRole === ROLE_ID.MANAGER) {
    switch (type) {
    case NOTIFICATION_TYPES.PRODUCT_PENDING:
    case NOTIFICATION_TYPES.PRODUCT_REAPPROVAL:
      return reference_id ? `/manager/products/detail/${reference_id}` : null
    case NOTIFICATION_TYPES.STORE_PENDING:
      return reference_id ? `/manager/stores/detail/${reference_id}` : null
    case NOTIFICATION_TYPES.REVIEW_REPORTED:
    case NOTIFICATION_TYPES.REVIEW_REOPEN_REQUESTED:
      return reference_id ? `/manager/reviews/detail/${reference_id}` : null
    default:
      return null
    }
  }

  if (userRole === ROLE_ID.ADMIN) {
    switch (type) {
    case NOTIFICATION_TYPES.PAYOUT_REQUESTED:
      return reference_id ? `/admin/financial/payouts/${reference_id}` : '/admin/financial/payouts'
    case NOTIFICATION_TYPES.STORE_PENDING:
      return reference_id ? `/admin/stores/detail/${reference_id}` : null
    case NOTIFICATION_TYPES.APPEAL_REQUESTED:
      return reference_id ? `/admin/appeals/detail/${reference_id}` : null
    default:
      return null
    }
  }

  return null
}

export const getDetailItems = (contentData) => {
  const detailItems = []

  if (contentData.ownerName) {
    detailItems.push({ icon: FiUser, label: 'Người đăng ký', value: contentData.ownerName })
  }
  if (contentData.ownerEmail) {
    detailItems.push({ icon: FiMail, label: 'Email', value: contentData.ownerEmail })
  }
  if (contentData.productName) {
    detailItems.push({ icon: FiPackage, label: 'Sản phẩm', value: contentData.productName })
  }
  if (contentData.amount) {
    detailItems.push({
      icon: FiDollarSign,
      label: 'Số tiền',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contentData.amount)
    })
  }
  if (contentData.count) {
    detailItems.push({ icon: FiPackage, label: 'Số lượng', value: contentData.count })
  }
  if (contentData.date) {
    detailItems.push({ icon: FiClock, label: 'Thời gian', value: contentData.date })
  }
  if (contentData.address) {
    detailItems.push({ icon: FiMapPin, label: 'Địa chỉ', value: contentData.address })
  }
  if (contentData.phone) {
    detailItems.push({ icon: FiPhone, label: 'SĐT', value: contentData.phone })
  }
  if (contentData.orderId) {
    detailItems.push({ icon: FiShoppingCart, label: 'Mã đơn hàng', value: `#${contentData.orderId}` })
  }

  return detailItems
}

export const getRoleText = (userRole) => {
  switch (userRole) {
  case ROLE_ID.ADMIN: return 'Quản trị viên'
  case ROLE_ID.MANAGER: return 'Điều hành viên'
  case ROLE_ID.VENDOR: return 'Người bán'
  case ROLE_ID.USER: return 'Khách hàng'
  default: return ''
  }
}