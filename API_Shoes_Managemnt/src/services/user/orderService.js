import pool from '~/config/db'
import { orderModel } from '~/models/user/order/orderModel'

const createOrderCOD = async (userId, { recipientName, recipientPhone, shippingAddress, discountAmount = 0 }) => {

  // BƯỚC 1: Lấy toàn bộ hàng trong giỏ của user ra (Lúc này đã có thêm s.commission_rate nhờ hàm model mới)
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

  // BƯỚC 3: Nhóm các sản phẩm trong giỏ theo từng `store_id` (Tách đơn tự động theo từng Shop)
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

      // A. Tính tổng tiền giày gốc của đơn hàng thuộc shop này
      const subTotal = storeItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)

      // B. Xử lý phân bổ discount_amount (Nếu b có giải thuật chia đều voucher cho từng shop thì áp dụng,
      // ở đây mặc định nếu mua lẻ đơn hoặc tính đơn giản sẽ trừ thẳng vào tổng tiền, tối thiểu tổng tiền bằng 0)
      const totalAmount = Math.max(0, subTotal - Number(discountAmount))

      // C. Bốc tỷ lệ hoa hồng snapshot của chính cửa hàng này từ item đầu tiên trong nhóm
      const commissionRateSnapshot = storeItems[0].commission_rate || 10.00

      // 1. 🌟 TẠO ĐƠN HÀNG MỚI: Truyền đầy đủ các trường dữ liệu bọc lót bảo mật tài chính xuống Model
      const orderId = await orderModel.createOrder(connection, {
        userId,
        recipientName,
        recipientPhone,
        storeId: Number(storeId),
        totalAmount,
        discount_amount: Number(discountAmount),
        commission_rate_snapshot: commissionRateSnapshot,
        shippingAddress,
        paymentMethod: 'COD'
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