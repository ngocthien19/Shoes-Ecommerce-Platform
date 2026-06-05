import { FiTrash2, FiMinus, FiPlus, FiHome, FiPackage } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatPrice, getImageUrl } from '~/utils/formatters'
import { CartVoucherPicker } from './CartVoucherPicker'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

export const CartItemList = ({
  cartItems,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
  onUpdateQuantity,
  onRemoveItem,
  itemVouchers = {},
  onItemVoucherSelect
}) => {

  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length

  return (
    <div className="space-y-4">
      {/* Thanh công cụ Chọn tất cả */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <label className="flex items-center gap-3 cursor-pointer select-none font-semibold text-gray-700 text-sm">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary"
          />
          Chọn tất cả ({cartItems.length} sản phẩm)
        </label>
      </div>

      {/* Danh sách các dòng giày */}
      {cartItems.map((item) => {
        const isSelected = selectedItems.includes(item.variant_id)

        // Đọc giá trị phần trăm voucher đang áp dụng cho hàng này (nếu có)
        const currentVoucher = itemVouchers[item.variant_id] || null

        const voucherDiscountPercent = currentVoucher ? currentVoucher.discountValue : 0

        // Logic tính toán tổng tiền gốc của dòng sản phẩm
        const totalBasePrice = Number(item.base_price) * item.cart_quantity

        // Giảm giá trực tiếp của riêng sản phẩm từ Backend gửi xuống (nếu có)
        const backendPromoPercent = Number(item.discount_percentage || 0)
        const backendDiscountAmount = totalBasePrice * (backendPromoPercent / 100)

        // Tính số tiền giảm của Voucher Shop dựa trên PHẦN TRĂM của tổng tiền mặt hàng
        const voucherDiscountValue = totalBasePrice * (voucherDiscountPercent / 100)

        // Tổng tiền cuối cùng của dòng Item sau khi trừ đi 2 lớp giảm giá
        const totalFinalPrice = Math.max(0, totalBasePrice - backendDiscountAmount - voucherDiscountValue)

        return (
          <div
            key={item.cart_id}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm relative group transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-200/60"
          >
            {/* Checkbox chọn */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item.variant_id)}
              className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary shrink-0"
            />

            <Link
              to={`/product/${item.product_slug}`}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out hover:border-brand-primary/40 shadow-sm"
            >
              <img
                src={getImageUrl(item.images)}
                alt={item.product_name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </Link>

            {/* Thông tin ở giữa */}
            <div className="flex-1 min-w-0 text-left space-y-1">
              <Link
                to={`/product/${item.product_slug}`}
                className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1 transition-colors duration-300 ease-in-out hover:text-brand-primary cursor-pointer block"
              >
                {item.product_name}
              </Link>

              <p className="text-xs text-gray-400 font-medium">
                Kích cỡ: <span className="text-gray-600 font-bold mr-3">{item.size}</span>
                Màu sắc: <span className="text-gray-600 font-bold">{item.color}</span>
              </p>

              {/* Shop info & Stock */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5 text-[11px] font-medium text-gray-400">
                <span className="flex items-center gap-1 text-brand-secondary"><FiHome size={12} /> {item.store_name}</span>
                <span className="flex items-center gap-1"><FiPackage size={12} /> Kho còn: <strong>{item.current_stock}</strong></span>
              </div>

              {/* Tăng giảm số lượng */}
              <div className="flex items-center border border-gray-200 rounded-lg w-fit bg-white mt-1.5 shadow-sm overflow-hidden">
                <button type="button" disabled={item.cart_quantity <= 1} onClick={() => onUpdateQuantity(item.variant_id, item.cart_quantity - 1)} className="px-2 py-1 text-gray-500 hover:text-brand-primary hover:bg-gray-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><FiMinus size={12} /></button>
                <span className="px-3 text-xs font-bold text-gray-700 min-w-[24px] text-center select-none">{item.cart_quantity}</span>
                <button type="button" disabled={item.cart_quantity >= item.current_stock} onClick={() => onUpdateQuantity(item.variant_id, item.cart_quantity + 1)} className="px-2 py-1 text-gray-500 hover:text-brand-primary hover:bg-gray-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><FiPlus size={12} /></button>
              </div>
            </div>

            {/* ── KHỐI GIÁ & CHỌN VOUCHER BÊN PHẢI ĐÚNG YÊU CẦU ── */}
            <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-w-[140px] space-y-2">
              <div className="flex items-center gap-2">
                {isSelected && (
                  <CartVoucherPicker
                    item={item}
                    onSelectVoucher={onItemVoucherSelect}
                    currentSelectedVoucher={currentVoucher?.code}
                  />
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveItem(item.variant_id)
                      }}
                      className="text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white p-1.5 rounded-xl transition-all duration-300 ease-in-out cursor-pointer shadow-sm active:scale-95"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xóa</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Khu vực hiển thị giá đa điều kiện (Giá gốc gạch ngang + Giá giảm thực tế) */}
              <div className="text-right space-y-0.5">
                {(backendDiscountAmount > 0 || voucherDiscountValue > 0) && (
                  <p className="text-xs text-gray-400 line-through font-medium transition-all duration-300">
                    {formatPrice(totalBasePrice)}
                  </p>
                )}
                <p className="font-extrabold text-base text-brand-secondary transition-all duration-300">
                  {formatPrice(totalFinalPrice)}
                </p>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}