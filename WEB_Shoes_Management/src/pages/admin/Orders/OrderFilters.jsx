import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiRefreshCw, FiX, FiFilter, FiCalendar, FiCreditCard, FiAlertCircle } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ORDER_STATUS, PAYMENT_STATUS } from '~/utils/constant'

export const OrderFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchTxt, setSearchTxt] = useState(filters.searchOrderId || '')
  const [startDate, setStartDate] = useState(filters.startDate || '')
  const [endDate, setEndDate] = useState(filters.endDate || '')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

  // Helper: Lấy ngày hôm nay dạng YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Validate ngày tháng
  const validateDates = (start, end) => {
    const newErrors = { startDate: '', endDate: '' }
    let isValid = true

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Chỉ validate khi có ít nhất 1 ngày được chọn
    if (start || end) {
      if (start) {
        const startDateObj = new Date(start)
        startDateObj.setHours(0, 0, 0, 0)

        if (startDateObj > today) {
          newErrors.startDate = 'Ngày bắt đầu không thể lớn hơn hôm nay'
          isValid = false
        }
      }

      if (end) {
        const endDateObj = new Date(end)
        endDateObj.setHours(0, 0, 0, 0)

        if (endDateObj > today) {
          newErrors.endDate = 'Ngày kết thúc không thể lớn hơn hôm nay'
          isValid = false
        }
      }

      if (start && end) {
        const startDateObj = new Date(start)
        const endDateObj = new Date(end)
        startDateObj.setHours(0, 0, 0, 0)
        endDateObj.setHours(0, 0, 0, 0)

        if (startDateObj > endDateObj) {
          newErrors.startDate = 'Ngày bắt đầu không thể lớn hơn ngày kết thúc'
          newErrors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
          isValid = false
        }
      }
    }

    setErrors(newErrors)
    return isValid
  }

  useEffect(() => {
    if (!filters.searchOrderId) setSearchTxt('')
  }, [filters.searchOrderId])

  useEffect(() => {
    // Sync với filters từ bên ngoài
    setStartDate(filters.startDate || '')
    setEndDate(filters.endDate || '')
  }, [filters.startDate, filters.endDate])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('searchOrderId', searchTxt.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTxt])

  // Xử lý khi thay đổi startDate
  const handleStartDateChange = (value) => {
    setStartDate(value)
    setErrors(prev => ({ ...prev, startDate: '' }))

    // Validate real-time
    const isValid = validateDates(value, endDate)

    // Nếu hợp lệ mới apply filter
    if (isValid) {
      onFilterChange('startDate', value || null)
    } else {
      // Nếu không hợp lệ, clear filter để tránh lọc sai
      onFilterChange('startDate', null)
    }
  }

  // Xử lý khi thay đổi endDate
  const handleEndDateChange = (value) => {
    setEndDate(value)
    setErrors(prev => ({ ...prev, endDate: '' }))

    // Validate real-time
    const isValid = validateDates(startDate, value)

    // Nếu hợp lệ mới apply filter
    if (isValid) {
      onFilterChange('endDate', value || null)
    } else {
      // Nếu không hợp lệ, clear filter để tránh lọc sai
      onFilterChange('endDate', null)
    }
  }

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: ORDER_STATUS.PENDING, label: 'Chờ xử lý' },
    { value: ORDER_STATUS.PROCESSING, label: 'Đang xử lý' },
    { value: ORDER_STATUS.SHIPPED, label: 'Đang giao' },
    { value: ORDER_STATUS.DELIVERED, label: 'Đã giao' },
    { value: ORDER_STATUS.CANCELLED, label: 'Đã hủy' }
  ]

  const paymentStatusOptions = [
    { value: '', label: 'Tất cả thanh toán' },
    { value: PAYMENT_STATUS.UNPAID, label: 'Chưa thanh toán' },
    { value: PAYMENT_STATUS.PAID, label: 'Đã thanh toán' },
    { value: PAYMENT_STATUS.REFUNDED, label: 'Đã hoàn tiền' }
  ]

  const getStatusColor = (status) => {
    const colors = {
      [ORDER_STATUS.PENDING]: 'text-amber-600 bg-amber-50',
      [ORDER_STATUS.PROCESSING]: 'text-purple-600 bg-purple-50',
      [ORDER_STATUS.SHIPPED]: 'text-indigo-600 bg-indigo-50',
      [ORDER_STATUS.DELIVERED]: 'text-green-600 bg-green-50',
      [ORDER_STATUS.CANCELLED]: 'text-red-600 bg-red-50'
    }
    return colors[status] || ''
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      [PAYMENT_STATUS.UNPAID]: 'text-gray-600 bg-gray-50',
      [PAYMENT_STATUS.PAID]: 'text-green-600 bg-green-50',
      [PAYMENT_STATUS.REFUNDED]: 'text-purple-600 bg-purple-50'
    }
    return colors[status] || ''
  }

  const currentStatusLabel = statusOptions.find(s => s.value === filters.status)?.label || 'Tất cả trạng thái'
  const currentPaymentStatusLabel = paymentStatusOptions.find(s => s.value === filters.paymentStatus)?.label || 'Tất cả thanh toán'

  const activeBadges = []
  if (filters.searchOrderId) activeBadges.push({ key: 'searchOrderId', label: `Mã đơn: #${filters.searchOrderId}` })
  if (filters.status) {
    const status = statusOptions.find(s => s.value === filters.status)
    if (status) activeBadges.push({ key: 'status', label: `Trạng thái: ${status.label}` })
  }
  if (filters.paymentStatus) {
    const pStatus = paymentStatusOptions.find(s => s.value === filters.paymentStatus)
    if (pStatus) activeBadges.push({ key: 'paymentStatus', label: `Thanh toán: ${pStatus.label}` })
  }
  if (filters.startDate) activeBadges.push({ key: 'startDate', label: `Từ: ${filters.startDate}` })
  if (filters.endDate) activeBadges.push({ key: 'endDate', label: `Đến: ${filters.endDate}` })

  const handleRemoveFilter = (key) => {
    if (key === 'startDate') {
      setStartDate('')
      setErrors(prev => ({ ...prev, startDate: '' }))
      onFilterChange('startDate', null)
    } else if (key === 'endDate') {
      setEndDate('')
      setErrors(prev => ({ ...prev, endDate: '' }))
      onFilterChange('endDate', null)
    } else if (key === 'searchOrderId') {
      onFilterChange('searchOrderId', null)
      setSearchTxt('')
    } else {
      onFilterChange(key, null)
    }
  }

  const maxDate = getTodayString()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo mã đơn hàng..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc trạng thái đơn hàng */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[150px]">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[180px]">
              {statusOptions.map(option => (
                <DropdownMenuItem
                  key={option.value || 'all'}
                  onClick={() => onFilterChange('status', option.value || null)}
                  className={`text-xs font-semibold cursor-pointer rounded-lg flex items-center gap-2 ${
                    option.value ? getStatusColor(option.value) : ''
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bộ lọc trạng thái thanh toán */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[150px]">
                <FiCreditCard size={14} className="text-gray-400" />
                <span>{currentPaymentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[180px]">
              {paymentStatusOptions.map(option => (
                <DropdownMenuItem
                  key={option.value || 'all'}
                  onClick={() => onFilterChange('paymentStatus', option.value || null)}
                  className={`text-xs font-semibold cursor-pointer rounded-lg flex items-center gap-2 ${
                    option.value ? getPaymentStatusColor(option.value) : ''
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bộ lọc ngày tháng - đã tăng width lên 48 */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <Input
                  type="date"
                  value={startDate}
                  max={maxDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className={`pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold focus-visible:ring-emerald-500/20 w-[180px] ${
                    errors.startDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                  }`}
                />
              </div>
              {errors.startDate && (
                <div className="flex items-start gap-1 text-xs text-red-500 break-words whitespace-normal max-w-[180px]">
                  <FiAlertCircle size={12} className="shrink-0 mt-0.5" />
                  <span className="leading-tight">{errors.startDate}</span>
                </div>
              )}
            </div>

            <span className="text-xs text-gray-400 font-bold">-</span>

            <div className="flex flex-col gap-1">
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <Input
                  type="date"
                  value={endDate}
                  max={maxDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className={`pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold focus-visible:ring-emerald-500/20 w-[180px] ${
                    errors.endDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                  }`}
                />
              </div>
              {errors.endDate && (
                <div className="flex items-start gap-1 text-xs text-red-500 break-words whitespace-normal max-w-[180px]">
                  <FiAlertCircle size={12} className="shrink-0 mt-0.5" />
                  <span className="leading-tight">{errors.endDate}</span>
                </div>
              )}
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onReset} className="p-2.5 bg-gray-50 text-gray-500 hover:text-emerald-500 border border-gray-200 rounded-xl cursor-pointer transition-colors hover:bg-emerald-500/5 shadow-sm">
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
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-xs font-bold shadow-sm"
              >
                {badge.label}
                <FiX className="cursor-pointer hover:bg-emerald-500 hover:text-white rounded-full p-0.5 transition-all w-4 h-4" onClick={() => handleRemoveFilter(badge.key)} />
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