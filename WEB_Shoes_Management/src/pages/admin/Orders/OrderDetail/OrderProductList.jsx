import { motion } from 'framer-motion'
import { FiShoppingBag } from 'react-icons/fi'
import { formatPrice } from '~/utils/formatters'

export const OrderProductList = ({ order, delay = 0.35 }) => {
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

  const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
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
              transition={{ delay: idx * 0.05 + 0.4 }}
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
          <p className="text-sm text-gray-500">Tổng số lượng: <span className="font-bold text-gray-700">{totalQuantity}</span></p>
          <p className="text-sm text-gray-500">Tổng tiền: <span className="font-bold text-emerald-600">{formatPrice(order.total_amount)}</span></p>
        </div>
      </div>
    </motion.div>
  )
}