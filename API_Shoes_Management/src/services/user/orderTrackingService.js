import { orderTrackingModel } from '~/models/user/order/orderTrackingModel'
import { orderModel } from '~/models/user/order/orderModel'
import { ORDER_STATUS } from '~/utils/constants'
import pool from '~/config/db'

// 1. USER: Lấy lịch sử mua hàng kèm theo mảng sản phẩm bên trong mỗi đơn
const getOrderHistory = async (userId, query) => {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.max(1, Number(query.limit) || 5)
  const status = query.status || 'all'

  // 1. Gọi hàm phân trang cũ
  const { orders, total } = await orderTrackingModel.getOrderHistoryPaginated(userId, page, limit, status)

  for (const order of orders) {
    order.items = await orderTrackingModel.getOrderItemsByOrderId(order.order_id)
  }

  const totalPages = Math.ceil(total / limit)

  // Lấy số lượng của từng trạng thái để hiển thị lên Tabs
  const rawCounts = await orderTrackingModel.getOrderStatusCounts(userId)

  // Chuyển mảng [{status: 'pending', count: 2}] thành Object { pending: 2, shipped: 1 }
  const statusCounts = rawCounts.reduce((acc, curr) => {
    acc[curr.status] = curr.count
    return acc
  }, {})

  // Tổng số tất cả đơn hàng
  statusCounts.all = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  // 3. Trả về cả danh sách và bộ đếm
  return {
    pagination: {
      totalItems: total,
      totalPages: totalPages,
      currentPage: page,
      limit: limit
    },
    statusCounts: statusCounts,
    orders: orders
  }
}

// 2. USER: Xử lý logic hủy đơn hàng (Đồng bộ an toàn dữ liệu và Hoàn kho)
const cancelOrderByUser = async (userId, orderId) => {
  const order = await orderTrackingModel.getOrderById(orderId)

  if (!order) throw new Error('Đơn hàng không tồn tại.')
  if (order.user_id !== userId) throw new Error('Bạn không có quyền can thiệp vào đơn hàng này.')

  // Nếu đơn đã đi giao, đã giao hoặc đã hủy/yêu cầu hủy trước đó thì chặn luôn (Đồng bộ chữ cancelled)
  if ([ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.CANCEL_REQUESTED].includes(order.status)) {
    throw new Error('Đơn hàng đã thay đổi trạng thái, không thể thực hiện yêu cầu hủy.')
  }

  // Tính khoảng cách số phút từ lúc đặt đơn đến thời điểm bấm nút
  const orderTime = new Date(order.created_at).getTime()
  const currentTime = new Date().getTime()
  const differenceInMinutes = (currentTime - orderTime) / (1000 * 60)

  if (order.status === ORDER_STATUS.PENDING && differenceInMinutes <= 30) {
    // KỊCH BẢN A: Đơn mới tinh và chưa quá 30 phút -> HỦY LUÔN THẲNG CÁNH VÀ HOÀN KHO
    const items = await orderTrackingModel.getOrderItemsByOrderId(orderId)

    // Tạo kết nối pool thủ công để chạy chuỗi lệnh hoàn kho an toàn nếu cần, hoặc chạy tuần tự
    await orderTrackingModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED)

    // Trả lại số lượng kho cho biến thể giày khi hủy trực tiếp
    for (const item of items) {
      // Vì hàm decreaseVariantStock dùng phép trừ (stock = stock - quantity),
      // truyền số lượng âm (-item.quantity) vào sẽ biến thành phép cộng (stock = stock - (-quantity) => stock + quantity)
      await orderModel.decreaseVariantStock(pool, item.variant_id, -item.quantity)
    }

    return { status: ORDER_STATUS.CANCELLED, message: 'Đơn hàng của bạn đã được hủy trực tiếp thành công. Số lượng sản phẩm đã được hoàn lại vào kho hàng.' }
  } else {
    // KỊCH BẢN B: Đã quá 30 phút -> Chuyển sang Gửi yêu cầu chờ Shop duyệt sau
    await orderTrackingModel.updateOrderStatus(orderId, ORDER_STATUS.CANCEL_REQUESTED)
    return { status: ORDER_STATUS.CANCEL_REQUESTED, message: 'Đã gửi yêu cầu hủy đơn hàng đến cửa hàng để chờ duyệt.' }
  }
}

// 3. HỆ THỐNG: Hàm trung gian để gọi lệnh chạy ngầm Cron Job
const handleAutoConfirmOrders = async () => {
  return await orderTrackingModel.autoConfirmOrders()
}

const withdrawCancelRequest = async (userId, orderId) => {
  const order = await orderTrackingModel.getOrderById(orderId)
  if (!order) throw new Error('Đơn hàng không tồn tại trên hệ thống.')
  if (order.user_id !== userId) throw new Error('Bạn không có quyền can thiệp vào đơn hàng này.')

  if (order.status !== ORDER_STATUS.CANCEL_REQUESTED) {
    throw new Error('Đơn hàng không ở trạng thái chờ hủy, không thể rút lại yêu cầu hủy.')
  }

  await orderTrackingModel.withdrawCancelOrder(orderId)
  return {
    status: ORDER_STATUS.PROCESSING,
    message: 'Rút lại yêu cầu hủy đơn thành công! Đơn hàng đã được đưa quay trở lại danh sách chuẩn bị hàng.'
  }
}

export const orderTrackingService = {
  getOrderHistory,
  cancelOrderByUser,
  handleAutoConfirmOrders,
  withdrawCancelRequest
}