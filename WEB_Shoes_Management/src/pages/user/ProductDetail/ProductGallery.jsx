import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const ProductGallery = ({ images, productName }) => {
  const safeImages = images?.length > 0 ? images : [
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+1' },
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+2' },
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+3' },
    { secure_url: 'https://placehold.co/600x600/f6f9fc/a0aabf?text=Chưa+có+ảnh+4' }
  ]

  const [activeImg, setActiveImg] = useState(safeImages[0].secure_url)
  const [activeIdx, setActiveIdx] = useState(0)

  const handleSelect = (img, idx) => {
    setActiveImg(img.secure_url)
    setActiveIdx(idx)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            src={activeImg}
            alt={productName}
            className="w-full h-full object-cover absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </div>

      <motion.div
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06 } }
        }}
      >
        {safeImages.map((img, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleSelect(img, idx)}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors duration-200 cursor-pointer
              ${activeIdx === idx ? 'border-brand-primary' : 'border-transparent hover:border-gray-200'}`}
          >
            <img src={img.secure_url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}