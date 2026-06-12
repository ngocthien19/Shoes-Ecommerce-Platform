import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertCircle, FiX, FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi'

export const CancelRequestModal = ({ isOpen, onClose, onConfirm, customerReason = '', isLoading = false }) => {
  const [decision, setDecision] = useState(null)
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (!decision) return
    onConfirm(decision, reason)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-orange-50/30">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiAlertCircle className="text-orange-600" size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Xử lý yêu cầu hủy đơn</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Khách hàng đã yêu cầu hủy đơn hàng này</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Lý do từ khách hàng */}
              {customerReason && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser size={14} className="text-blue-600" />
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Lý do từ khách hàng:</span>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">{customerReason}</p>
                </div>
              )}

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-2">
                <FiAlertCircle className="text-orange-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-orange-700 font-medium">
                  Vui lòng xem xét và đưa ra quyết định. Sau khi xử lý, khách hàng sẽ nhận được thông báo.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quyết định của bạn</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('accept')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      decision === 'accept'
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <FiCheckCircle size={18} />
                    <span className="font-bold text-sm">Chấp nhận hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('reject')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      decision === 'reject'
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                    }`}
                  >
                    <FiXCircle size={18} />
                    <span className="font-bold text-sm">Từ chối hủy</span>
                  </button>
                </div>
              </div>

              {decision === 'accept' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Lý do hủy (không bắt buộc)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do hủy đơn hàng..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300"
                    rows={3}
                  />
                  <p className="text-[10px] text-gray-400">* Lý do sẽ được ghi vào đơn hàng và hiển thị cho khách hàng</p>
                </div>
              )}

              {decision === 'reject' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Lý do từ chối (không bắt buộc)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do từ chối hủy đơn hàng..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300"
                    rows={3}
                  />
                  <p className="text-[10px] text-gray-400">* Lý do sẽ được ghi vào đơn hàng và hiển thị cho khách hàng</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 justify-end p-5 border-t border-gray-100 bg-gray-50/30">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirm}
                disabled={!decision || isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  decision === 'accept'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : decision === 'reject'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  decision === 'accept' ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />
                )}
                <span>Xác nhận</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}