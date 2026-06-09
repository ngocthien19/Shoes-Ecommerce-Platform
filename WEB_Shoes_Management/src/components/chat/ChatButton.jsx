import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX } from 'react-icons/fi'

export const ChatButton = forwardRef(({ isOpen, onClick, ...props }, ref) => {
  const bubbleVariants = {
    hover: { scale: 1.1, rotate: -10 },
    tap: { scale: 0.9 }
  }

  return (
    <motion.button
      ref={ref}
      variants={bubbleVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className="w-12 h-12 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/40 flex items-center justify-center cursor-pointer relative"
      {...props}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
            <FiX size={22} strokeWidth={2.5} />
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
            <FiMessageCircle size={22} strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
})
