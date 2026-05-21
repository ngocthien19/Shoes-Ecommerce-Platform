import pool from '~/config/db.js'
import { reviewModel } from '~/models/user/review/reviewModel'

const getReviewsByProductSlug = async (slug) => {
  const reviews = await reviewModel.getReviewsByProductSlug(slug)

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0

  return {
    totalReviews,
    averageRating: Number(averageRating),
    reviews
  }
}

const createReview = async (userId, orderId, { rating, comment, images }) => {
  // A. Kiểm tra tính hợp lệ của đơn hàng
  const order = await reviewModel.getOrderForReview(orderId, userId)
  if (!order) {
    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền đánh giá đơn hàng này.')
  }
  if (order.status !== 'delivered') {
    throw new Error('Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được giao thành công.')
  }

  // B. Khởi tạo kết nối Transaction của MySQL
  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    // C. Tìm tất cả các sản phẩm có trong đơn hàng này
    const productsInOrder = await reviewModel.getProductIdsByOrderId(orderId)
    if (productsInOrder.length === 0) {
      throw new Error('Đơn hàng không chứa sản phẩm nào hợp lệ để đánh giá.')
    }

    // D. Lặp qua từng sản phẩm trong đơn để lưu đánh giá và cập nhật lại điểm số trung bình
    for (const item of productsInOrder) {
      await reviewModel.createProductReview(connection, {
        userId,
        productId: item.product_id,
        orderId,
        rating,
        comment,
        images: images || [] // Chuỗi mảng ảnh từ Cloudinary truyền lên, nếu không có thì để mảng rỗng
      })

      // Cập nhật lại rating_avg cho sản phẩm đó ngay lập tức
      await reviewModel.updateProductRatingAvg(connection, item.product_id)
    }

    await connection.commit()
    return { message: 'Đăng bài đánh giá sản phẩm thành công!' }
  } catch (error) {
    // Nếu có bất kỳ lỗi nào xảy ra, rollback lại toàn bộ để tránh lỗi lệch dữ liệu điểm số
    await connection.rollback()
    throw error
  } finally {
    // Giải phóng kết nối quay lại pool
    connection.release()
  }
}

const createStoreReview = async (userId, orderId, { rating, comment }) => {
  // A. Kiểm tra đơn hàng có hợp lệ và đã giao thành công chưa
  const order = await reviewModel.getOrderForReview(orderId, userId)
  if (!order) {
    throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền đánh giá.')
  }
  if (order.status !== 'delivered') {
    throw new Error('Bạn chỉ có thể đánh giá cửa hàng sau khi đơn hàng đã được giao thành công.')
  }

  // B. Kích hoạt Transaction để đảm bảo tính đồng bộ dữ liệu điểm số
  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    // C. Lưu đánh giá vào bảng store_reviews (Lấy store_id trực tiếp từ thông tin đơn hàng `order`)
    await reviewModel.createStoreReview(connection, {
      userId,
      storeId: order.store_id,
      rating,
      comment
    })

    // D. Cập nhật lại điểm trung bình rating_average cho bảng stores
    await reviewModel.updateStoreRatingAvg(connection, order.store_id)

    await connection.commit()
    return { message: 'Đăng bài đánh giá cửa hàng thành công!' }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const reviewService = {
  getReviewsByProductSlug,
  createReview,
  createStoreReview
}