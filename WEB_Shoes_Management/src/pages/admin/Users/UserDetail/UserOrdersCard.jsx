import { motion } from 'framer-motion'
import { FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatPrice } from '~/utils/formatters'

export const UserOrdersCard = ({ user }) => {
  // Dữ liệu mẫu - thực tế sẽ gọi API
  const orderStats = {
    total: 12,
    totalSpent: 5500000,
    pending: 2,
    delivered: 8
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <FiShoppingBag className="text-blue-500" size={16} />
        </div>
        Thông tin đơn hàng
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng đơn</p>
          <p className="text-2xl font-black text-gray-900">{orderStats.total}</p>
        </div>
        <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng chi tiêu</p>
          <p className="text-lg font-black text-emerald-600">{formatPrice(orderStats.totalSpent)}</p>
        </div>
        <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Đang xử lý</p>
          <p className="text-2xl font-black text-amber-600">{orderStats.pending}</p>
        </div>
        <div className="bg-gray-50/50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Đã giao</p>
          <p className="text-2xl font-black text-green-600">{orderStats.delivered}</p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          to={`/admin/orders?userId=${user.id}`}
          className="text-sm font-semibold text-emerald-600 hover:underline transition-all duration-200 inline-flex items-center gap-1"
        >
          Xem tất cả đơn hàng
          <FiPackage size={14} />
        </Link>
      </div>
    </motion.div>
  )
}