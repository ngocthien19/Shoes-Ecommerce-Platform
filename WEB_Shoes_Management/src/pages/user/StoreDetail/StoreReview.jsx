import { FiStar } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'
import { motion } from 'framer-motion'

export const StoreReview = ({ reviews = [] }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px]">
      {reviews.length === 0 ? (
        // Giao diện trống khi cửa hàng chưa có đánh giá nào
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FiStar size={48} className="text-gray-200 mb-3 animate-pulse" />
          <p className="font-bold text-sm text-gray-700">Chưa có đánh giá nào cho cửa hàng này.</p>
          <p className="text-xs text-gray-400 mt-1">Trở thành người đầu tiên mua sắm và đóng góp ý kiến cho shop nhé!</p>
        </div>
      ) : (
        // Danh sách đánh giá thật của khách hàng
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {reviews.map((review, idx) => (
            <motion.div
              variants={itemVariants}
              key={review.id || idx}
              className="flex gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0 group"
            >
              {/* Ảnh đại diện người mua */}
              <div className="relative shrink-0">
                <img
                  src={getImageUrl(review.user_avatar, 'https://placehold.co/100x100?text=User')}
                  alt={review.user_name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100 transition-transform duration-300 group-hover:scale-105 bg-gray-50"
                />
              </div>

              {/* Nội dung chi tiết đánh giá */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800 text-sm tracking-tight">{review.user_name}</h4>
                  <span className="text-gray-400 text-[10px] uppercase tracking-wide font-medium bg-gray-50 px-2 py-0.5 rounded">
                    {new Date(review.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {/* Hiển thị số Sao bằng Icon */}
                <div className="flex items-center gap-0.5 text-yellow-400 mt-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={13}
                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-200'}
                    />
                  ))}
                </div>

                {/* Đoạn nhận xét */}
                <p className="text-gray-600 text-sm leading-relaxed text-justify pr-2 break-words">
                  {review.comment}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}