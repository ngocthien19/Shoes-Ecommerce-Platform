import { FiCheck, FiX } from 'react-icons/fi'

export const QuickFavoritePicker = ({
  product,
  variants = [],
  uniqueSizes = [],
  uniqueColors = [],
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  isSizeDisabled,
  isColorDisabled,
  onClose,
  onSubmit
}) => {
  return (
    <div className="absolute inset-y-0 right-0 left-24 sm:left-28 bg-white/95 z-10 px-4 py-2 flex items-center justify-between animate-slideLeft border-l border-gray-100 shadow-xl">

      {/* Khu vực danh sách lựa chọn biến thể */}
      <div className="flex-1 space-y-2 text-left pr-4">
        {variants.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Sản phẩm chưa có thông tin Size/Màu.</p>
        ) : (
          <>
            {/* Lựa chọn Màu sắc */}
            {uniqueColors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 min-w-[50px]">Màu sắc:</span>
                <div className="flex flex-wrap gap-1">
                  {uniqueColors.map(color => {
                    const disabled = isColorDisabled(color)
                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedColor(color)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-all ${
                          disabled
                            ? 'bg-gray-100 border-gray-200 text-gray-400/80 line-through opacity-60 cursor-not-allowed select-none'
                            : selectedColor === color
                              ? 'border-brand-primary bg-brand-primary text-white shadow-sm cursor-pointer'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-brand-bg cursor-pointer'
                        }`}
                      >
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Lựa chọn Kích cỡ (Size) */}
            {uniqueSizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 min-w-[50px]">Kích cỡ:</span>
                <div className="flex flex-wrap gap-1">
                  {uniqueSizes.map(size => {
                    const disabled = isSizeDisabled(size)
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSize(size)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-all ${
                          disabled
                            ? 'bg-gray-100 border-gray-200 text-gray-400/80 line-through opacity-60 cursor-not-allowed select-none'
                            : selectedSize === size
                              ? 'border-brand-primary bg-brand-primary text-white shadow-sm cursor-pointer'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-brand-bg cursor-pointer'
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

      {/* Nhóm nút bấm xác nhận/hủy bên phải khay */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onSubmit(product)}
          disabled={variants.length === 0 || !selectedSize || !selectedColor}
          className="bg-brand-primary hover:bg-[#c73652] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          <FiCheck size={12} /> Thêm
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
        >
          <FiX size={12} /> Hủy
        </button>
      </div>

    </div>
  )
}