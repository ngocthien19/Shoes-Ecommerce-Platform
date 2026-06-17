import { motion } from 'framer-motion'
import { FiHome, FiCheckCircle, FiXCircle, FiPackage } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { getImageUrl } from '~/utils/formatters'
import { ROLE_ID } from '~/utils/constant'

export const UserStoreCard = ({ user }) => {
  // Kiểm tra user có phải là Vendor không
  const isVendor = user.role_id === ROLE_ID.VENDOR

  // Dữ liệu mẫu - thực tế sẽ gọi API
  const store = {
    id: 1,
    name: 'Sneaker World',
    logo: null,
    is_active: 1,
    totalProducts: 45
  }

  if (!isVendor) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
      >
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gray-500/10 flex items-center justify-center">
            <FiHome className="text-gray-500" size={16} />
          </div>
          Thông tin cửa hàng
        </h3>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <FiHome size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Người dùng này chưa có cửa hàng</p>
          <p className="text-xs text-gray-400">Tài khoản đang ở vai trò người dùng thường</p>
        </div>
      </motion.div>
    )
  }

  const logoUrl = getImageUrl(store.logo, 'https://placehold.co/100x100?text=Store')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiHome className="text-emerald-500" size={16} />
        </div>
        Thông tin cửa hàng
      </h3>

      <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
        <img
          src={logoUrl}
          alt={store.name}
          className="w-14 h-14 rounded-xl object-cover border border-gray-200"
        />
        <div className="flex-1">
          <p className="font-extrabold text-gray-900">{store.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">ID: #{store.id}</span>
            {store.is_active === 1 ? (
              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                <FiCheckCircle size={12} /> Đang hoạt động
              </span>
            ) : (
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <FiXCircle size={12} /> Đã khóa
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <FiPackage size={12} /> {store.totalProducts} sản phẩm
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          to={`/admin/stores/${store.id}`}
          className="text-sm font-semibold text-emerald-600 hover:underline transition-all duration-200 inline-flex items-center gap-1"
        >
          Xem chi tiết cửa hàng
          <FiHome size={14} />
        </Link>
      </div>
    </motion.div>
  )
}