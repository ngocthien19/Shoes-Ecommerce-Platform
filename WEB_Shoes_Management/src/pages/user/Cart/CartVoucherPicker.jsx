import { useState, useEffect } from 'react'
import { FiTag, FiChevronDown, FiCheck, FiLoader } from 'react-icons/fi'
import { promotionApiService } from '~/services/user/promotionService'
import { formatPrice } from '~/utils/formatters'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '~/components/ui/combobox'

export const CartVoucherPicker = ({ item, onSelectVoucher, currentSelectedVoucher }) => {
  const [open, setOpen] = useState(false)
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open || !item.store_id) return

    const loadStoreVouchers = async () => {
      setLoading(true)
      try {
        const data = await promotionApiService.getPromotionsByStore(item.store_id)
        if (Array.isArray(data)) {
          setVouchers(data)
        }
      } catch (error) {
        console.error('Lỗi nạp khuyến mãi của cửa hàng:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStoreVouchers()
  }, [open, item.store_id])

  // Lọc danh sách hỗ trợ tìm kiếm gõ phím trực tiếp trên Ô Input Combobox
  const filteredVouchers = vouchers.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer uppercase shadow-sm
          ${currentSelectedVoucher
      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
      : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:bg-white'}`}
      >
        <FiTag size={12} />
        <span>{currentSelectedVoucher || 'Chọn mã giảm giá'}</span>
        <FiChevronDown size={10} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-60 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          <Combobox>
            <ComboboxInput
              placeholder="Tìm mã shop..."
              className="w-full border-b border-gray-100 px-3 py-1.5 text-[11px] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ComboboxList className="max-h-44 overflow-y-auto p-1 space-y-0.5">
              {loading ? (
                <div className="flex items-center justify-center py-4 text-gray-400 gap-1.5 text-[11px]">
                  <FiLoader size={12} className="animate-spin text-brand-primary" />
                  <span>Đang quét voucher...</span>
                </div>
              ) : filteredVouchers.length === 0 ? (
                <ComboboxEmpty className="text-[10px] text-gray-400 p-3 italic text-center">
                  Cửa hàng hiện chưa phát hành mã giảm giá nào.
                </ComboboxEmpty>
              ) : (
                filteredVouchers.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      // Gửi trọn vẹn ID mã, Tên mã (v.name) và Số tiền giảm (v.discount_value) lên hàm tổng
                      onSelectVoucher(item.variant_id, v.name, Number(v.discount_value))
                      setOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg transition-colors cursor-pointer flex flex-col gap-0.5
                      ${currentSelectedVoucher === v.name ? 'bg-brand-primary/5 text-brand-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span className="font-bold tracking-wide flex items-center justify-between">
                      <span className="text-gray-800">{v.name}</span>
                      {currentSelectedVoucher === v.name && <FiCheck size={11} className="text-brand-primary" />}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal line-clamp-1">
                      {v.description || `Giảm ngay ${formatPrice(v.discount_value)} cho đơn từ ${formatPrice(v.min_order_value)}`}
                    </span>
                  </button>
                ))
              )}
            </ComboboxList>
          </Combobox>
        </div>
      )}
    </div>
  )
}