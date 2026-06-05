import { useState, useEffect } from 'react'
import { FiHeart, FiMinus, FiPlus, FiShoppingCart, FiTruck, FiRefreshCcw, FiZap } from 'react-icons/fi'
import { formatPrice, formatSold, calculateFinalPrice } from '~/utils/formatters'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addToFavorites, removeFromFavorites } from '~/redux/user/userSlice'
import { cartApiService } from '~/services/user/cartService'
import { setCartCount } from '~/redux/user/cartSlice'
import { productService } from '~/services/user/productService'
import { toast } from 'react-toastify'

export const ProductInfo = ({ product }) => {

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Kiểm tra trạng thái đăng nhập của user từ Redux Store
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  // State quản lý trạng thái tim (Yêu thích) cục bộ của sản phẩm để UI thay đổi real-time
  const favoriteIds = useSelector((state) => state.user.favoriteIds)
  const isFavorite = favoriteIds.includes(product.id)
  const [loading, setLoading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleToggleFavorite = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng yêu thích sản phẩm!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    if (loading) return
    setLoading(true)

    try {
      // Gọi API và nhận về Object phản hồi { isFavorite, message }
      const response = await productService.toggleFavorite(product.id)

      if (response) {
        // 1. Bắn thông báo chuẩn chữ từ Backend đưa xuống
        toast.success(response.message)

        // 2. Đồng bộ trạng thái lưu trữ ID vào hệ thống Redux toàn cục
        if (response.isFavorite) {
          dispatch(addToFavorites(product.id))
        } else {
          dispatch(removeFromFavorites(product.id))
        }
      }
    } catch (error) {
      console.error('Lỗi khi toggle favorite tại Info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    if (!currentVariant) {
      toast.error('Vui lòng chọn màu sắc và kích cỡ!')
      return
    }
    if (quantity > currentVariant.stock) {
      toast.error(`Số lượng vượt quá số hàng có sẵn (${currentVariant.stock})!`)
      return
    }

    setIsAddingToCart(true)
    try {
      // 1. Gọi API thêm vào giỏ bằng variant.id
      const res = await cartApiService.addToCart(currentVariant.id, quantity)

      if (res) {
        toast.success(res.message || 'Đã thêm sản phẩm vào giỏ hàng!')

        // 2. Fetch lại giỏ hàng và đồng bộ số đếm lên Header qua Redux
        const cartData = await cartApiService.getCart()
        const totalItems = cartData.reduce((sum, item) => sum + item.cart_quantity, 0)
        dispatch(setCartCount(totalItems))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng!')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const { variants = [] } = product

  // Trích xuất danh sách màu duy nhất
  const uniqueColors = [...new Set(variants.map(v => v.color))]

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || '')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  const finalPrice = calculateFinalPrice(product.price, product.discount_percentage)

  // Lọc ra các size thuộc màu đang được chọn
  const availableSizes = variants.filter(v => v.color === selectedColor)

  // Tìm variant cụ thể dựa trên màu và size đang chọn
  const currentVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize)

  // Khi đổi màu, tự động chọn size đầu tiên của màu đó để tránh lỗi
  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].size)
      setQuantity(1)
    }
  }, [selectedColor, variants])

  // Xử lý tăng giảm số lượng
  const handleQuantityChange = (type) => {
    const stock = currentVariant?.stock || 0
    if (type === 'minus' && quantity > 1) setQuantity(prev => prev - 1)
    if (type === 'plus' && quantity < stock) setQuantity(prev => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="space-y-3">
        <span className="inline-block bg-[#e94560]/10 text-brand-primary text-xs font-bold px-3 py-1 rounded-full">
          Sản phẩm nổi bật
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 divide-x divide-gray-200">
          <div className="flex items-center gap-1 text-yellow-400 pr-4">
            {'★'.repeat(Math.round(product.rating_avg || 0))}{'☆'.repeat(5 - Math.round(product.rating_avg || 0))}
            <span className="text-gray-900 font-semibold ml-1">{product.rating_avg}</span>
          </div>
          <div className="px-4">{product.view_count || 0} Lượt xem</div>
          <div className="px-4">{formatSold(product.sold)} Đã bán</div>

          {/* Nút Yêu thích */}
          <button
            className={`flex items-center gap-2 pl-4 transition-colors duration-300 cursor-pointer group select-none
      ${isFavorite ? 'text-brand-primary font-semibold' : 'hover:text-brand-primary'}`}
            onClick={handleToggleFavorite}
          >
            <FiHeart
              size={16}
              className={`transition-all duration-300 group-hover:fill-brand-primary 
        ${isFavorite ? 'text-brand-primary fill-brand-primary scale-110' : ''}`}
              fill={isFavorite ? 'currentColor' : 'none'}
            />
            <span>{isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
          </button>
        </div>
      </div>

      {/* Giá */}
      <div className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold text-brand-primary">{formatPrice(finalPrice)}</span>

          {/* Nhãn % giảm giá */}
          {product?.discount_percentage && (
            <div className="flex items-center gap-3">
              <span className="text-lg text-gray-400 line-through font-medium">
                {formatPrice(product.price)}
              </span>
              <span className="bg-brand-primary text-white text-sm font-bold px-3 py-1 rounded-lg shadow-sm">
                -{product.discount_percentage}%
              </span>
            </div>
          )}
        </div>

        {/* Tên chương trình khuyến mãi */}
        {product?.promotion_name && (
          <div className="text-sm font-semibold text-brand-secondary bg-[#0f3460]/10 px-3 py-1.5 rounded-lg w-fit flex items-center gap-1.5">
            <FiZap className="text-brand-secondary" size={24} /> {product.promotion_name}
          </div>
        )}
      </div>

      {/* Mô tả ngắn */}
      <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

      {/* Biến thể: Màu sắc */}
      {uniqueColors.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-800 uppercase">Màu sắc: <span className="font-normal text-gray-600 capitalize">{selectedColor}</span></h3>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer
                  ${selectedColor === color ? 'border-brand-primary text-brand-primary bg-[#e94560]/5' : 'border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Biến thể: Kích cỡ */}
      {availableSizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-800 uppercase">Kích cỡ</h3>
            <span className="text-sm font-semibold text-brand-primary hover:text-[#c73652] hover:underline transition-colors duration-300 cursor-pointer">Bảng quy đổi kích cỡ</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map(v => {
              const isOutOfStock = v.stock === 0
              return (
                <button
                  key={v.size}
                  disabled={isOutOfStock}
                  onClick={() => setSelectedSize(v.size)}
                  className={`w-14 h-12 flex items-center justify-center border-2 rounded-lg font-semibold transition-all duration-300
                    ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400'
                  : selectedSize === v.size ? 'border-brand-primary text-brand-primary bg-[#e94560]/5 cursor-pointer'
                    : 'border-gray-200 text-gray-700 hover:border-brand-primary hover:text-brand-primary cursor-pointer'}`}
                >
                  {v.size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Danh mục */}
      {product?.category_name && (
        <div className="flex items-center gap-6 mt-2">
          <h3 className="font-bold text-sm text-gray-800 uppercase">Danh mục</h3>
          <Link to={`/products/${product.category_slug}`} className="px-4 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all duration-300 cursor-pointer">
            {product.category_name}
          </Link>
        </div>
      )}

      {/* Số lượng */}
      <div className="flex items-center gap-6 mt-2">
        <h3 className="font-bold text-sm text-gray-800 uppercase">Số lượng</h3>
        <div className="flex items-center border border-gray-200 rounded-lg h-11 w-32">
          <button onClick={() => handleQuantityChange('minus')} className="flex-1 flex justify-center text-gray-500 hover:text-brand-primary transition-colors duration-300 cursor-pointer"><FiMinus /></button>
          <span className="flex-1 text-center font-semibold text-gray-800 border-x border-gray-200 h-full flex items-center justify-center">{quantity}</span>
          <button onClick={() => handleQuantityChange('plus')} className="flex-1 flex justify-center text-gray-500 hover:text-brand-primary transition-colors duration-300 cursor-pointer"><FiPlus /></button>
        </div>
        <span className="text-sm text-gray-500">{currentVariant?.stock || 0} sản phẩm có sẵn</span>
      </div>

      {/* Nút Hành Động */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || !currentVariant || currentVariant.stock === 0}
          className="flex-1 bg-white border-2 border-brand-primary text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e94560]/5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiShoppingCart size={20} />
          {isAddingToCart ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
        </button>

        <button className="flex-1 bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-[#c73652] hover:shadow-lg hover:shadow-[#e94560]/30 transition-all duration-300 cursor-pointer">
          Mua ngay
        </button>
      </div>

      {/* Info Phụ */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <FiTruck size={20} className="text-green-500" /> Miễn phí vận chuyển toàn quốc
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <FiRefreshCcw size={20} className="text-blue-500" /> Đổi trả trong 30 ngày
        </div>
      </div>
    </div>
  )
}