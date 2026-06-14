import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiBell, FiClock, FiCheckCircle } from 'react-icons/fi'
import { formatRelativeTime, getImageUrl } from '~/utils/formatters'
import { getIconByType, parseContent, getLinkByType, getDetailItems } from '~/utils/notificationHelpers'

// Component render detail info
const RenderDetailInfo = ({ detailItems }) => {
  if (detailItems.length === 0) return null

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">Thông tin chi tiết:</h4>
      <div className="space-y-1.5">
        {detailItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <item.icon size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">{item.label}:</span> {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const NotificationDetail = ({ notification, userRole }) => {
  if (!notification) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-5"
      >
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
          <FiBell size={40} className="text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-gray-500 font-semibold text-lg">Chọn một thông báo</p>
          <p className="text-sm text-gray-400 mt-1">Để xem nội dung chi tiết</p>
        </div>
      </motion.div>
    )
  }

  const { icon: Icon, color, bg } = getIconByType(notification.type)
  const contentData = parseContent(notification.content)
  const imageUrl = getImageUrl(contentData.image, null)
  const link = getLinkByType(notification, userRole)
  const detailItems = getDetailItems(contentData)

  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-8"
    >
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-brand-primary/5 via-white to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shadow-md`}>
                  <Icon size={28} className={color} />
                </div>
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {notification.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <FiClock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </div>
                  {!notification.is_read && (
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                      CHƯA ĐỌC
                    </span>
                  )}
                </div>
              </div>
            </div>
            {link && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={link}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-rose-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-brand-primary/25 transition-all duration-300 flex items-center gap-2"
                >
                  Xem chi tiết
                  <FiCheckCircle size={14} />
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">
              {contentData.message}
            </p>
          </div>

          {imageUrl && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6"
            >
              <img
                src={imageUrl}
                alt="Thumbnail"
                className="w-40 h-40 rounded-xl object-cover border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
              />
            </motion.div>
          )}

          <RenderDetailInfo detailItems={detailItems} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center font-medium">
            Thông báo này được gửi tự động từ hệ thống
          </p>
        </div>
      </div>
    </motion.div>
  )
}