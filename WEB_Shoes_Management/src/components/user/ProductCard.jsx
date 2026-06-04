import { useState } from 'react'
import { FiShoppingCart, FiInfo, FiHeart } from 'react-icons/fi'
import { FaEye } from 'react-icons/fa'
import { formatPrice, formatSold } from '~/utils/formatters'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addToFavorites, removeFromFavorites } from '~/redux/user/userSlice'
import { productService } from '~/services/user/productService'
import { toast } from 'react-toastify'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

export const ProductCard = ({ product, sortBy }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Kiểm tra trạng thái đăng nhập của user từ Redux Store
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  // State quản lý trạng thái tim (Yêu thích) cục bộ của sản phẩm để UI thay đổi real-time
  const favoriteIds = useSelector((state) => state.user.favoriteIds)
  const isFavorite = favoriteIds.includes(product.id)

  const rating = Math.round(parseFloat(product?.rating_avg || 0))

  const handleToggleFavorite = async (e) => {
    e.preventDefault() // Chặn hành động chuyển trang của thẻ Link bọc ngoài

    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng yêu thích sản phẩm!')
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    try {
      // Gọi API và nhận về Object phản hồi { isFavorite, message }
      const response = await productService.toggleFavorite(product.id)

      if (response) {
        // 1. Tận dụng thông báo động bóc tách trực tiếp từ Backend trả về
        toast.success(response.message)

        // 2. Cập nhật ID vào Redux Store dựa theo trạng thái isFavorite mới từ Backend
        if (response.isFavorite) {
          dispatch(addToFavorites(product.id))
        } else {
          dispatch(removeFromFavorites(product.id))
        }
      }
    } catch (error) {
      console.error('Lỗi khi toggle favorite tại Card:', error)
    }
  }

  return (
    <div className="group bg-white shadow-bold rounded-2xl p-4 transition-all duration-300 hover:shadow-bold hover:-translate-y-1">
      {/* Hình ảnh & Icon Yêu thích */}
      <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-50">
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
          <TooltipContent>
            <p>Yêu thích</p>
          </TooltipContent>
        </Tooltip>

        {product?.images?.[0]?.secure_url ? (
          <Link to={`/product/${product.slug}`}>
            <img
              src={product.images[0].secure_url}
              alt={product?.name}
              className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
            />
          </Link>
        ) : (
          <Link to={`/product/${product.slug}`}>
            <div className="h-56 w-full flex items-center justify-center text-gray-400 text-sm italic cursor-pointer">
              Chưa có ảnh
            </div>
          </Link>
        )}
      </div>

      {/* Thông tin */}
      <div className="space-y-1.5">
        <Link to={`/product/${product.slug}`} className="font-semibold text-gray-800 line-clamp-1 transition-colors duration-300 hover:text-brand-primary cursor-pointer">
          {product?.name}
        </Link>
        <p className="text-xs text-gray-500 line-clamp-2 min-h-[30px]">{product?.description}</p>

        {/* Rating & Sold */}
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

        {/* Price Logic */}
        <div className="flex items-center gap-2 pt-1">
          <p className={`font-bold text-lg ${product?.sale_price ? 'text-brand-primary' : 'text-gray-800'}`}>
            {formatPrice(product?.sale_price || product?.price)}
          </p>
          {product?.sale_price && (
            <p className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={`/product/${product.slug}`} className="flex-1 bg-white ring ring-brand-secondary hover:bg-brand-secondary text-brand-secondary hover:text-white py-2.5 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer">
              <FiInfo size={18} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chi tiết sản phẩm</p>
          </TooltipContent>
        </Tooltip>

        <button className="flex-[2] bg-brand-primary hover:bg-[#c73652] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 cursor-pointer">
          <FiShoppingCart size={18} /> Thêm vào giỏ
        </button>
      </div>
    </div>
  )
}