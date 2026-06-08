import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiRotateCcw, FiBox } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'

export const WithdrawCancelModal = ({ isOpen, onClose, onConfirm, order }) => {
  if (!order) return null

  const handleConfirm = () => {
    onConfirm(order.order_id)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop nền mờ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Nội dung Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 relative flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <FiRotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-brand-secondary text-base">Rút yêu cầu hủy đơn</h3>
                  <p className="text-xs text-gray-500">Mã đơn: #{order.order_id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Bạn có chắc chắn muốn rút lại yêu cầu hủy? Đơn hàng này sẽ được đưa quay trở lại danh sách chờ chuẩn bị hàng của shop.
              </p>

              {/* Hiển thị tóm tắt sản phẩm để khách hàng đối soát */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 max-h-36 overflow-y-auto space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-white">
                      <img src={getImageUrl(item.images)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-xs truncate">{item.product_name}</h4>
                      <p className="text-[10px] text-gray-400">Size: {item.size} | Màu: {item.color}</p>
                    </div>
                    <div className="text-xs font-bold text-gray-500">
                      x{item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer chứa các nút hành động */}
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/30">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95"
              >
                Xác nhận rút
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}