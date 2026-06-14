import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiFilter, FiRefreshCw, FiX, FiCalendar } from 'react-icons/fi'
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

export const PromotionFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchTxt, setSearchTxt] = useState(filters.search || '')
  const [startDate, setStartDate] = useState(filters.start_date || '')
  const [endDate, setEndDate] = useState(filters.end_date || '')

  // Sync state khi filters thay đổi từ bên ngoài (khi reset tất cả)
  useEffect(() => {
    setStartDate(filters.start_date || '')
  }, [filters.start_date])

  useEffect(() => {
    setEndDate(filters.end_date || '')
  }, [filters.end_date])

  useEffect(() => {
    if (!filters.search) setSearchTxt('')
  }, [filters.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchTxt.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTxt])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('start_date', startDate || null)
    }, 300)
    return () => clearTimeout(timer)
  }, [startDate])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('end_date', endDate || null)
    }, 300)
    return () => clearTimeout(timer)
  }, [endDate])

  const statusOptions = [
    { value: 1, label: 'Đang hoạt động' },
    { value: 0, label: 'Tạm dừng' }
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Mới nhất' },
    { value: 'discount_value', label: 'Giảm giá cao nhất' },
    { value: 'end_date', label: 'Sắp hết hạn' }
  ]

  const currentStatusLabel = statusOptions.find(s => s.value === filters.is_active)?.label || 'Tất cả trạng thái'
  const currentSortLabel = sortOptions.find(s => s.value === filters.sortBy)?.label || 'Sắp xếp'

  // Badge lọc đang kích hoạt
  const activeBadges = []
  if (filters.search) activeBadges.push({ key: 'search', label: `Tìm: "${filters.search}"` })
  if (filters.is_active !== null && filters.is_active !== undefined) {
    const statusLabel = filters.is_active === 1 ? 'Đang hoạt động' : 'Tạm dừng'
    activeBadges.push({ key: 'is_active', label: `Trạng thái: ${statusLabel}` })
  }
  if (filters.start_date) activeBadges.push({ key: 'start_date', label: `Từ ngày: ${filters.start_date}` })
  if (filters.end_date) activeBadges.push({ key: 'end_date', label: `Đến ngày: ${filters.end_date}` })
  if (filters.sortBy && filters.sortBy !== 'created_at') {
    const sortObj = sortOptions.find(s => s.value === filters.sortBy)
    if (sortObj) activeBadges.push({ key: 'sortBy', label: `Sắp xếp: ${sortObj.label}` })
  }

  // Hàm xóa filter, xử lý đặc biệt cho start_date và end_date
  const handleRemoveFilter = (key) => {
    if (key === 'start_date') {
      setStartDate('')
      onFilterChange('start_date', null)
    } else if (key === 'end_date') {
      setEndDate('')
      onFilterChange('end_date', null)
    } else {
      onFilterChange(key, null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Khung Search */}
        <div className="relative w-full lg:max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Tìm theo mã giảm giá..."
            className="pl-10 rounded-xl border-gray-200 py-5 text-sm font-semibold focus-visible:ring-brand-primary/20"
          />
        </div>

        {/* Cụm Dropdown Lọc */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Bộ lọc ngày bắt đầu */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold w-[150px] focus-visible:ring-brand-primary/20"
              placeholder="Từ ngày"
            />
          </div>

          {/* Bộ lọc ngày kết thúc */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold w-[150px] focus-visible:ring-brand-primary/20"
              placeholder="Đến ngày"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <span>{currentStatusLabel}</span>
                <FiChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              <DropdownMenuItem onClick={() => onFilterChange('is_active', null)} className="text-xs font-bold cursor-pointer rounded-lg">Tất cả trạng thái</DropdownMenuItem>
              {statusOptions.map(s => (
                <DropdownMenuItem key={s.label} onClick={() => onFilterChange('is_active', s.value)} className="text-xs font-semibold cursor-pointer rounded-lg">{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer transition-colors">
                <FiFilter size={12} className="text-gray-400" />
                <span>{currentSortLabel}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-gray-50 min-w-[160px]">
              {sortOptions.map(o => (
                <DropdownMenuItem key={o.value} onClick={() => onFilterChange('sortBy', o.value)} className="text-xs font-semibold cursor-pointer rounded-lg">{o.label}</DropdownMenuItem>
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