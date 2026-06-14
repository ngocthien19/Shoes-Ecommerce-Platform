import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiAlertTriangle, FiSend } from 'react-icons/fi'

export const ConfirmReasonModal = ({ isOpen, onClose, onConfirm, title, message, placeholder, isLoading }) => {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (!reason.trim()) {
      return
    }
    onConfirm(reason)
    setReason('')
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
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-500">
                  <FiAlertTriangle size={20} />
                  <h3 className="font-extrabold text-gray-900 text-base">{title}</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <FiX size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{message}</p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 resize-none"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !reason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend size={14} />
                  )}
                  Xác nhận
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}