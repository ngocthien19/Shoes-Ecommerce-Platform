import { FiCheck } from 'react-icons/fi'

export const QuickVariantPicker = ({
  variants = [],
  uniqueSizes = [],
  uniqueColors = [],
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  onClose,
  onSubmit,
  isSizeDisabled,
  isColorDisabled
}) => {
  return (
    <div className="absolute inset-0 bg-white/95 z-20 p-4 flex flex-col justify-between animate-slideUp transition-all duration-300 rounded-xl border border-gray-100 shadow-inner">
      <div className="space-y-3.5 w-full text-left">
        {/* Thanh tiêu đề Modal */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Tùy chọn mua nhanh</span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* TRƯỜNG HỢP 1: SẢN PHẨM KHÔNG CÓ BIẾN THỂ NÀO */}
        {variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-gray-400 italic">Sản phẩm hiện chưa có thông tin về kích cỡ và màu sắc.</p>
          </div>
        ) : (
          // TRƯỜNG HỢP 2: CÓ BIẾN THỂ -> HIỂN THỊ DANH SÁCH CHỌN
          <>
            {/* Khu vực chọn màu */}
            {uniqueColors.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400">Màu sắc:</p>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueColors.map((color) => {
                    const disabled = isColorDisabled(color)
                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedColor(color)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all 
                          ${disabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400/80 line-through opacity-60 cursor-not-allowed select-none'
                        : selectedColor === color
                          ? 'border-brand-primary bg-brand-primary text-white shadow-sm cursor-pointer'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white cursor-pointer'
                      }`}
                      >
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Khu vực chọn Size */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400">Kích cỡ (Size):</p>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueSizes.map((size) => {
                    const disabled = isSizeDisabled(size)
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSize(size)}
                        className={`w-8 h-8 text-xs font-bold rounded-md border flex items-center justify-center transition-all
                          ${disabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400/80 line-through opacity-60 cursor-not-allowed select-none'
                        : selectedSize === size
                          ? 'border-brand-primary bg-brand-primary text-white shadow-sm cursor-pointer'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white cursor-pointer'
                      }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Nút xác nhận mua hàng dưới đáy Modal */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={variants.length === 0 || !selectedSize || !selectedColor}
        className="w-full bg-brand-secondary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
      >
        <FiCheck size={14} /> Xác nhận thêm
      </button>
    </div>
  )
}