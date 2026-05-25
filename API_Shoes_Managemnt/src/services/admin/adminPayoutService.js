import { adminPayoutModel } from '~/models/admin/payout/adminPayoutModel'
import { PAYOUT_STATUS } from '~/utils/constants'

// 1. Logic bốc danh sách đơn rút tiền kèm phân trang
const getPayoutList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    status: filters.status || null,
    limit: String(limit),
    offset: String(offset)
  }

  const [payouts, totalItems] = await Promise.all([
    adminPayoutModel.getPayoutRequests(filterParams),
    adminPayoutModel.countPayoutRequests(filterParams)
  ])

  return {
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    payouts
  }
}

// 2. LOGIC XEM CHI TIẾT: Kiểm tra tồn tại lệnh rút tiền
const getPayoutDetail = async (payoutId) => {
  const payout = await adminPayoutModel.getPayoutDetail(payoutId)
  if (!payout) {
    throw new Error('Không tìm thấy thông tin chi tiết của yêu cầu rút tiền này.')
  }
  return payout
}

// 3. Logic xử lý Phê duyệt hoặc Từ chối lệnh rút tiền vĩ mô
const processPayout = async (payoutId, { targetStatus, adminNote }) => {
  // Kiểm tra sự tồn tại bằng chính hàm chi tiết vừa viết bên trên
  const payout = await adminPayoutModel.getPayoutDetail(payoutId)
  if (!payout) throw new Error('Không tìm thấy yêu cầu rút tiền này trên hệ thống.')

  if (payout.status !== PAYOUT_STATUS.PENDING) {
    throw new Error(`Yêu cầu rút tiền này đã được xử lý từ trước với trạng thái là [${payout.status.toUpperCase()}].`)
  }

  await adminPayoutModel.processPayoutTransaction(
    payoutId,
    payout.store_id,
    Number(payout.amount),
    targetStatus,
    adminNote
  )

  return {
    message: targetStatus === PAYOUT_STATUS.APPROVED
      ? 'Đã phê duyệt lệnh rút tiền thành công! Hệ thống ghi nhận tiền mặt đã chuyển khoản tới Vendor.'
      : 'Đã từ chối lệnh rút tiền! Số tiền rút đã được hoàn trả nguyên vẹn về ví balance của Store.'
  }
}

export const adminPayoutService = {
  getPayoutList,
  getPayoutDetail,
  processPayout
}