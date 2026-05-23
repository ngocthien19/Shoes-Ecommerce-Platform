import { vendorOrderModel } from '~/models/vendor/order/vendorOrderModel'
import { ORDER_STATUS } from '~/utils/constants'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorOrderModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chờ phê duyệt.')
  return store.id
}

// Lấy danh sách đơn hàng kèm chi tiết sản phẩm của từng đơn
const getVendorOrders = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  // Gom các tham số bộ lọc nâng cao
  const filterParams = {
    status: filters.status || null,
    searchOrderId: filters.searchOrderId || null,
    paymentMethod: filters.paymentMethod || null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null
  }

  // Chạy song song 3 truy vấn độc lập xuống MySQL để đạt hiệu năng tối đa
  const [orders, totalItems, overviewStats] = await Promise.all([
    vendorOrderModel.getVendorOrders(storeId, { ...filterParams, limit, offset }),
    vendorOrderModel.countVendorOrders(storeId, filterParams),
    vendorOrderModel.getOrdersOverviewStats(storeId)
  ])

  // Lấy danh sách sản phẩm chi tiết đi kèm của từng đơn hàng
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await vendorOrderModel.getOrderItemsByStore(order.id)
      return {
        ...order,
        items
      }
    })
  )

  const totalPages = Math.ceil(totalItems / limit)

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit
    },
    orders: ordersWithItems
  }
}

// Cập nhật trạng thái đơn hàng (Theo tuần tự luồng vận đơn)
const updateOrderStatus = async (userId, orderId, newStatus) => {
  const storeId = await getVerifiedStoreId(userId)

  const isOwner = await vendorOrderModel.checkOrderOwnership(orderId, storeId)
  if (!isOwner) throw new Error('Đơn hàng không chứa sản phẩm thuộc cửa hàng của bạn.')

  const currentStatus = await vendorOrderModel.getOrderStatus(orderId)
  if (!currentStatus) throw new Error('Đơn hàng không tồn tại.')

  // Kiểm tra tính hợp lệ của luồng trạng thái
  const validStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED]
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Trạng thái cập nhật không hợp lệ.')
  }

  // Chặn không cho cập nhật nếu đơn đã hoàn thành hoặc đã hủy
  if (currentStatus === ORDER_STATUS.DELIVERED || currentStatus === ORDER_STATUS.CANCELED) {
    throw new Error('Không thể thay đổi trạng thái của đơn hàng đã hoàn thành hoặc đã hủy.')
  }

  await vendorOrderModel.updateOrderStatus(orderId, newStatus)
  return { message: 'Cập nhật trạng thái đơn hàng thành công.' }
}

// Xử lý yêu cầu hủy đơn từ khách hàng
const handleCancelRequest = async (userId, orderId, { decision, reason }) => {
  const storeId = await getVerifiedStoreId(userId)

  // 1. Kiểm tra quyền sở hữu đơn hàng của Shop
  const isOwner = await vendorOrderModel.checkOrderOwnership(orderId, storeId)
  if (!isOwner) throw new Error('Bạn không có quyền xử lý đơn hàng này.')

  // 2. Lấy trạng thái hiện tại của đơn hàng dưới DB
  const currentStatus = await vendorOrderModel.getOrderStatus(orderId)
  if (!currentStatus) throw new Error('Đơn hàng không tồn tại.')

  // TRƯỜNG HỢP 1: Đơn hàng đang ở trạng thái Chờ duyệt (pending) -> HỦY THẲNG
  if (currentStatus === ORDER_STATUS.PENDING) {
    const finalReason = reason ? `HỦY TỰ ĐỘNG (PENDING): ${reason}` : 'HỦY TỰ ĐỘNG: Hệ thống hủy đơn trực tiếp từ trạng thái chờ duyệt.'
    await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELED, finalReason)
    return { message: 'Đơn hàng đang ở trạng thái chờ duyệt, hệ thống đã thực hiện hủy trực tiếp.' }
  }

  // TRƯỜNG HỢP 2: Đơn hàng đang chờ Vendor phê duyệt hủy (cancel_requested)
  if (currentStatus === ORDER_STATUS.CANCEL_REQUESTED) {
    if (decision === 'accept') {
      // Nếu có truyền reason thì lấy reason, không thì để chuỗi mặc định sạch sẽ
      const finalReason = reason ? reason : 'Người bán chấp nhận yêu cầu hủy từ khách hàng.'

      // Chuyển trạng thái sang 'cancelled' và nạp lý do sạch vào DB
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELED, finalReason)
      return { message: 'Đã chấp nhận yêu cầu hủy đơn hàng từ khách hàng.' }

    } else if (decision === 'reject') {
      // Nếu có lý do từ chối thì lưu lý do đó, không thì dùng câu mặc định
      const rejectNote = reason ? reason : 'Hàng đã được đóng gói và bàn giao cho đơn vị vận chuyển.'

      // Từ chối hủy, đưa trạng thái đơn hàng quay về lại 'processing' và nạp lý do từ chối vào DB
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.PROCESSING, rejectNote)
      return { message: 'Đã từ chối yêu cầu hủy đơn hàng, trạng thái đơn hàng quay về Đang xử lý.' }

    } else {
      throw new Error('Quyết định xử lý không hợp lệ (chỉ chấp nhận accept hoặc reject).')
    }
  }

  // TRƯỜNG HỢP KHÁC: Đơn hàng đang ở trạng thái processing bình thường (chưa có yêu cầu hủy)
  // hoặc đã đi giao (shipped, delivered...) thì Vendor không được tự ý gọi API xử lý hủy này.
  if (currentStatus === ORDER_STATUS.PROCESSING) {
    throw new Error('Đơn hàng này chưa gửi yêu cầu hủy. Không thể thực hiện phê duyệt.')
  } else {
    throw new Error('Đơn hàng đã chuyển sang giai đoạn vận chuyển, không thể xử lý hủy.')
  }
}

export const vendorOrderService = {
  getVendorOrders,
  updateOrderStatus,
  handleCancelRequest
}