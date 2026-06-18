import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiShoppingBag, FiUser, FiStore, FiCalendar,
  FiDollarSign, FiCreditCard, FiTruck, FiPackage, FiClock,
  FiCheckCircle, FiXCircle, FiInfo, FiMapPin, FiPhone, FiMail,
  FiDownload, FiPrinter
} from 'react-icons/fi'
import { adminOrderApiService } from '~/services/admin/adminOrderApiService'
import { formatDateTime, formatPrice, getImageUrl } from '~/utils/formatters'
import { ORDER_STATUS, PAYMENT_STATUS } from '~/utils/constant'
import { ConfirmReasonModal } from '~/components/common/ConfirmReasonModal'

export const AdminOrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forceCancelModal, setForceCancelModal] = useState({ isOpen: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const res = await adminOrderApiService.getOrderDetail(orderId)
      setOrder(res)
    } catch (error) {
      toast.error(error.message || 'Không thể tải chi tiết đơn hàng')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) fetchOrderDetail()
  }, [orderId])

  const getStatusConfig = (status) => {
    const config = {
      [ORDER_STATUS.PENDING]: {
        label: 'Chờ xử lý',
        icon: FiClock,
        color: 'bg-amber-50 text-amber-600 border-amber-200',
        bg: 'from-amber-50/30 to-white'
      },
      [ORDER_STATUS.PROCESSING]: {
        label: 'Đang xử lý',
        icon: FiPackage,
        color: 'bg-purple-50 text-purple-600 border-purple-200',
        bg: 'from-purple-50/30 to-white'
      },
      [ORDER_STATUS.SHIPPED]: {
        label: 'Đang giao',
        icon: FiTruck,
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        bg: 'from-indigo-50/30 to-white'
      },
      [ORDER_STATUS.DELIVERED]: {
        label: 'Đã giao',
        icon: FiCheckCircle,
        color: 'bg-green-50 text-green-600 border-green-200',
        bg: 'from-green-50/30 to-white'
      },
      [ORDER_STATUS.CANCELLED]: {
        label: 'Đã hủy',
        icon: FiXCircle,
        color: 'bg-red-50 text-red-600 border-red-200',
        bg: 'from-red-50/30 to-white'
      }
    }
    return config[status] || config[ORDER_STATUS.PENDING]
  }

  const getPaymentStatusConfig = (paymentStatus) => {
    const config = {
      [PAYMENT_STATUS.PAID]: {
        label: 'Đã thanh toán',
        color: 'bg-green-50 text-green-600 border-green-200',
        icon: FiCheckCircle
      },
      [PAYMENT_STATUS.REFUNDED]: {
        label: 'Đã hoàn tiền',
        color: 'bg-purple-50 text-purple-600 border-purple-200',
        icon: FiXCircle
      },
      [PAYMENT_STATUS.UNPAID]: {
        label: 'Chưa thanh toán',
        color: 'bg-gray-50 text-gray-500 border-gray-200',
        icon: FiClock
      }
    }
    return config[paymentStatus] || config[PAYMENT_STATUS.UNPAID]
  }

  const handleForceCancel = () => {
    setForceCancelModal({ isOpen: true })
  }

  const handleConfirmForceCancel = async (reason) => {
    if (!reason || !reason.trim()) {
      toast.warning('Vui lòng nhập lý do ép hủy đơn hàng')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await adminOrderApiService.forceCancelOrder(orderId, reason)
      toast.success(res.message)
      setForceCancelModal({ isOpen: false })
      fetchOrderDetail()
    } catch (error) {
      toast.error(error.message || 'Ép hủy đơn hàng thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải chi tiết đơn hàng...
        </motion.span>
      </div>
    )
  }

  if (!order) return null

  const statusConfig = getStatusConfig(order.status)
  const paymentConfig = getPaymentStatusConfig(order.payment_status)
  const StatusIcon = statusConfig.icon
  const isCancellable = order.status !== ORDER_STATUS.DELIVERED &&
                       order.status !== ORDER_STATUS.CANCELLED

  const buyerAvatar = getImageUrl(order.buyer_avatar,
    `https://ui-avatars.com/api/?background=10b981&color=fff&name=${encodeURIComponent(order.buyer_name || 'User')}`)
  const storeLogo = getImageUrl(order.store_logo,
    `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(order.store_name || 'Store')}`)

  // Lấy ảnh sản phẩm đầu tiên
  const getProductImage = (images) => {
    if (!images) return null
    try {
      const parsed = typeof images === 'string' ? JSON.parse(images) : images
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].secure_url || parsed[0]
      }
      return null
    } catch {
      return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/orders')}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </motion.button>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Đơn hàng #{order.id}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                <StatusIcon size={14} />
                {statusConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${paymentConfig.color}`}>
                <paymentConfig.icon size={14} />
                {paymentConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <FiCalendar size={14} className="text-gray-400" />
              {formatDateTime(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCancellable && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleForceCancel}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
            >
              <FiXCircle size={16} />
              Ép hủy đơn hàng
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
          >
            <FiPrinter size={16} />
            In đơn
          </motion.button>
        </div>
      </motion.div>

      {/* Thông tin chính - 3 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin khách hàng */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FiUser className="text-blue-500" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Thông tin khách hàng</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={buyerAvatar}
                alt={order.buyer_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              />
              <div>
                <p className="font-bold text-gray-800">{order.buyer_name}</p>
                <p className="text-xs text-gray-400">ID: {order.user_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiMail size={14} className="text-gray-400" />
              <span>{order.buyer_email}</span>
            </div>

            {order.buyer_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone size={14} className="text-gray-400" />
                <span>{order.buyer_phone}</span>
              </div>
            )}

            {order.buyer_address && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <FiMapPin size={14} className="text-gray-400 mt-0.5" />
                <span>{order.buyer_address}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Thông tin cửa hàng */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FiStore className="text-emerald-500" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Thông tin cửa hàng</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={storeLogo}
                alt={order.store_name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100"
              />
              <div>
                <p className="font-bold text-gray-800">{order.store_name}</p>
                <p className="text-xs text-gray-400">ID: {order.store_id}</p>
              </div>
            </div>

            {order.store_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone size={14} className="text-gray-400" />
                <span>{order.store_phone}</span>
              </div>
            )}

            {order.store_address && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <FiMapPin size={14} className="text-gray-400 mt-0.5" />
                <span>{order.store_address}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Thông tin đơn hàng */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FiDollarSign className="text-amber-500" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Thông tin đơn hàng</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <span className="text-sm text-gray-500">Tổng tiền hàng</span>
              <span className="font-bold text-gray-800">{formatPrice(order.total_amount)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-sm text-gray-500">Giảm giá</span>
                <span className="font-bold text-red-500">-{formatPrice(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <span className="text-sm text-gray-500">Phí vận chuyển</span>
              <span className="font-bold text-gray-800">Miễn phí</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-gray-600">Thành tiền</span>
              <span className="text-xl font-black text-emerald-600">
                {formatPrice(order.total_amount - (order.discount_amount || 0))}
              </span>
            </div>

            {order.applied_voucher && (
              <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-600 font-semibold">
                  Áp dụng voucher: {order.applied_voucher}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Lý do hủy (nếu có) */}
      {order.cancel_reason && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <FiInfo className="text-red-500" size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Lý do hủy đơn hàng</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-relaxed">
                {order.cancel_reason}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Danh sách sản phẩm */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FiShoppingBag className="text-emerald-500" size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Chi tiết sản phẩm</p>
            <p className="text-xs text-gray-500">{order.items?.length || 0} sản phẩm</p>
          </div>
        </div>

        <div className="space-y-3">
          {order.items?.map((item, idx) => {
            const productImage = getProductImage(item.product_images)

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 + 0.35 }}
                whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
                className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100 transition-all duration-200"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FiShoppingBag size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.product_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Size:</span> {item.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Màu:</span>
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: item.color?.toLowerCase() || '#ccc' }}
                      />
                      {item.color}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-600">{formatPrice(item.price)}</p>
                  <p className="text-xs text-gray-400">SL: {item.quantity}</p>
                  <p className="text-xs font-semibold text-gray-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tổng kết sản phẩm */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-500">Tổng số lượng: <span className="font-bold text-gray-700">{order.items?.reduce((sum, item) => sum + item.quantity, 0)}</span></p>
            <p className="text-sm text-gray-500">Tổng tiền: <span className="font-bold text-emerald-600">{formatPrice(order.total_amount)}</span></p>
          </div>
        </div>
      </motion.div>

      {/* Modal ép hủy */}
      <ConfirmReasonModal
        isOpen={forceCancelModal.isOpen}
        onClose={() => setForceCancelModal({ isOpen: false })}
        onConfirm={handleConfirmForceCancel}
        title="Ép hủy đơn hàng"
        message={`Bạn đang chuẩn bị ép hủy đơn hàng #${order.id}. Hành động này sẽ hoàn lại số lượng tồn kho và chuyển trạng thái thanh toán sang "Đã hoàn tiền". Vui lòng nhập lý do chi tiết.`}
        placeholder="Nhập lý do ép hủy đơn hàng (tối thiểu 10 ký tự)..."
        isLoading={isSubmitting}
        type="danger"
      />
    </motion.div>
  )
}