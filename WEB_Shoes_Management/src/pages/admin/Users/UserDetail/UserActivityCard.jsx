import { motion } from 'framer-motion'
import { FiActivity, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { formatRelativeTime } from '~/utils/formatters'

export const UserActivityCard = ({ user }) => {
  // Dữ liệu mẫu - thực tế sẽ gọi API
  const activities = [
    { action: 'Đăng nhập', time: '2 giờ trước', status: 'success' },
    { action: 'Xem sản phẩm', time: '3 giờ trước', status: 'success' },
    { action: 'Thêm vào giỏ hàng', time: '5 giờ trước', status: 'success' },
    { action: 'Đặt hàng #123', time: '1 ngày trước', status: 'success' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <FiActivity className="text-amber-500" size={16} />
        </div>
        Hoạt động gần đây
      </h3>

      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100"
          >
            <div className="flex items-center gap-3">
              {activity.status === 'success' ? (
                <FiCheckCircle size={14} className="text-green-500" />
              ) : (
                <FiXCircle size={14} className="text-red-500" />
              )}
              <span className="font-semibold text-gray-700">{activity.action}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FiClock size={12} />
              <span>{activity.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}