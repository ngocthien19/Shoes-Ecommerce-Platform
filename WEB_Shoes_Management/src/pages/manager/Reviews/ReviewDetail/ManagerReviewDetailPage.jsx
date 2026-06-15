import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiUser, FiPackage, FiHome, FiStar, FiInfo,
  FiClock, FiMail, FiAlertCircle, FiCheckCircle, FiXCircle,
  FiImage, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { formatDateTime, formatRelativeTime, getImageUrl } from '~/utils/formatters'
import { managerReviewApiService } from '~/services/manager/managerReviewApiService'
import { REVIEW_TYPES } from '~/utils/constant'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'

export const ManagerReviewDetailPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || REVIEW_TYPES.PRODUCT

  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    placeholder: ''
  })

  const fetchReviewDetail = async () => {
    try {
      setLoading(true)
      const res = await managerReviewApiService.getReviewDetail(id, type)
      setReview(res)
      setCurrentImageIndex(0)
    } catch (error) {
      toast.error(error.message || 'Không thể tải thông tin đánh giá')
      navigate('/manager/reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchReviewDetail()
  }, [id, type])

  const handleResolve = async (action, reason = null) => {
    setIsLoading(true)
    try {
      const res = await managerReviewApiService.resolveReviewsBulk([id], type, action)
      toast.success(res.message)
      fetchReviewDetail()
      setModalConfig({ isOpen: false, type: null })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = () => handleResolve('approved')

  const handleBan = () => {
    setModalConfig({
      isOpen: true,
      type: 'ban',
      title: 'Xác nhận ẩn đánh giá',
      message: 'Bạn có chắc chắn muốn ẩn đánh giá này? Hành động này sẽ khiến đánh giá không còn hiển thị công khai.',
      placeholder: 'Nhập ghi chú (nếu có)...'
    })
  }

  const handleModalConfirm = async (reason) => {
    await handleResolve('banned', reason)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={20}
            className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  // Lấy danh sách ảnh từ review
  const reviewImages = review?.images && Array.isArray(review.images) && review.images.length > 0
    ? review.images
    : []

  const nextImage = () => {
    if (reviewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % reviewImages.length)
    }
  }

  const prevImage = () => {
    if (reviewImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + reviewImages.length) % reviewImages.length)
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full"
        />
        <span className="text-sm font-semibold text-gray-400 animate-pulse">Đang tải thông tin đánh giá...</span>
      </div>
    )
  }

  if (!review) return null

  const isProductReview = type === REVIEW_TYPES.PRODUCT
  const userAvatar = review.user_avatar || 'https://ui-avatars.com/api/?background=6366f1&color=fff&name=' + encodeURIComponent(review.user_name || 'User')
  const storeLogo = review.store_logo || 'https://placehold.co/100x100?text=Store'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#e5e7eb' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => navigate('/manager/reviews')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Chi tiết đánh giá {isProductReview ? 'sản phẩm' : 'cửa hàng'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">ID: #{review.review_id || review.id}</span>
              {review.is_active === 1 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
                  className="bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                >
                  ĐANG HIỂN THỊ
                </motion.span>
              ) : (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
                  className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                >
                  ĐÃ ẨN
                </motion.span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={handleApprove}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-md shadow-green-500/20 cursor-pointer"
          >
            <FiCheckCircle size={16} /> Bác đơn - Mở lại đánh giá
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={handleBan}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-bold text-sm shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <FiXCircle size={16} /> Đồng ý - Ẩn đánh giá
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Review Info */}
        <motion.div variants={fadeInLeft} className="lg:col-span-2 space-y-6">
          {/* Nội dung đánh giá */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <FiStar className="text-amber-500" size={16} />
              </div>
              Nội dung đánh giá
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.img
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    src={userAvatar}
                    alt={review.user_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-brand-primary/20"
                  />
                  <div>
                    <p className="font-extrabold text-gray-900">{review.user_name}</p>
                    <p className="text-[10px] text-gray-400">ID: #{review.user_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{formatRelativeTime(review.created_at)}</span>
                </div>
              </div>
              <div className="flex justify-center py-2">
                {renderStars(review.rating)}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-300">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.comment || 'Không có nội dung đánh giá'}
                </p>
              </div>

              {/* Hình ảnh đính kèm trong review */}
              {reviewImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiImage size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">Hình ảnh đính kèm ({reviewImages.length})</span>
                  </div>
                  <div className="relative group">
                    <div className="overflow-hidden rounded-xl bg-gray-100 aspect-video flex items-center justify-center">
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        src={getImageUrl(reviewImages[currentImageIndex], 'https://placehold.co/600x400?text=No+Image')}
                        alt={`Review image ${currentImageIndex + 1}`}
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                    {reviewImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronRight size={20} />
                        </button>
                        <div className="flex justify-center gap-1.5 mt-2">
                          {reviewImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-brand-primary w-4' : 'bg-gray-300 hover:bg-gray-400'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lý do tố cáo */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                <FiAlertCircle className="text-red-500" size={16} />
              </div>
              Lý do tố cáo
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors duration-300">
              <p className="text-red-700 font-medium">{review.report_reason || 'Không có lý do cụ thể'}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Target Info */}
        <motion.div variants={fadeInRight} className="space-y-6">
          {/* Thông tin sản phẩm / cửa hàng */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                {isProductReview ? <FiPackage className="text-brand-primary" size={16} /> : <FiHome className="text-brand-primary" size={16} />}
              </div>
              Thông tin {isProductReview ? 'sản phẩm' : 'cửa hàng'}
            </h3>
            <div className="space-y-3">
              {isProductReview ? (
                <>
                  <InfoRow label="Tên sản phẩm" value={review.product_name} />
                  <InfoRow label="Mã sản phẩm" value={`#${review.product_id}`} />
                  <InfoRow
                    label="Đường dẫn"
                    value={
                      <Link to={`/manager/products/detail/${review.product_id}`} className="text-brand-primary hover:underline inline-flex items-center gap-1 group">
                        Xem chi tiết sản phẩm
                        <FiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" size={12} />
                      </Link>
                    }
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      src={getImageUrl(storeLogo, 'https://placehold.co/80x80?text=Store')}
                      alt={review.store_name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-extrabold text-gray-900">{review.store_name}</p>
                      <p className="text-[10px] text-gray-400">ID: #{review.store_id}</p>
                    </div>
                  </div>
                  <InfoRow
                    label="Đường dẫn"
                    value={
                      <Link to={`/manager/stores/detail/${review.store_id}`} className="text-brand-primary hover:underline inline-flex items-center gap-1 group">
                        Xem chi tiết cửa hàng
                        <FiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform duration-300" size={12} />
                      </Link>
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* Thông tin người dùng */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FiUser className="text-blue-500" size={16} />
              </div>
              Thông tin người dùng
            </h3>
            <div className="space-y-3">
              <InfoRow label="Họ tên" value={review.user_name} />
              <InfoRow label="Email" value={review.user_email} />
              <InfoRow label="Thời gian tạo" value={formatDateTime(review.created_at)} />
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmReasonModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        placeholder={modalConfig.placeholder}
        isLoading={isLoading}
      />
    </motion.div>
  )
}

const InfoRow = ({ label, value }) => (
  <motion.div
    whileHover={{ x: 4 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
  >
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="font-semibold text-gray-800 text-right">{value}</span>
  </motion.div>
)