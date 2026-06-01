import { vendorPayoutModel } from '~/models/vendor/payout/vendorPayoutModel'
import { userModel } from '~/models/user/userModel'
import { notificationService } from '~/services/notification/notificationService'
import { NOTIFICATION_TYPES } from '~/utils/constants'

// Hàm kiểm tra tính chính chủ và trạng thái hoạt động của ví cửa hàng
const getVerifiedStoreWallet = async (userId) => {
  const store = await vendorPayoutModel.getStoreWalletDetail(userId)
  if (!store) throw new Error('Tài khoản của bạn chưa đăng ký mở cửa hàng trên sàn.')
  if (!store.is_active) throw new Error('Cửa hàng của bạn hiện đang bị khóa, không thể thực hiện rút tiền.')
  return store
}

// 1. Xử lý logic Tạo đơn yêu cầu rút tiền về ngân hàng
const createPayoutRequest = async (userId, payoutData) => {
  const store = await getVerifiedStoreWallet(userId)
  const requestAmount = Number(payoutData.amount)

  // CHẶN NGHIỆP VỤ: Nếu số tiền muốn rút vượt quá số dư hiện có trong ví balance
  if (requestAmount > Number(store.balance)) {
    throw new Error(`Số dư ví không đủ để thực hiện lệnh rút này. Số dư hiện tại của bạn là: ${Number(store.balance).toLocaleString('vi-VN')} VNĐ.`)
  }

  // Thực thi trừ tiền tạm tính và tạo đơn qua Transaction bảo mật
  const requestId = await vendorPayoutModel.createPayoutRequestTransaction(store.id, {
    amount: requestAmount,
    bankName: payoutData.bankName,
    accountNumber: payoutData.accountNumber,
    accountName: payoutData.accountName.toUpperCase()
  })

  // BẮN THÔNG BÁO CHO TẤT CẢ ADMIN
  let logoUrl = ''
  try {
    const parsedLogo = store.logo ? (typeof store.logo === 'string' ? JSON.parse(store.logo) : store.logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (e) {
    console.log('Không parse được logo shop')
  }

  const adminIds = await userModel.getAllAdminIds()

  if (adminIds.length > 0) {
    await Promise.all(
      adminIds.map((adminId) => {
        return notificationService.createAndPushNotification({
          userId: adminId,
          title: 'Yêu cầu rút tiền mới',
          content: JSON.stringify({
            message: `Gian hàng "${store.store_name}" vừa đặt lệnh rút ${requestAmount.toLocaleString('vi-VN')} VNĐ.`,
            image: logoUrl
          }),
          type: NOTIFICATION_TYPES.PAYOUT_REQUESTED,
          referenceId: requestId
        }).catch(err => console.error('Lỗi bắn socket payout báo Admin:', err.message))
      })
    )
  }

  return {
    message: 'Gửi yêu cầu rút tiền thành công! Số tiền yêu cầu đã được tạm khóa để chờ ban quản trị sàn phê duyệt chuyển khoản.',
    payoutRequestId: requestId
  }
}

// 2. Xử lý xem lịch sử rút tiền phân trang của shop
const getPayoutHistory = async (userId, queryParams) => {
  const store = await getVerifiedStoreWallet(userId)

  const page = Number(queryParams.page) || 1
  const limit = Number(queryParams.limit) || 10
  const offset = (page - 1) * limit

  const [history, totalItems] = await Promise.all([
    vendorPayoutModel.getVendorPayoutHistory(store.id, { limit, offset }),
    vendorPayoutModel.countVendorPayoutHistory(store.id)
  ])

  return {
    currentBalance: Number(store.balance),
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    history
  }
}

export const vendorPayoutService = {
  createPayoutRequest,
  getPayoutHistory
}