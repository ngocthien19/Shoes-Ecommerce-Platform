import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi'
import { getImageUrl } from '~/utils/formatters'

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này khỏi danh sách không?',
  productInfo = null
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Lớp nền mờ bên dưới (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Khung nội dung Modal chính */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10 p-5 relative"
          >
            {/* Nút đóng góc phải */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-50"
            >
              <FiX size={18} />
            </button>

            {/* Tiêu đề Modal kèm Icon cảnh báo */}
            <div className="flex items-center gap-2 text-amber-500 mb-3 text-left">
              <FiAlertTriangle size={20} className="shrink-0" />
              <h3 className="font-extrabold text-gray-900 text-base">{title}</h3>
            </div>

            {/* Đoạn text mô tả hành động */}
            <p className="text-xs text-gray-500 text-left leading-normal mb-4">
              {message}
            </p>

            {/* ── KHỐI HIỂN THỊ TRỰC QUAN SẢN PHẨM SẮP BỊ XÓA ── */}
            {productInfo && (
              <div className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 mb-5 text-left items-center animate-fadeIn">
                <div className="w-14 h-14 bg-white border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={getImageUrl(productInfo.images)}
                    alt={productInfo.product_name || productInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="font-bold text-gray-800 text-xs truncate">
                    {productInfo.product_name || productInfo.name}
                  </h4>
                  {(productInfo.size || productInfo.color) && (
                    <p className="text-[10px] text-gray-400 font-medium">
                      {productInfo.size && <span>Size: <strong className="text-gray-600 mr-2">{productInfo.size}</strong></span>}
                      {productInfo.color && <span>Màu: <strong className="text-gray-600">{productInfo.color}</strong></span>}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Thanh công cụ nút bấm hành động ở đáy */}
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <FiTrash2 size={13} />
                <span>Xác nhận xóa</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}