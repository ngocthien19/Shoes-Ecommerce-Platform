import { vendorOrderModel } from '~/models/vendor/order/vendorOrderModel'
import { ORDER_STATUS } from '~/utils/constants'

// Hàm tiện ích xác minh shop hoạt động và lấy store_id
const getVerifiedStoreId = async (userId) => {
  const store = await vendorOrderModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chờ phê duyệt.')
  return store.id
}

// 1. Lấy danh sách đơn hàng kèm chi tiết sản phẩm của từng đơn
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

// 2. Cập nhật trạng thái HÀNG LOẠT cho mảng ID từ Checkbox (Có tích hợp dòng tiền)
const updateOrderStatusBulk = async (userId, orderIds, targetStatus) => {
  const storeId = await getVerifiedStoreId(userId)

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new Error('Danh sách mã đơn hàng (IDs) không hợp lệ hoặc đang trống.')
  }

  // A. Kiểm tra tính hợp lệ của trạng thái đích truyền lên
  const validStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED]
  if (!validStatuses.includes(targetStatus)) {
    throw new Error('Trạng thái cập nhật hàng loạt không hợp lệ.')
  }

  // B. Chặn bảo mật: Xác minh toàn bộ mảng đơn hàng này 100% thuộc về shop này
  const isAllOwner = await vendorOrderModel.checkMultipleOrdersOwnership(orderIds, storeId)
  if (!isAllOwner) {
    throw new Error('Danh sách đơn hàng chứa mã không thuộc quyền quản lý của shop bạn.')
  }

  if (targetStatus === ORDER_STATUS.DELIVERED) {
    let successCount = 0
    let totalCredited = 0

    // Duyệt qua từng đơn hàng để kích nổ dòng tiền an toàn qua Transaction đơn lẻ
    for (const orderId of orderIds) {
      const currentStatus = await vendorOrderModel.getOrderStatus(orderId)
      const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })

      // Chỉ xử lý những đơn đang ở trạng thái 'shipped' và chưa bị lật trước đó
      if (currentStatus === ORDER_STATUS.SHIPPED && orderDetail.length > 0) {
        const cashFlow = await vendorOrderModel.completeOrderAndCreditStore(
          orderId,
          storeId,
          Number(orderDetail[0].total_amount)
        )
        totalCredited += cashFlow.vendorNetProfit
        successCount++
      }
    }

    return {
      message: `Xử lý giao hàng loạt thành công cho ${successCount}/${orderIds.length} đơn hàng đủ điều kiện. Tổng tiền doanh thu sạch đã được cộng vào ví balance của cửa hàng.`,
      creditedAmount: totalCredited
    }
  }

  // C. Các trạng thái khác (processing, shipped...) thì cập nhật đồng loạt bằng toán tử IN như cũ
  const affectedRows = await vendorOrderModel.updateOrderStatusBulk(orderIds, targetStatus, storeId)

  return {
    message: `Đã cập nhật trạng thái sang [${targetStatus}] thành công cho ${affectedRows} đơn hàng.`
  }
}

// 3. Cập nhật trạng thái ĐƠN LẺ (Có tích hợp dòng tiền)
const updateOrderStatus = async (userId, orderId, newStatus) => {
  const storeId = await getVerifiedStoreId(userId)

  const isOwner = await vendorOrderModel.checkOrderOwnership(orderId, storeId)
  if (!isOwner) throw new Error('Đơn hàng không chứa sản phẩm thuộc cửa hàng của bạn.')

  const currentStatus = await vendorOrderModel.getOrderStatus(orderId)
  if (!currentStatus) throw new Error('Đơn hàng không tồn tại.')

  // Kiểm tra tính hợp lệ của luồng trạng thái
  const validStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED]
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Trạng thái cập nhật không hợp lệ.')
  }

  // Chặn không cho cập nhật nếu đơn đã hoàn thành hoặc đã hủy trước đó
  if (currentStatus === ORDER_STATUS.DELIVERED || currentStatus === ORDER_STATUS.CANCELLED) {

    throw new Error('Không thể thay đổi trạng thái của đơn hàng đã hoàn thành hoặc đã hủy.')
  }

  if (newStatus === ORDER_STATUS.DELIVERED) {
    // Chặn chặt chẽ: Phải giao đi (shipped) thì mới được bấm thành công
    if (currentStatus !== ORDER_STATUS.SHIPPED) {
      throw new Error('Đơn hàng phải được chuyển sang trạng thái "Đang giao hàng (shipped)" trước khi xác nhận Giao thành công.')
    }

    // Bốc thông tin đơn hàng để lấy total_amount chạy tính toán hoa hồng
    const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })
    if (orderDetail.length === 0) throw new Error('Không thể bốc thông tin giá trị đơn hàng.')

    // Gọi hàm Transaction: lật status đơn sang delivered + lật payment_status sang paid + cộng ví balance
    const cashFlow = await vendorOrderModel.completeOrderAndCreditStore(
      orderId,
      storeId,
      Number(orderDetail[0].total_amount)
    )

    return {
      message: 'Xác nhận giao hàng thành công! Trạng thái thanh toán đã lật sang [PAID] và tiền doanh thu thực nhận đã được nạp vào ví balance của cửa hàng.',
      data: cashFlow
    }
  }

  // Đối với các trạng thái vận đơn thông thường (processing, shipped, cancelled...)
  await vendorOrderModel.updateOrderStatus(orderId, newStatus)
  return { message: `Cập nhật trạng thái đơn hàng sang [${newStatus}] thành công.` }
}

// 4. Xử lý yêu cầu hủy đơn từ khách hàng (Giữ nguyên logic phân luồng trường hợp của b)
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
    await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, finalReason)
    return { message: 'Đơn hàng đang ở trạng thái chờ duyệt, hệ thống đã thực hiện hủy trực tiếp.' }
  }

  // TRƯỜNG HỢP 2: Đơn hàng đang chờ Vendor phê duyệt hủy (cancel_requested)
  if (currentStatus === ORDER_STATUS.CANCEL_REQUESTED) {
    if (decision === 'accept') {
      const finalReason = reason ? reason : 'Người bán chấp nhận yêu cầu hủy từ khách hàng.'
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, finalReason)
      return { message: 'Đã chấp nhận yêu cầu hủy đơn hàng từ khách hàng.' }

    } else if (decision === 'reject') {
      const rejectNote = reason ? reason : 'Hàng đã được đóng gói và bàn giao cho đơn vị vận chuyển.'
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.PROCESSING, rejectNote)
      return { message: 'Đã từ chối yêu cầu hủy đơn hàng, trạng thái đơn hàng quay về Đang xử lý.' }

    } else {
      throw new Error('Quyết định xử lý không hợp lệ (chỉ chấp nhận accept hoặc reject).')
    }
  }

  // TRƯỜNG HỢP KHÁC: Đơn hàng đang ở trạng thái processing bình thường (chưa có yêu cầu hủy)
  if (currentStatus === ORDER_STATUS.PROCESSING) {
    throw new Error('Đơn hàng này chưa gửi yêu cầu hủy. Không thể thực hiện phê duyệt.')
  } else {
    throw new Error('Đơn hàng đã chuyển sang giai đoạn vận chuyển, không thể xử lý hủy.')
  }
}

export const vendorOrderService = {
  getVendorOrders,
  updateOrderStatus,
  handleCancelRequest,
  updateOrderStatusBulk
}