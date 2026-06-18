import { motion } from 'framer-motion'
import { FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi'
import { CountUp } from '~/components/common/CountUp'

export const PayoutOverviewWidgets = ({ payouts }) => {
  if (!payouts) return null

  const totalPending = payouts.filter(p => p.status === 'pending').length
  const totalApproved = payouts.filter(p => p.status === 'approved').length
  const totalRejected = payouts.filter(p => p.status === 'rejected').length
  const totalAmount = payouts.reduce((sum, p) => sum + Number(p.amount), 0)

  const items = [
    {
      title: 'Tổng yêu cầu',
      value: payouts.length,
      icon: FiDollarSign,
      color: 'border-l-blue-500 text-blue-600',
      bg: 'from-blue-50/60 to-white',
      blob: 'bg-blue-100/50',
      delay: 0.05
    },
    {
      title: 'Đang chờ duyệt',
      value: totalPending,
      icon: FiClock,
      color: 'border-l-amber-500 text-amber-600',
      bg: 'from-amber-50/60 to-white',
      blob: 'bg-amber-100/50',
      delay: 0.1
    },
    {
      title: 'Đã duyệt',
      value: totalApproved,
      icon: FiCheckCircle,
      color: 'border-l-green-500 text-green-600',
      bg: 'from-green-50/60 to-white',
      blob: 'bg-green-100/50',
      delay: 0.15
    },
    {
      title: 'Đã từ chối',
      value: totalRejected,
      icon: FiXCircle,
      color: 'border-l-red-500 text-red-600',
      bg: 'from-red-50/60 to-white',
      blob: 'bg-red-100/50',
      delay: 0.2
    },
    {
      title: 'Tổng tiền yêu cầu',
      value: totalAmount,
      icon: FiDollarSign,
      color: 'border-l-purple-500 text-purple-600',
      bg: 'from-purple-50/60 to-white',
      blob: 'bg-purple-100/50',
      delay: 0.25,
      isPrice: true
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-2 md:grid-cols-5 gap-4"
    >
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: item.delay,
            duration: 0.4,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          whileHover={{
            y: -4,
            scale: 1.02,
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            transition: { duration: 0.2 }
          }}
          className={`relative ${item.bg} rounded-2xl border-l-4 ${item.color.split(' ')[0]} border-t border-b border-r border-gray-100 shadow-sm p-4 overflow-hidden group transition-all duration-300`}
        >
          <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.blob} blur-xl pointer-events-none`} />
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <item.icon size={14} className={item.color.split(' ')[1]} />
            </motion.div>
          </div>
          <h3 className={`text-xl font-black text-gray-800 mt-1.5 ${item.isPrice ? 'text-purple-600' : ''}`}>
            {item.isPrice ? (
              <CountUp value={item.value} prefix="₫" />
            ) : (
              <CountUp value={item.value} />
            )}
          </h3>
        </motion.div>
      ))}
    </motion.div>
  )
}