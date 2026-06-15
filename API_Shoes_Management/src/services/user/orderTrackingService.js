import { orderTrackingModel } from '~/models/user/order/orderTrackingModel'
import { orderModel } from '~/models/user/order/orderModel'
import { ORDER_STATUS } from '~/utils/constants'
import pool from '~/config/db'

// 1. USER: Lấy lịch sử mua hàng kèm theo mảng sản phẩm bên trong mỗi đơn
const getOrderHistory = async (userId, query) => {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.max(1, Number(query.limit) || 5)
  const status = query.status || 'all'

  const { orders, total } = await orderTrackingModel.getOrderHistoryPaginated(userId, page, limit, status)

  for (const order of orders) {
    order.items = await orderTrackingModel.getOrderItemsByOrderId(order.order_id)
  }

  const totalPages = Math.ceil(total / limit)

  const rawCounts = await orderTrackingModel.getOrderStatusCounts(userId)

  const statusCounts = rawCounts.reduce((acc, curr) => {
    acc[curr.status] = curr.count
    return acc
  }, {})

  statusCounts.all = Object.values(statusCounts).reduce((a, b) => a + b, 0)

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

// 2. USER: Xử lý logic hủy đơn hàng (Đồng bộ an toàn dữ liệu và Hoàn kho) - Có lưu lý do hủy
const cancelOrderByUser = async (userId, orderId, cancelReason) => {
  const order = await orderTrackingModel.getOrderById(orderId)

  if (!order) throw new Error('Đơn hàng không tồn tại.')
  if (order.user_id !== userId) throw new Error('Bạn không có quyền can thiệp vào đơn hàng này.')

  if ([ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.CANCEL_REQUESTED].includes(order.status)) {
    throw new Error('Đơn hàng đã thay đổi trạng thái, không thể thực hiện yêu cầu hủy.')
  }

  const orderTime = new Date(order.created_at).getTime()
  const currentTime = new Date().getTime()
  const differenceInMinutes = (currentTime - orderTime) / (1000 * 60)

  // Lý do hủy (nếu không có thì dùng mặc định)
  const finalCancelReason = cancelReason || 'Khách hàng yêu cầu hủy đơn'

  if (order.status === ORDER_STATUS.PENDING && differenceInMinutes <= 30) {
    // Hủy trực tiếp - Cập nhật status và lưu lý do
    await orderTrackingModel.updateOrderStatusWithReason(orderId, ORDER_STATUS.CANCELLED, finalCancelReason)

    const items = await orderTrackingModel.getOrderItemsByOrderId(orderId)
    for (const item of items) {
      await orderModel.decreaseVariantStock(pool, item.variant_id, -item.quantity)
    }

    return {
      status: ORDER_STATUS.CANCELLED,
      message: 'Đơn hàng của bạn đã được hủy trực tiếp thành công. Số lượng sản phẩm đã được hoàn lại vào kho hàng.'
    }
  } else {
    // Gửi yêu cầu hủy - Lưu lý do vào cancel_reason khi gửi yêu cầu
    await orderTrackingModel.updateOrderStatusWithReason(orderId, ORDER_STATUS.CANCEL_REQUESTED, finalCancelReason)
    return {
      status: ORDER_STATUS.CANCEL_REQUESTED,
      message: 'Đã gửi yêu cầu hủy đơn hàng đến cửa hàng để chờ duyệt.'
    }
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

  // Khi rút yêu cầu hủy, xóa lý do hủy
  await orderTrackingModel.withdrawCancelOrderAndClearReason(orderId)

  return {
    status: ORDER_STATUS.PROCESSING,
    message: 'Rút lại yêu cầu hủy đơn thành công! Đơn hàng đã được đưa quay trở lại danh sách chuẩn bị hàng.'
  }
}

const getOrderDetail = async (userId, orderId) => {
  const order = await orderTrackingModel.getOrderDetailByIdAndUser(orderId, userId)

  if (!order) {
    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.')
  }

  const items = await orderTrackingModel.getOrderItemsByOrderId(orderId)
  order.items = items

  return order
}

export const orderTrackingService = {
  getOrderHistory,
  cancelOrderByUser,
  handleAutoConfirmOrders,
  withdrawCancelRequest,
  getOrderDetail
}