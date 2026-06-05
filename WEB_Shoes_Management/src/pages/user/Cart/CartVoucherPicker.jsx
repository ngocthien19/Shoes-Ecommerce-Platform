import { useState } from 'react'
import { FiTag, FiChevronDown, FiCheck } from 'react-icons/fi'
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

  const sampleStoreVouchers = [
    { value: 'SNEAKER20', label: `Mã shop ${item.store_name} - Giảm 20k`, discount: 20000 },
    { value: 'JORDANVIP', label: 'Mã tri ân fan Jordan - Giảm 50k', discount: 50000 },
    { value: 'PROMO30', label: 'Mã giảm giá hè - Giảm 30k', discount: 30000 }
  ]

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

      {/* Dropdown Combobox mở ra */}
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          <Combobox>
            <ComboboxInput
              placeholder="Tìm mã shop..."
              className="w-full border-b border-gray-100 px-3 py-1.5 text-[11px] outline-none"
              onChange={(e) => {
                // Hỗ trợ tìm kiếm gõ phím
              }}
            />
            <ComboboxList className="max-h-36 overflow-y-auto p-1 space-y-0.5">
              <ComboboxEmpty className="text-[10px] text-gray-400 p-2 italic text-center">Không thấy mã</ComboboxEmpty>
              {sampleStoreVouchers.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => {
                    onSelectVoucher(item.variant_id, v.value, v.discount)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg transition-colors cursor-pointer flex flex-col gap-0.5
                    ${currentSelectedVoucher === v.value ? 'bg-brand-primary/5 text-brand-primary font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <span className="font-bold tracking-wide flex items-center justify-between">
                    <span>{v.value}</span>
                    {currentSelectedVoucher === v.value && <FiCheck size={10} />}
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">{v.label}</span>
                </button>
              ))}
            </ComboboxList>
          </Combobox>
        </div>
      )}
    </div>
  )
}