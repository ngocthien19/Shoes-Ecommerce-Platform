import { motion } from 'framer-motion'
import { FiHome, FiMapPin, FiFileText, FiCalendar, FiStar, FiDollarSign, FiPercent } from 'react-icons/fi'
import { formatDateTime, formatPrice } from '~/utils/formatters'

export const StoreInfoCard = ({ store }) => {
  const infoItems = [
    { icon: FiHome, label: 'Tên cửa hàng', value: store.name },
    { icon: FiMapPin, label: 'Địa chỉ', value: store.address || 'Chưa cập nhật' },
    { icon: FiFileText, label: 'Giới thiệu', value: store.bio || 'Chưa có giới thiệu' },
    { icon: FiCalendar, label: 'Ngày tạo', value: formatDateTime(store.created_at) },
    { icon: FiStar, label: 'Đánh giá trung bình', value: `${Number(store.rating_average || 0).toFixed(1)} / 5` },
    { icon: FiDollarSign, label: 'Số dư ví', value: formatPrice(store.balance || 0), highlight: true },
    { icon: FiPercent, label: 'Phí hoa hồng', value: `${store.commission_rate || 10}%` }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FiHome className="text-emerald-500" size={16} />
        </div>
        Thông tin cửa hàng
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 ${item.highlight ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
          >
            <item.icon size={16} className={`${item.highlight ? 'text-emerald-500' : 'text-gray-400'} shrink-0`} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</p>
              <p className={`font-semibold ${item.highlight ? 'text-emerald-600 text-base' : 'text-gray-800'}`}>
                {item.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}