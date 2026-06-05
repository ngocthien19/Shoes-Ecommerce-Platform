import { FiHeart, FiHome, FiPlus, FiShoppingCart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { formatPrice, formatSold } from '~/utils/formatters'
import { toast } from 'react-toastify'

export const TabFavorites = ({ loading, favoriteProducts, onRemoveFavoriteItem }) => {

  // Hàm xử lý parse hình ảnh an toàn từ chuỗi DB Cloudinary
  const getProductImgUrl = (imagesField) => {
    if (!imagesField) return 'https://via.placeholder.com/120'
    try {
      const parsed = typeof imagesField === 'string' ? JSON.parse(imagesField) : imagesField
      const imgArray = Array.isArray(parsed) ? parsed : [parsed]
      return imgArray[0]?.secure_url || 'https://via.placeholder.com/120'
    } catch {
      return imagesField[0]?.secure_url || 'https://via.placeholder.com/120'
    }
  }

  // Hàm xử lý khi bấm nút Thêm vào giỏ hàng nhanh
  const handleAddToCart = (product) => {
    // 💡 Chỗ này sau này bạn tích hợp hàm dispatch(addToCart(...)) của CartSlice vào nhé
    console.log('Thêm vào giỏ sản phẩm:', product.product_id)
    toast.success(`Đã thêm ${product.name} vào giỏ hàng thành công!`)
  }

  if (loading && favoriteProducts.length === 0) {
    return <div className="text-center py-10 text-gray-400 italic animate-fadeIn">Đang tải danh sách giày yêu thích...</div>
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="pt-8 w-full animate-fadeIn">
        <h3 className="text-base font-extrabold text-brand-secondary border-l-4 border-brand-secondary pl-3 mb-6">Sản phẩm yêu thích của tôi</h3>
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FiHeart size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
          <Link to="/products" className="text-sm text-brand-primary font-bold hover:underline mt-2 inline-block">Khám phá cửa hàng ngay</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 space-y-6 w-full animate-fadeIn">
      <h3 className="text-base font-extrabold text-brand-secondary border-l-4 border-brand-secondary pl-3 flex items-center gap-2">
        <FiHeart className="shrink-0 text-brand-secondary" size={18}/>
        <span>Sản phẩm yêu thích của tôi</span>
      </h3>

      <div className="flex flex-col gap-4">
        {favoriteProducts.map((product) => {
          const rating = Math.round(parseFloat(product.rating_avg || 0))

          return (
            <div
              key={product.product_id}
              className="group bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center transition-all duration-300 hover:shadow-bold hover:-translate-y-0.5 relative"
            >
              {/* Hình ảnh sản phẩm */}
              <Link to={`/product/${product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 shrink-0 cursor-pointer">
                <img
                  src={getProductImgUrl(product.images)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>

              {/* Thông tin chi tiết ở giữa */}
              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  to={`/product/${product.slug}`}
                  className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1 hover:text-brand-primary transition-colors cursor-pointer block"
                >
                  {product.name}
                </Link>

                {/* Tên cửa hàng */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <FiHome size={13} className="text-brand-secondary" />
                  <span className="truncate">{product.store_name}</span>
                </div>

                {/* Đánh giá & Đã bán */}
                <div className="flex items-center gap-3 text-xs text-gray-400 pt-0.5">
                  <div className="flex items-center text-amber-400 gap-0.5">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                    <span className="text-gray-600 font-semibold ml-1">{parseFloat(product.rating_avg).toFixed(1)}</span>
                  </div>
                  <span>|</span>
                  <span>Đã bán {formatSold(product.sold)}</span>
                </div>
              </div>

              {/* ── KHỐI GIÁ & HÀNH ĐỘNG BÊN PHẢI ── */}
              <div className="flex flex-col items-end justify-between self-stretch shrink-0 pt-0.5 min-w-[100px]">

                {/* Khu vực chứa nhóm các nút chức năng */}
                <div className="flex items-center gap-1">
                  {/* 🟢 NÚT THÊM VÀO GIỎ HÀNG NHANH (+ TOOLTIP) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="text-brand-primary hover:bg-[#e94560]/10 p-1.5 rounded-full transition-all cursor-pointer group/cart flex items-center justify-center gap-0.5"
                      >
                        <FiPlus size={14} className="font-bold" />
                        <FiShoppingCart size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Thêm vào giỏ hàng</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Nút bỏ yêu thích */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onRemoveFavoriteItem(product.product_id)}
                        className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-all cursor-pointer group/btn"
                      >
                        <FiHeart size={18} fill="currentColor" className="transition-transform duration-200 group-hover/btn:scale-110" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bỏ thích</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Giá tiền */}
                <p className="font-extrabold text-base sm:text-lg text-brand-secondary tracking-tight">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}