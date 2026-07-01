import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiFilter, FiRefreshCw, FiX, FiCalendar, FiAlertCircle } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

export const StoreFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchTxt, setSearchTxt] = useState(filters.search || '')
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
    if (!filters.search) setSearchTxt('')
  }, [filters.search])

  useEffect(() => {
    setStartDate(filters.startDate || '')
    if (!filters.startDate) {
      setErrors(prev => ({ ...prev, startDate: '' }))
    }
  }, [filters.startDate])

  useEffect(() => {
    setEndDate(filters.endDate || '')
    if (!filters.endDate) {
      setErrors(prev => ({ ...prev, endDate: '' }))
    }
  }, [filters.endDate])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchTxt.trim() || null)
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
    { value: null, label: 'Tất cả trạng thái' },
    { value: 1, label: 'Đang hoạt động' },
    { value: 0, label: 'Chờ duyệt / Đã khóa' }
  ]

  // Fix: Xác định đúng label cho status
  const getCurrentStatusLabel = () => {
    if (filters.is_active === null || filters.is_active === undefined || filters.is_active === '') {
      return 'Tất cả trạng thái'
    }
    const status = statusOptions.find(s => s.value === Number(filters.is_active))
    return status?.label || 'Tất cả trạng thái'
  }

  const currentStatusLabel = getCurrentStatusLabel()

  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })

  if (filters.is_active !== null && filters.is_active !== undefined && filters.is_active !== '') {
    const statusLabel = filters.is_active === 1 ? 'Đang hoạt động' : 'Chờ duyệt / Đã khóa'
    activeBadges.push({ key: 'is_active', label: `Trạng thái: ${statusLabel}` })
  }

  if (filters.startDate) activeBadges.push({ key: 'startDate', label: `Từ ngày: ${filters.startDate}` })
  if (filters.endDate) activeBadges.push({ key: 'endDate', label: `Đến ngày: ${filters.endDate}` })

  const handleRemoveFilter = (key) => {
    if (key === 'startDate') {
      setStartDate('')
      setErrors(prev => ({ ...prev, startDate: '' }))
      onFilterChange('startDate', null)
    } else if (key === 'endDate') {
      setEndDate('')
      setErrors(prev => ({ ...prev, endDate: '' }))
      onFilterChange('endDate', null)
    } else if (key === 'is_active') {
      onFilterChange('is_active', null)
    } else {
      onFilterChange(key, null)
    }
  }

  const maxDate = getTodayString()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo tên cửa hàng hoặc chủ shop..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc ngày bắt đầu */}
          <div className="flex flex-col gap-1">
            <div className="relative w-[180px]">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                type="date"
                value={startDate}
                max={maxDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={`pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold w-full focus-visible:ring-brand-primary/20 ${
                  errors.startDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                }`}
                placeholder="Từ ngày"
              />
            </div>
            {errors.startDate && (
              <div className="flex items-start gap-1 text-xs text-red-500 break-words whitespace-normal max-w-[180px]">
                <FiAlertCircle size={12} className="shrink-0 mt-0.5" />
                <span className="leading-tight">{errors.startDate}</span>
              </div>
            )}
          </div>

          {/* Bộ lọc ngày kết thúc */}
          <div className="flex flex-col gap-1">
            <div className="relative w-[180px]">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                type="date"
                value={endDate}
                max={maxDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={`pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold w-full focus-visible:ring-brand-primary/20 ${
                  errors.endDate ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                }`}
                placeholder="Đến ngày"
              />
            </div>
            {errors.endDate && (
              <div className="flex items-start gap-1 text-xs text-red-500 break-words whitespace-normal max-w-[180px]">
                <FiAlertCircle size={12} className="shrink-0 mt-0.5" />
                <span className="leading-tight">{errors.endDate}</span>
              </div>
            )}
          </div>

          {/* Bộ lọc trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors min-w-[150px]">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {statusOptions.map(s => (
                <DropdownMenuItem
                  key={s.value === null ? 'all' : s.value}
                  onClick={() => onFilterChange('is_active', s.value)}
                  className={`text-xs font-semibold cursor-pointer rounded-lg ${
                    Number(filters.is_active) === s.value && s.value !== null ? 'text-brand-primary bg-brand-primary/5' : ''
                  }`}
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
                <FiX className="cursor-pointer hover:bg-brand-primary hover:text-white rounded-full p-0.5 transition-all w-4 h-4" onClick={() => handleRemoveFilter(badge.key)} />
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