import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiFilter, FiRefreshCw, FiX, FiCalendar, FiCreditCard } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ORDER_STATUS, PAYMENT_METHODS } from '~/utils/constant'

export const OrderFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchId, setSearchId] = useState(filters.searchOrderId || '')
  const [startDate, setStartDate] = useState(filters.startDate || '')
  const [endDate, setEndDate] = useState(filters.endDate || '')

  useEffect(() => {
    if (!filters.searchOrderId) setSearchId('')
  }, [filters.searchOrderId])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('searchOrderId', searchId.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchId])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('startDate', startDate || null)
    }, 300)
    return () => clearTimeout(timer)
  }, [startDate])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('endDate', endDate || null)
    }, 300)
    return () => clearTimeout(timer)
  }, [endDate])

  const statusOptions = [
    { value: null, label: 'Tất cả trạng thái' },
    { value: ORDER_STATUS.PENDING, label: 'Chờ xử lý', color: 'text-amber-600' },
    { value: ORDER_STATUS.PROCESSING, label: 'Đang xử lý', color: 'text-blue-600' },
    { value: ORDER_STATUS.SHIPPED, label: 'Đang giao hàng', color: 'text-purple-600' },
    { value: ORDER_STATUS.DELIVERED, label: 'Hoàn thành', color: 'text-green-600' },
    { value: ORDER_STATUS.CANCEL_REQUESTED, label: 'Yêu cầu hủy', color: 'text-orange-600' },
    { value: ORDER_STATUS.CANCELLED, label: 'Đã hủy', color: 'text-red-600' }
  ]

  const paymentOptions = [
    { value: null, label: 'Tất cả phương thức' },
    { value: PAYMENT_METHODS.COD, label: 'COD (Thanh toán khi nhận hàng)' },
    { value: PAYMENT_METHODS.VNPAY, label: 'VNPAY' },
    { value: PAYMENT_METHODS.MOMO, label: 'MoMo' }
  ]

  const currentStatusLabel = statusOptions.find(s => s.value === filters.status)?.label || 'Tất cả trạng thái'
  const currentPaymentLabel = paymentOptions.find(s => s.value === filters.paymentMethod)?.label || 'Tất cả phương thức'

  const activeBadges = []
  if (filters.searchOrderId) activeBadges.push({ key: 'searchOrderId', label: `Mã đơn: #${filters.searchOrderId}` })
  if (filters.status) {
    const status = statusOptions.find(s => s.value === filters.status)
    if (status) activeBadges.push({ key: 'status', label: `Trạng thái: ${status.label}` })
  }
  if (filters.paymentMethod) {
    const method = paymentOptions.find(s => s.value === filters.paymentMethod)
    if (method) activeBadges.push({ key: 'paymentMethod', label: `PTTT: ${method.label}` })
  }
  if (filters.startDate) activeBadges.push({ key: 'startDate', label: `Từ ngày: ${filters.startDate}` })
  if (filters.endDate) activeBadges.push({ key: 'endDate', label: `Đến ngày: ${filters.endDate}` })

  const handleRemoveFilter = (key) => {
    if (key === 'startDate') {
      setStartDate('')
      onFilterChange('startDate', null)
    } else if (key === 'endDate') {
      setEndDate('')
      onFilterChange('endDate', null)
    } else {
      onFilterChange(key, null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Khung tìm kiếm theo mã đơn */}
        <div className="relative w-full lg:max-w-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Tìm theo mã đơn hàng..."
            className="pl-10 rounded-xl border-gray-200 py-2.5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        {/* Cụm Dropdown Lọc */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc ngày */}
          <div className="relative w-[155px]">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold w-full focus-visible:ring-brand-primary/20"
              placeholder="Từ ngày"
            />
          </div>
          <div className="relative w-[155px]">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold w-full focus-visible:ring-brand-primary/20"
              placeholder="Đến ngày"
            />
          </div>

          {/* Lọc theo trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[130px]">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[180px]">
              {statusOptions.map(s => (
                <DropdownMenuItem
                  key={s.label}
                  onClick={() => onFilterChange('status', s.value)}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                >
                  <span className={s.color || ''}>{s.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Lọc theo phương thức thanh toán */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[150px]">
                <FiCreditCard size={12} className="text-gray-400" />
                <span>{currentPaymentLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[220px]">
              {paymentOptions.map(s => (
                <DropdownMenuItem
                  key={s.label}
                  onClick={() => onFilterChange('paymentMethod', s.value)}
                  className="text-xs font-semibold cursor-pointer rounded-lg"
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onReset} className="p-2.5 bg-gray-50 text-gray-500 hover:text-brand-primary border border-gray-200 rounded-xl cursor-pointer transition-colors hover:bg-brand-primary/5 shadow-sm">
                <FiRefreshCw size={15} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="font-semibold">Làm mới bộ lọc</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <AnimatePresence>
        {activeBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50"
          >
            <span className="text-xs font-semibold text-gray-400 mr-1">Đang lọc theo:</span>
            {activeBadges.map(badge => (
              <motion.span
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                key={badge.key}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg text-xs font-bold shadow-sm"
              >
                {badge.label}
                <FiX
                  className="cursor-pointer hover:bg-brand-primary hover:text-white rounded-full p-0.5 transition-all w-4 h-4"
                  onClick={() => handleRemoveFilter(badge.key)}
                />
              </motion.span>
            ))}
            <button onClick={onReset} className="text-xs font-semibold text-gray-500 hover:text-red-500 underline ml-3 transition-colors cursor-pointer">
              Xóa tất cả bộ lọc
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}