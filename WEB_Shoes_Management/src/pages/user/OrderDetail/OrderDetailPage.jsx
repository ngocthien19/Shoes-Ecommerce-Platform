import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { orderTrackingApiService } from '~/services/user/orderTrackingApiService'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiBox, FiInfo } from 'react-icons/fi'
import { OrderProductList } from './OrderProductList'
import { OrderShippingInfo } from './OrderShippingInfo'
import { OrderPaymentSummary } from './OrderPaymentSummary'
import { ORDER_STATUS } from '~/utils/constant'

export const OrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await orderTrackingApiService.getOrderDetail(orderId)
        setOrder(data)
      } catch (error) {
        toast.error('Không tìm thấy đơn hàng.')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [orderId])

  if (loading || !order) return <div className="min-h-screen flex items-center justify-center"><FiBox className="animate-spin text-brand-primary" size={32} /></div>

  // Hàm render giao diện cho trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
    case ORDER_STATUS.PENDING: return <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full text-xs ml-3">ĐƠN HÀNG MỚI</span>
    case ORDER_STATUS.PROCESSING: return <span className="text-blue-500 font-bold bg-blue-50 px-3 py-1 rounded-full text-xs ml-3">ĐANG XỬ LÝ</span>
    case ORDER_STATUS.SHIPPED: return <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full text-xs ml-3">ĐANG GIAO HÀNG</span>
    case ORDER_STATUS.DELIVERED: return <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs ml-3">ĐÃ GIAO THÀNH CÔNG</span>
    case ORDER_STATUS.CANCELLED: return <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-xs ml-3">ĐÃ HỦY</span>
    case ORDER_STATUS.CANCEL_REQUESTED: return <span className="text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs ml-3">ĐANG YÊU CẦU HỦY</span>
    default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />
      {/* Nới max-w ra một xíu vì thẻ con bên trong có p-16 khá to */}
      <main className="max-w-5xl mx-auto px-4 flex-1 w-full">

        <div className="bg-white rounded-3xl p-8 md:p-16 my-8 overflow-hidden shadow-shadow-custom">

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-brand-secondary flex items-center gap-2">
              <FiInfo className="text-brand-primary" /> Chi tiết đơn hàng #{order.order_id}
              {renderStatusBadge(order.status)}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-primary transition-all duration-300 cursor-pointer"
            >
              <FiArrowLeft size={16} /> Quay lại danh sách
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <OrderProductList order={order} />
              <OrderPaymentSummary order={order} />
            </div>
            <div className="space-y-6">
              <OrderShippingInfo order={order} />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}