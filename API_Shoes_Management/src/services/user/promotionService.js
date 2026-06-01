import { promotionModel } from '~/models/user/promotion/promotionModel.js'

const applyPromotion = async (code, storeId, currentOrderValue) => {
  // 1. Gọi sang Model kiểm tra sự tồn tại và thời hạn của mã
  const voucher = await promotionModel.getActivePromotionByCode(code, storeId)

  if (!voucher) {
    throw new Error('Mã giảm giá không tồn tại, đã hết hạn sử dụng hoặc không áp dụng cho cửa hàng này.')
  }

  // 2. Kiểm tra điều kiện giá trị đơn hàng tối thiểu (min_order_value)
  if (Number(currentOrderValue) < Number(voucher.min_order_value)) {
    throw new Error(`Đơn hàng của pro chưa đủ điều kiện áp dụng mã này (Yêu cầu tổng đơn từ: ${Number(voucher.min_order_value)}đ).`)
  }

  // 3. Tiến hành tính toán số tiền thực tế được giảm
  let discountAmount = Number(voucher.discount_value)

  // Bẫy chặn: Nếu voucher có quy định mức giảm tối đa (max_discount_amount)
  if (voucher.max_discount_amount && discountAmount > Number(voucher.max_discount_amount)) {
    discountAmount = Number(voucher.max_discount_amount)
  }

  // 4. Tính toán số tiền cuối cùng khách phải trả (Không được âm dưới 0đ)
  const finalAmount = Math.max(0, Number(currentOrderValue) - discountAmount)

  return {
    voucherId: voucher.id,
    voucherName: voucher.name,
    discountAmount,
    finalAmount,
    message: 'Áp dụng mã giảm giá thành công!'
  }
}

export const promotionService = {
  applyPromotion
}