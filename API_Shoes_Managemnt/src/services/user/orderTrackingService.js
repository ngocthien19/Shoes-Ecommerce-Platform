import { orderTrackingModel } from '~/models/user/order/orderTrackingModel'

// 1. USER: Lấy lịch sử mua hàng kèm theo mảng sản phẩm bên trong mỗi đơn
const getOrderHistory = async (userId) => {
  const orders = await orderTrackingModel.getOrderHistoryByUserId(userId)
  for (const order of orders) {
    order.items = await orderTrackingModel.getOrderItemsByOrderId(order.order_id)
  }
  return orders
}

// 2. USER: Xử lý logic hủy đơn hàng (Check mốc thời gian 30 phút)
const cancelOrderByUser = async (userId, orderId) => {
  const order = await orderTrackingModel.getOrderById(orderId)

  if (!order) throw new Error('Đơn hàng không tồn tại.')
  if (order.user_id !== userId) throw new Error('Bạn không có quyền can thiệp vào đơn hàng này.')

  // Nếu đơn đã đi giao, đã giao hoặc đã hủy/yêu cầu hủy trước đó thì chặn luôn
  if (['shipped', 'delivered', 'cancelled', 'cancel_requested'].includes(order.status)) {
    throw new Error('Đơn hàng đã thay đổi trạng thái, không thể thực hiện yêu cầu hủy.')
  }

  // Tính khoảng cách số phút từ lúc đặt đơn đến thời điểm bấm nút
  const orderTime = new Date(order.created_at).getTime()
  const currentTime = new Date().getTime()
  const differenceInMinutes = (currentTime - orderTime) / (1000 * 60)

  if (order.status === 'pending' && differenceInMinutes <= 30) {
    // Kịch bản A: Đơn mới tinh và chưa quá 30 phút -> HỦY LUÔN THẲNG CÁNH
    await orderTrackingModel.updateOrderStatus(orderId, 'cancelled')
    return { status: 'cancelled', message: 'Đơn hàng của bạn đã được hủy trực tiếp thành công.' }
  } else {
    // Kịch bản B: Đã quá 30 phút (hoặc đơn đã tự động xác nhận) -> Chuyển sang Gửi yêu cầu chờ Shop duyệt sau
    await orderTrackingModel.updateOrderStatus(orderId, 'cancel_requested')
    return { status: 'cancel_requested', message: 'Đã gửi yêu cầu hủy đơn hàng đến cửa hàng để chờ duyệt.' }
  }
}

// 3. HỆ THỐNG: Hàm trung gian để gọi lệnh chạy ngầm Cron Job
const handleAutoConfirmOrders = async () => {
  return await orderTrackingModel.autoConfirmOrders()
}

const withdrawCancelRequest = async (userId, orderId) => {
  // 1. Tìm đơn hàng xem có tồn tại không
  const order = await orderTrackingModel.getOrderById(orderId)

  if (!order) {
    throw new Error('Đơn hàng không tồn tại trên hệ thống.')
  }

  // 2. Kiểm tra tính chính chủ
  if (order.user_id !== userId) {
    throw new Error('Bạn không có quyền can thiệp vào đơn hàng này.')
  }

  // 3. RÀNG BUỘC CỨNG: Chỉ được rút yêu cầu khi đơn đang ở trạng thái 'cancel_requested'
  if (order.status !== 'cancel_requested') {
    throw new Error('Đơn hàng không ở trạng thái chờ hủy, không thể rút lại yêu cầu hủy.')
  }

  // 4. Tiến hành cập nhật lại trạng thái dưới DB
  await orderTrackingModel.withdrawCancelOrder(orderId)

  return {
    status: 'processing',
    message: 'Rút lại yêu cầu hủy đơn thành công! Đơn hàng đã được đưa quay trở lại danh sách chuẩn bị hàng.'
  }
}

export const orderTrackingService = {
  getOrderHistory,
  cancelOrderByUser,
  handleAutoConfirmOrders,
  withdrawCancelRequest
}