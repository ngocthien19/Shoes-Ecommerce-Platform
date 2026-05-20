import { reviewService } from '~/services/user/reviewService'

const getProductReviews = async (req, res) => {
  try {
    const { slug } = req.params

    if (!slug) {
      return res.status(400).json({ message: 'Slug sản phẩm là bắt buộc.' })
    }

    const result = await reviewService.getReviewsByProductSlug(slug)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải đánh giá sản phẩm: ${error.message}` })
  }
}

const createReview = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params
    const { rating, comment, images } = req.body

    // Validate dữ liệu đầu vào cơ bản
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá là bắt buộc và phải nằm trong khoảng từ 1 đến 5 sao.' })
    }

    const result = await reviewService.createReview(userId, Number(orderId), {
      rating: Number(rating),
      comment,
      images
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi thực hiện viết đánh giá: ${error.message}` })
  }
}

const createStoreReview = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { orderId } = req.params
    const { rating, comment } = req.body

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá cửa hàng là bắt buộc (từ 1 đến 5 sao).' })
    }

    const result = await reviewService.createStoreReview(userId, Number(orderId), {
      rating: Number(rating),
      comment
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi thực hiện viết đánh giá cửa hàng: ${error.message}` })
  }
}

export const reviewController = {
  getProductReviews,
  createReview,
  createStoreReview
}