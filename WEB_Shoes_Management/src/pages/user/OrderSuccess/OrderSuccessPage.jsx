import { FiCheck } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { RecommendedProducts } from '~/components/user/RecommendedProducts'

export const OrderSuccessPage = () => {
  const location = useLocation()

  const orderData = location.state?.orderData
  const categoryIds = location.state?.categoryIds || []
  const excludedIds = location.state?.excludedIds || []

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
        <div className="bg-white ring ring-brand-primary/50 max-w-[480px] w-full rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center animate-fadeIn mb-12">

          {/* Icon Tick Xanh */}
          <div className="w-24 h-24 rounded-full border-[3px] border-[#00bfa5] flex items-center justify-center mb-6">
            <FiCheck size={48} className="text-[#00bfa5]" />
          </div>

          {/* Tiêu đề & Lời cảm ơn */}
          <h1 className="text-2xl font-extrabold text-brand-secondary mb-3 tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 px-4">
            Cảm ơn bạn đã mua sắm tại <span className="text-base font-extrabold text-brand-primary tracking-wide">Shoes Shop</span>.<br />
            Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
          </p>

          {/* Khối thông tin đơn hàng */}
          <div className="bg-gray-50/80 w-full rounded-2xl p-5 space-y-3.5 mb-8 border border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Mã đơn hàng:</span>
              <span className="font-bold text-gray-900">{orderData?.orderId || '#ORD-UNKNOWN'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Ngày đặt:</span>
              <span className="font-bold text-gray-900">{orderData?.orderDate || 'Đang cập nhật'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Phương thức:</span>
              <span className="font-bold text-gray-900">{orderData?.paymentMethod || 'COD'}</span>
            </div>
          </div>

          {/* Cụm nút Hành động */}
          <div className="w-full space-y-3">
            <Link
              to="/orders"
              className="w-full flex items-center justify-center py-3.5 bg-[#f04a5e] hover:bg-[#d93c50] text-white font-bold rounded-xl transition-all duration-300 shadow-sm active:scale-95"
            >
              Theo dõi đơn hàng
            </Link>

            <Link
              to="/products"
              className="w-full flex items-center justify-center py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 active:scale-95"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <div className="w-full animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <RecommendedProducts
            type="post-checkout"
            categoryIds={categoryIds}
            excludedIds={excludedIds}
            limit={8}
          />
        </div>

      </main>

      <Footer />
    </div>
  )
}