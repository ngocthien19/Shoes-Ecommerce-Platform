import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiGrid, FiInfo, FiLayers, FiCalendar, FiAlertCircle } from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'

export const ProductMainInfo = ({ product }) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0)

  // Parse ảnh an toàn phòng trường hợp chuỗi JSON
  let imagesArray = []
  try {
    imagesArray = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
  } catch (e) {
    imagesArray = []
  }

  const mainImageUrl = imagesArray?.[activeImgIndex]?.secure_url || 'https://placehold.co/600x600?text=No+Image'

  // Kiểm tra có reject_reason không
  const hasRejectReason = product.reject_reason &&
    (product.status === 'rejected' || product.status === 'banned')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* THƯ VIỆN HÌNH ẢNH (Bên trái - 5 cột) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-3 shadow-sm overflow-hidden flex items-center justify-center aspect-square group">
          <motion.img
            key={activeImgIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Danh sách ảnh thumbnails phụ bên dưới */}
        {imagesArray?.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {imagesArray.map((img, idx) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 cursor-pointer transition-all duration-200 ${
                  activeImgIndex === idx ? 'border-brand-primary shadow-sm' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img src={img.secure_url} alt="thumbnail" className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* THÔNG TIN CHI TIẾT SẢN PHẨM (Bên phải - 7 cột) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Card thông tin hệ thống */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5 flex-1 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-lg font-black text-brand-secondary flex items-center gap-2 border-b border-gray-50 pb-3">
            <FiInfo className="text-brand-primary" /> Thông số thuộc tính
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiGrid className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Danh mục sản phẩm</p>
                <p className="font-extrabold text-gray-800 mt-0.5">{product.category_name || 'Mặc định / Đang cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiLayers className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Sàn hiển thị</p>
                <p className="font-extrabold text-gray-800 mt-0.5">
                  {product.is_active === 1 ? (
                    <span className="text-green-600">Đang hiển thị mở bán</span>
                  ) : (
                    <span className="text-gray-500">Đang ngừng bán / Ẩn</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiCalendar className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Ngày đăng bán</p>
                <p className="font-bold text-gray-700 mt-0.5">{new Date(product.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
              <FiCalendar className="text-gray-400 shrink-0" size={16} />
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Cập nhật cuối</p>
                <p className="font-bold text-gray-700 mt-0.5">{new Date(product.updated_at).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          {/* 👇 THÊM: Hiển thị lý do từ chối/khóa */}
          {hasRejectReason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <FiAlertCircle className="text-red-500" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                    Lý do từ chối/khóa sản phẩm
                  </p>
                  <p className="text-sm font-semibold text-red-700 mt-1 leading-relaxed">
                    {product.reject_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Khối mô tả sản phẩm */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả sản phẩm chi tiết</h4>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-semibold text-gray-600 leading-relaxed min-h-[120px] whitespace-pre-line">
              {product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}