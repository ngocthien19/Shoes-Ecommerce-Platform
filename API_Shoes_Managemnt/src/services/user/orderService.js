import pool from '~/config/db'
import { orderModel } from '~/models/order/orderModel'

const createOrderCOD = async (userId, shippingAddress) => {
  // BƯỚC 1: Lấy toàn bộ hàng trong giỏ của user ra
  const cartItems = await orderModel.getCartItemsForCheckout(userId)
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Giỏ hàng của bạn đang trống rỗng, không thể thanh toán.')
  }

  // BƯỚC 2: Kiểm tra kho trước khi chạy transaction để báo lỗi sớm cho khách
  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      throw new Error(`Sản phẩm trong kho không đủ đáp ứng (Hiện còn: ${item.stock} mặt hàng).`)
    }
  }

  // BƯỚC 3: Nhóm các sản phẩm trong giỏ theo từng `store_id` (Tách đơn tự động)
  const itemsByStore = cartItems.reduce((acc, item) => {
    if (!acc[item.store_id]) acc[item.store_id] = []
    acc[item.store_id].push(item)
    return acc
  }, {})

  // BƯỚC 4: Bắt đầu kích hoạt Transaction kết nối MySQL
  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const createdOrderIds = []

    // Lặp qua từng Cửa hàng để lập đơn độc lập
    for (const storeId in itemsByStore) {
      const storeItems = itemsByStore[storeId]

      // Tính tổng tiền của đơn hàng thuộc shop này
      const totalAmount = storeItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)

      // 1. Tạo bản ghi bảng orders
      const orderId = await orderModel.createOrder(connection, {
        userId,
        storeId: Number(storeId),
        totalAmount,
        shippingAddress
      })

      createdOrderIds.push(orderId)

      // 2. Xử lý từng item trong đơn hàng của shop
      for (const item of storeItems) {
        // - Tạo bản ghi bảng order_items
        await orderModel.createOrderItem(connection, {
          orderId,
          variantId: item.variant_id,
          quantity: item.quantity,
          price: item.price
        })

        // - Trừ kho thực tế của size/màu giày đó
        await orderModel.decreaseVariantStock(connection, item.variant_id, item.quantity)

        // - Cộng số lượng đã bán (sold) cho sản phẩm tổng quát
        await orderModel.increaseProductSold(connection, item.product_id, item.quantity)
      }
    }

    // 3. Đặt hàng xong xuôi thì dọn sạch giỏ hàng của User
    await orderModel.clearUserCart(connection, userId)

    // Xác nhận lưu mọi thay đổi vào DB một cách an toàn
    await connection.commit()

    return {
      message: 'Đặt đơn hàng COD thành công!',
      orderIds: createdOrderIds
    }

  } catch (error) {
    // Nếu dính bất kỳ lỗi gì trong khối lệnh trên, hoàn nguyên DB lại như cũ ngay lập tức
    await connection.rollback()
    throw error
  } finally {
    // Trả kết nối lại về cho Pool quản lý
    connection.release()
  }
}

export const orderService = {
  createOrderCOD
}