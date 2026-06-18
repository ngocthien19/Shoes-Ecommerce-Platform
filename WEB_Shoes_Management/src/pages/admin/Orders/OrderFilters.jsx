import { useState, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiRefreshCw, FiX, FiFilter, FiCalendar } from 'react-icons/fi'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ORDER_STATUS } from '~/utils/constant'

export const OrderFilters = ({ filters, onFilterChange, onReset }) => {
  const [searchTxt, setSearchTxt] = useState(filters.searchOrderId || '')

  useEffect(() => {
    if (!filters.searchOrderId) setSearchTxt('')
  }, [filters.searchOrderId])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('searchOrderId', searchTxt.trim() || null)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTxt])

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: ORDER_STATUS.PENDING, label: 'Chờ xử lý' },
    { value: ORDER_STATUS.PROCESSING, label: 'Đang xử lý' },
    { value: ORDER_STATUS.SHIPPED, label: 'Đang giao' },
    { value: ORDER_STATUS.DELIVERED, label: 'Đã giao' },
    { value: ORDER_STATUS.CANCELLED, label: 'Đã hủy' }
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

  const currentStatusLabel = statusOptions.find(s => s.value === filters.status)?.label || 'Tất cả trạng thái'

  const activeBadges = []
  if (filters.searchOrderId) activeBadges.push({ key: 'searchOrderId', label: `Mã đơn: #${filters.searchOrderId}` })
  if (filters.status) {
    const status = statusOptions.find(s => s.value === filters.status)
    if (status) activeBadges.push({ key: 'status', label: `Trạng thái: ${status.label}` })
  }
  if (filters.startDate) activeBadges.push({ key: 'startDate', label: `Từ: ${filters.startDate}` })
  if (filters.endDate) activeBadges.push({ key: 'endDate', label: `Đến: ${filters.endDate}` })

  const handleRemoveFilter = (key) => {
    if (key === 'startDate' || key === 'endDate') {
      onFilterChange(key, null)
    } else if (key === 'searchOrderId') {
      onFilterChange('searchOrderId', null)
      setSearchTxt('')
    } else {
      onFilterChange(key, null)
    }
  }

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
          {/* Bộ lọc trạng thái */}
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

          {/* Bộ lọc ngày tháng */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange('startDate', e.target.value || null)}
                className="pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold focus-visible:ring-emerald-500/20 w-36"
              />
            </div>
            <span className="text-xs text-gray-400 font-bold">-</span>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange('endDate', e.target.value || null)}
                className="pl-9 rounded-xl border-gray-200 py-2.5 text-sm font-semibold focus-visible:ring-emerald-500/20 w-36"
              />
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