import { motion } from 'framer-motion'
import { FiDollarSign, FiShoppingBag, FiBox } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'
import { CountUp } from '~/components/common/CountUp'

export const DashboardWidgets = ({ widgets }) => {
  if (!widgets) return null

  const items = [
    {
      title: 'Tổng doanh thu',
      value: widgets.totalRevenue,
      formattedValue: formatPrice(widgets.totalRevenue),
      icon: FiDollarSign,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      borderColor: 'border-l-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      suffix: 'đ',
      bgTint: 'bg-gradient-to-br from-green-50/80 to-white',
      blobColor: 'bg-green-100/60'
    },
    {
      title: 'Đơn giao thành công',
      value: widgets.totalOrdersSuccess,
      formattedValue: widgets.totalOrdersSuccess,
      icon: FiShoppingBag,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      borderColor: 'border-l-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      suffix: 'đơn',
      bgTint: 'bg-gradient-to-br from-blue-50/80 to-white',
      blobColor: 'bg-blue-100/60'
    },
    {
      title: 'Sản phẩm đã bán',
      value: widgets.totalProductsSold,
      formattedValue: widgets.totalProductsSold,
      icon: FiBox,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      borderColor: 'border-l-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      suffix: 'sp',
      bgTint: 'bg-gradient-to-br from-purple-50/80 to-white',
      blobColor: 'bg-purple-100/60'
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          variants={itemVariant}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative ${item.bgTint} rounded-2xl border-l-4 ${item.borderColor} border-r border-t border-b border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group`}
        >
          {/* Decorative blob góc phải */}
          <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${item.blobColor} blur-2xl pointer-events-none`} />

          <div className="relative p-6 flex items-center gap-5">
            <div className={`relative ${item.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
              <item.icon size={24} />
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 mb-1">{item.title}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {typeof item.value === 'number' ? (
                  <CountUp value={item.value} suffix={item.suffix === 'đ' ? 'đ' : ''} />
                ) : (
                  <CountUp value={item.formattedValue} suffix="đ" />
                )}
              </h3>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full rounded-full ${item.textColor.replace('text', 'bg')}`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}