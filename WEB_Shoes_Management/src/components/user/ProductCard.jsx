// src/components/common/ProductCard.jsx
import { useState } from 'react'
import { FiShoppingCart, FiInfo, FiHeart, FiCheck } from 'react-icons/fi'
import { FaEye } from 'react-icons/fa'
import { formatPrice, formatSold } from '~/utils/formatters'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addToFavorites, removeFromFavorites } from '~/redux/user/userSlice'
import { incrementCartCount } from '~/redux/user/cartSlice'
import { productService } from '~/services/user/productService'
import { cartApiService } from '~/services/user/cartService'
import { toast } from 'react-toastify'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export const ProductCard = ({ product, sortBy }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const favoriteIds = useSelector((state) => state.user.favoriteIds)
  const isFavorite = favoriteIds.includes(product.id)
  const rating = Math.round(parseFloat(product?.rating_avg || 0))

  // ── STATE QUẢN LÝ KHAY CHỌN BIẾN THỂ ──
  const [showVariantPicker, setShowVariantPicker] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)

  // Giả sử mảng variants được lấy kèm trong API danh sách sản phẩm (LEFT JOIN product_variants)
  const variants = product?.variants || []

  // Lọc ra danh sách các Size và Màu duy nhất không trùng lặp từ mảng biến thể để hiển thị UI
  const uniqueSizes = [...new Set(variants.map(v => v.size))]
  const uniqueColors = [...new Set(variants.map(v => v.color))]

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng yêu thích sản phẩm!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    try {
      const response = await productService.toggleFavorite(product.id)
      if (response) {
        toast.success(response.message)
        if (response.isFavorite) {
          dispatch(addToFavorites(product.id))
        } else {
          dispatch(removeFromFavorites(product.id))
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  // XỬ LÝ KHI BẤM NÚT "THÊM VÀO GIỎ" CHÍNH THỨC
  const handleAddToCartSubmit = async (e) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thực hiện thêm sản phẩm vào giỏ hàng!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    // Nếu chưa mở khay chọn biến thể, hoặc chưa chọn đủ Size/Màu -> Bắt buộc mở khay ra bắt chọn
    if (!showVariantPicker || !selectedSize || !selectedColor) {
      setShowVariantPicker(true)
      // Nếu sản phẩm chỉ có duy nhất 1 size hoặc 1 màu, tự động chọn hộ user luôn
      if (uniqueSizes.length === 1) setSelectedSize(uniqueSizes[0])
      if (uniqueColors.length === 1) setSelectedColor(uniqueColors[0])
      return
    }

    // Tìm object biến thể khớp chính xác với Size và Màu mà người dùng vừa click chọn trên UI
    const matchedVariant = variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    )

    if (!matchedVariant) {
      toast.error('Biến thể Size và Màu này hiện đang tạm hết hàng!')
      return
    }

    if (matchedVariant.stock <= 0) {
      toast.error('Kích cỡ này của giày hiện đã hết hàng trong kho!')
      return
    }

    try {
      // Gửi variantId bóc tách lên API xử lý thêm vào giỏ
      const response = await cartApiService.addToCart(matchedVariant.id, 1)
      if (response) {
        toast.success(response.message || 'Đã thêm vào giỏ hàng thành công!')
        dispatch(incrementCartCount(1))
        setShowVariantPicker(false) // Đóng khay chọn lại cho đẹp
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng!')
    }
  }

  return (
    <div className="group bg-white shadow-bold rounded-2xl p-4 transition-all duration-300 hover:shadow-bold hover:-translate-y-1 flex flex-col justify-between min-h-[410px] relative overflow-hidden">

      <div>
        {/* Khối hình ảnh */}
        <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-50 h-56 w-full flex items-center justify-center">
          {product?.discount_percentage && parseFloat(product.discount_percentage) > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-brand-primary text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              -{Math.round(parseFloat(product.discount_percentage))}%
            </div>
          )}

          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 z-10 p-1.5 backdrop-blur-sm rounded-full ring-1 transition-all duration-300 hover:scale-110 cursor-pointer
            ${isFavorite ? 'bg-red-500 text-white ring-red-500' : 'bg-white/80 text-brand-secondary ring-brand-secondary'}`}
          >
            <FiHeart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <Link to={`/product/${product.slug}`} className="w-full h-full">
            <img
              src={product?.images?.[0]?.secure_url || 'https://via.placeholder.com/250'}
              alt={product?.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* ── 🟢 KHAY CHỌN BIẾN THỂ TRƯỢT LÊN TRÊN KHU VỰC ẢNH (QUICK SELECTOR) ── */}
          {showVariantPicker && (
            <div className="absolute inset-0 bg-white/95 z-20 p-4 flex flex-col justify-between animate-slideUp transition-all duration-300 rounded-xl border border-gray-100 shadow-inner">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Tùy chọn mua nhanh</span>
                  <button
                    onClick={() => setShowVariantPicker(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                {/* Khu vực chọn màu */}
                {uniqueColors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400">Màu sắc:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {uniqueColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                            selectedColor === color
                              ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Khu vực chọn Size */}
                {uniqueSizes.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400">Kích cỡ (Size):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {uniqueSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`w-8 h-8 text-xs font-bold rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            selectedSize === size
                              ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nút xác nhận khi đã mở khay */}
              <button
                onClick={handleAddToCartSubmit}
                disabled={!selectedSize || !selectedColor}
                className="w-full bg-brand-secondary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <FiCheck size={14} /> Xác nhận thêm
              </button>
            </div>
          )}
        </div>

        {/* Khối thông tin văn bản */}
        <div className="space-y-1.5">
          <Link to={`/product/${product.slug}`} className="font-semibold text-gray-800 line-clamp-1 transition-colors duration-300 hover:text-brand-primary block">
            {product?.name}
          </Link>
          <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">{product?.description}</p>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-yellow-400">
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
            <span>({product?.rating_count || 0})</span>
            <span>|</span>
            {sortBy === 'views_desc' ? (
              <span className="flex items-center gap-1 text-blue-500 font-medium">
                <FaEye /> {product?.view_count || 0} lượt xem
              </span>
            ) : (
              <span>Đã bán {formatSold(product?.sold || 0)}</span>
            )}
          </div>
        </div>
      </div>

      <div>
        {/* Khối hiển thị giá */}
        <div className="flex items-center gap-2 pt-2">
          <p className={`font-bold text-lg ${product?.sale_price ? 'text-brand-primary' : 'text-gray-800'}`}>
            {formatPrice(product?.sale_price || product?.price)}
          </p>
          {product?.sale_price && (
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
          )}
        </div>

        {/* Khối thanh công cụ Button */}
        <div className="flex gap-2 mt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={`/product/${product.slug}`} className="flex-1 bg-white ring ring-brand-secondary hover:bg-brand-secondary text-brand-secondary hover:text-white py-2.5 rounded-lg flex items-center justify-center transition-all duration-300">
                <FiInfo size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent><p>Chi tiết sản phẩm</p></TooltipContent>
          </Tooltip>

          <button
            onClick={handleAddToCartSubmit}
            className="flex-[2] bg-brand-primary hover:bg-[#c73652] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
          >
            <FiShoppingCart size={16} />
            {showVariantPicker && selectedSize && selectedColor ? 'Thêm ngay' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>

    </div>
  )
}