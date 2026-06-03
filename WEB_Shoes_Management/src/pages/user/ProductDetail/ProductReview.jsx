import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { reviewService } from '~/services/user/reviewService'
import { formatReview } from '~/utils/formatters'

export const ProductReview = ({ product }) => {
  const [reviewData, setReviewData] = useState({ totalReviews: 0, averageRating: 0, reviews: [] })
  const [loading, setLoading] = useState(false)

  // Gọi API lấy review dựa vào slug của sản phẩm
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.slug) return
      try {
        setLoading(true)
        const data = await reviewService.getProductReviews(product.slug)
        setReviewData(data)
      } catch (error) {
        console.error('Lỗi khi fetch đánh giá:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [product?.slug])

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mt-8">
      <Tabs defaultValue="description" className="w-full">
        <TabsList variant="line" className="w-full flex justify-start border-b border-gray-200 mb-6">
          <TabsTrigger value="description" className="text-base font-semibold px-6 py-3 cursor-pointer">
            Mô tả sản phẩm
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-base font-semibold px-6 py-3 cursor-pointer">
            Đánh giá ({formatReview(reviewData.totalReviews)})
          </TabsTrigger>
        </TabsList>

        {/* Nội dung Tab Mô tả */}
        <TabsContent value="description" className="text-gray-600 leading-relaxed space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Chi tiết sản phẩm</h3>
          {/* Dùng pre-wrap để giữ nguyên các dấu xuống dòng trong chuỗi mô tả */}
          <div className="whitespace-pre-wrap">
            {product?.description || 'Chưa có mô tả cho sản phẩm này.'}
          </div>
        </TabsContent>

        {/* Nội dung Tab Đánh giá */}
        <TabsContent value="reviews">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Khách hàng đánh giá</h3>

          {/* Tổng quan Đánh giá */}
          <div className="flex items-center gap-6 p-6 bg-[#e94560]/5 rounded-2xl mb-8 border border-[#e94560]/10">
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="text-4xl font-extrabold text-brand-primary">{reviewData.averageRating}</span>
              <span className="text-sm text-gray-500 mt-1">trên 5</span>
            </div>
            <div className="space-y-1">
              <div className="text-yellow-400 text-xl tracking-widest">
                {'★'.repeat(Math.round(reviewData.averageRating))}{'☆'.repeat(5 - Math.round(reviewData.averageRating))}
              </div>
              <p className="text-sm text-gray-600">Dựa trên {formatReview(reviewData.totalReviews)} lượt đánh giá</p>
            </div>
          </div>

          {/* Danh sách bình luận */}
          {loading ? (
            <div className="text-center text-gray-500 py-4">Đang tải đánh giá...</div>
          ) : reviewData.reviews.length > 0 ? (
            <div className="space-y-6">
              {reviewData.reviews.map((review) => {
                const avatarUrl = review.user_avatar?.secure_url || 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User'
                const date = new Date(review.created_at).toLocaleDateString('vi-VN')

                return (
                  <div key={review.review_id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                    <img
                      src={avatarUrl}
                      alt={review.user_name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200"
                      onError={(e) => { e.target.src = 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User' }}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{review.user_name}</h4>
                        <span className="text-xs text-gray-400">{date}</span>
                      </div>
                      <div className="text-yellow-400 text-sm">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">
              Chưa có đánh giá nào cho sản phẩm này.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}