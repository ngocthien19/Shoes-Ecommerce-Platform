import { useState } from 'react'
import { FiShoppingCart, FiInfo, FiHeart } from 'react-icons/fi'
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
import { QuickVariantPicker } from './QuickVariantPicker'

export const ProductCard = ({ product, sortBy, onAddToCartSuccess }) => {
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

  const variants = product?.variants || []

  // Lọc danh sách thuộc tính gốc duy nhất
  const uniqueSizes = [...new Set(variants.map(v => v.size))]
  const uniqueColors = [...new Set(variants.map(v => v.color))]

  const isColorDisabled = (color) => {
    if (selectedSize) {
      // Nếu đã chọn Size, kiểm tra xem biến thể kết hợp [Size này + Màu kia] có hàng không
      const match = variants.find(v => v.size === selectedSize && v.color === color)
      return !match || match.stock <= 0
    }
    // Nếu chưa chọn Size, kiểm tra xem Màu này còn đôi nào trong kho không
    return !variants.some(v => v.color === color && v.stock > 0)
  }

  const isSizeDisabled = (size) => {
    if (selectedColor) {
      // Nếu đã chọn Màu, kiểm tra xem biến thể kết hợp [Màu này + Size kia] có hàng không
      const match = variants.find(v => v.color === selectedColor && v.size === size)
      return !match || match.stock <= 0
    }
    // Nếu chưa chọn Màu, kiểm tra xem Size này còn đôi nào trong kho không
    return !variants.some(v => v.size === size && v.stock > 0)
  }

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

  // XỬ LÝ KHI BẤM NÚT "THÊM VÀO GIỎ"
  const handleAddToCartSubmit = async (e) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thực hiện thêm sản phẩm vào giỏ hàng!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    if (!showVariantPicker) {
      setShowVariantPicker(true)

      // TỰ ĐỘNG LẤY SIZE VÀ COLOR ĐẦU TIÊN CÒN HÀNG TRONG KHO GÁN SẴN
      const firstAvailableVariant = variants.find(v => v.stock > 0)
      if (firstAvailableVariant) {
        setSelectedSize(firstAvailableVariant.size)
        setSelectedColor(firstAvailableVariant.color)
      }
      return
    }

    // Bắt đầu đối chiếu dữ liệu chọn khi bấm nút Xác Nhận lần 2
    const matchedVariant = variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    )

    if (!matchedVariant || matchedVariant.stock <= 0) {
      toast.error('Biến thể bạn chọn hiện đã hết hàng!')
      return
    }

    try {
      const response = await cartApiService.addToCart(matchedVariant.id, 1)
      if (response) {
        toast.success(response.message || 'Đã thêm vào giỏ hàng thành công!')
        dispatch(incrementCartCount(1))
        setShowVariantPicker(false)

        if (onAddToCartSuccess) {
          onAddToCartSuccess()
        }
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

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 z-10 p-1.5 backdrop-blur-sm rounded-full ring-1 transition-all duration-300 hover:scale-110 cursor-pointer
            ${isFavorite ? 'bg-red-500 text-white ring-red-500' : 'bg-white/80 text-brand-secondary ring-brand-secondary'}`}
              >
                <FiHeart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}</p></TooltipContent>
          </Tooltip>


          <Link to={`/product/${product.slug}`} className="w-full h-full">
            <img
              src={product?.images?.[0]?.secure_url}
              alt={product?.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* ── KHAY CHỌN BIẾN THỂ TRƯỢT LÊN TRÊN KHU VỰC ẢNH ── */}
          {showVariantPicker && (
            <QuickVariantPicker
              variants={variants}
              uniqueSizes={uniqueSizes}
              uniqueColors={uniqueColors}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              isSizeDisabled={isSizeDisabled}
              isColorDisabled={isColorDisabled}
              onClose={() => {
                setShowVariantPicker(false)
                setSelectedSize(null)
                setSelectedColor(null)
              }}
              onSubmit={handleAddToCartSubmit}
            />
          )}
        </div>

        {/* Khối thông tin văn bản */}
        <div className="space-y-1.5 text-left">
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
        <div className="flex items-center gap-2 pt-2 text-left">
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