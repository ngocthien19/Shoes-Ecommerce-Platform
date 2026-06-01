import { vendorOrderModel } from '~/models/vendor/order/vendorOrderModel'
import { ORDER_STATUS } from '~/utils/constants'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorOrderModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký cửa hàng.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang bị khóa hoặc chờ phê duyệt.')
  return store.id
}

const getVendorOrders = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    status: filters.status || null,
    searchOrderId: filters.searchOrderId || null,
    paymentMethod: filters.paymentMethod || null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null
  }

  const [orders, totalItems, overviewStats] = await Promise.all([
    vendorOrderModel.getVendorOrders(storeId, { ...filterParams, limit, offset }),
    vendorOrderModel.countVendorOrders(storeId, filterParams),
    vendorOrderModel.getOrdersOverviewStats(storeId)
  ])

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await vendorOrderModel.getOrderItemsByStore(order.id)
      return { ...order, items }
    })
  )

  const totalPages = Math.ceil(totalItems / limit)

  return {
    overview: overviewStats,
    pagination: { totalItems, totalPages, currentPage: page, limit },
    orders: ordersWithItems
  }
}

// Cập nhật hàng loạt đơn lẻ (Có check vết Admin xích đơn)
const updateOrderStatusBulk = async (userId, orderIds, targetStatus) => {
  const storeId = await getVerifiedStoreId(userId)

  const isAllOwner = await vendorOrderModel.checkMultipleOrdersOwnership(orderIds, storeId)
  if (!isAllOwner) {
    throw new Error('Danh sách đơn hàng chứa mã không thuộc quyền quản lý của shop bạn.')
  }

  for (const orderId of orderIds) {
    const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })
    if (orderDetail[0]?.cancel_reason?.startsWith('[ADMIN FORCE CANCEL]')) {
      throw new Error(`Đơn hàng #${orderId} đã bị Ban quản trị sàn ép hủy đóng băng hệ thống. Bạn không được phép can thiệp đổi trạng thái nữa.`)
    }
  }

  if (targetStatus === ORDER_STATUS.DELIVERED) {
    let successCount = 0
    let totalCredited = 0

    for (const orderId of orderIds) {
      const currentStatus = await vendorOrderModel.getOrderStatus(orderId)
      const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })

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
      message: `Xử lý giao hàng loạt thành công cho ${successCount}/${orderIds.length} đơn hàng đủ điều kiện. Doanh thu sạch đã được cộng vào ví balance.`,
      creditedAmount: totalCredited
    }
  }

  const affectedRows = await vendorOrderModel.updateOrderStatusBulk(orderIds, targetStatus, storeId)
  return { message: `Đã cập nhật trạng thái sang [${targetStatus}] thành công cho ${affectedRows} đơn hàng.` }
}

// Điều chỉnh trạng thái đơn lẻ (Có check vết Admin xích đơn)
const updateOrderStatus = async (userId, orderId, newStatus) => {
  const storeId = await getVerifiedStoreId(userId)

  const isOwner = await vendorOrderModel.checkOrderOwnership(orderId, storeId)
  if (!isOwner) throw new Error('Đơn hàng không chứa sản phẩm thuộc cửa hàng của bạn.')

  const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })
  if (orderDetail.length === 0) throw new Error('Đơn hàng không tồn tại.')

  if (orderDetail[0].cancel_reason?.startsWith('[ADMIN FORCE CANCEL]')) {
    throw new Error('Đơn hàng này đã bị Ban quản trị sàn ép hủy tranh chấp vĩ mô. Quyết định của Admin là tối cao, Cửa hàng không có quyền thay đổi trạng thái vận đơn này nữa.')
  }

  const currentStatus = orderDetail[0].status
  if (currentStatus === ORDER_STATUS.DELIVERED || currentStatus === ORDER_STATUS.CANCELLED) {
    throw new Error('Không thể thay đổi trạng thái của đơn hàng đã hoàn thành hoặc đã hủy.')
  }

  if (newStatus === ORDER_STATUS.DELIVERED) {
    if (currentStatus !== ORDER_STATUS.SHIPPED) {
      throw new Error('Đơn hàng phải được chuyển sang trạng thái "Đang giao hàng (shipped)" trước khi xác nhận Giao thành công.')
    }

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

  await vendorOrderModel.updateOrderStatus(orderId, newStatus)
  return { message: `Cập nhật trạng thái đơn hàng sang [${newStatus}] thành công.` }
}

// Giải quyết đơn yêu cầu hủy (Có check vết Admin xích đơn)
const handleCancelRequest = async (userId, orderId, { decision, reason }) => {
  const storeId = await getVerifiedStoreId(userId)

  const isOwner = await vendorOrderModel.checkOrderOwnership(orderId, storeId)
  if (!isOwner) throw new Error('Bạn không có quyền xử lý đơn hàng này.')

  const orderDetail = await vendorOrderModel.getVendorOrders(storeId, { searchOrderId: orderId, limit: 1, offset: 0 })
  if (orderDetail.length === 0) throw new Error('Đơn hàng không tồn tại.')

  if (orderDetail[0].cancel_reason?.startsWith('[ADMIN FORCE CANCEL]')) {
    throw new Error('Đơn hàng này đã bị Ban quản trị sàn ép hủy đóng băng. Bạn không thể thực hiện phê duyệt hay từ chối hủy luồng đơn này.')
  }

  const currentStatus = orderDetail[0].status

  if (currentStatus === ORDER_STATUS.PENDING) {
    const finalReason = reason ? `HỦY TỰ ĐỘNG (PENDING): ${reason}` : 'HỦY TỰ ĐỘNG: Hệ thống hủy đơn trực tiếp từ trạng thái chờ duyệt.'
    await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, finalReason)
    return { message: 'Đơn hàng đang ở trạng thái chờ duyệt, hệ thống đã thực hiện hủy trực tiếp.' }
  }

  if (currentStatus === ORDER_STATUS.CANCEL_REQUESTED) {
    if (decision === 'accept') {
      const finalReason = reason ? reason : 'Người bán chấp nhận yêu cầu hủy từ khách hàng.'
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, finalReason)
      return { message: 'Đã chấp nhận yêu cầu hủy đơn hàng từ khách hàng.' }

    } else if (decision === 'reject') {
      const rejectNote = reason ? reason : 'Hàng đã được đóng gói và bàn giao cho đơn vị vận chuyển.'
      await vendorOrderModel.updateOrderStatus(orderId, ORDER_STATUS.PROCESSING, rejectNote)
      return { message: 'Đã từ chối yêu cầu hủy đơn hàng, trạng thái đơn hàng quay về Đang xử lý.' }
    }
  }

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