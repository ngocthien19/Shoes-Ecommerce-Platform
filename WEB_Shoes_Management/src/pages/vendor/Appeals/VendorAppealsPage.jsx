import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiAlertCircle, FiEye, FiClock, FiCheckCircle, FiXCircle,
  FiFileText, FiPlus, FiSearch
} from 'react-icons/fi'
import { vendorAppealApiService } from '~/services/vendor/vendorAppealApiService'
import { APPEAL_STATUS } from '~/utils/constant'
import { formatDateTime, formatRelativeTime } from '~/utils/formatters'
import { Pagination } from '~/components/common/Pagination'
import { Input } from '~/components/ui/input'

export const VendorAppealsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const status = searchParams.get('status') || null

  const fetchAppeals = async () => {
    try {
      setLoading(true)
      const res = await vendorAppealApiService.getMyAppeals({ page, limit, status })
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi tải danh sách đơn cứu xét')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppeals()
  }, [searchParams])

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === null || value === undefined || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    if (key !== 'page') newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const getStatusBadge = (status) => {
    const config = {
      [APPEAL_STATUS.PENDING]: {
        label: 'CHỜ XỬ LÝ',
        className: 'bg-amber-50 text-amber-600 border-amber-100',
        icon: FiClock,
        color: 'text-amber-500'
      },
      [APPEAL_STATUS.APPROVED]: {
        label: 'ĐÃ DUYỆT',
        className: 'bg-green-50 text-green-600 border-green-100',
        icon: FiCheckCircle,
        color: 'text-green-500'
      },
      [APPEAL_STATUS.REJECTED]: {
        label: 'ĐÃ TỪ CHỐI',
        className: 'bg-red-50 text-red-600 border-red-100',
        icon: FiXCircle,
        color: 'text-red-500'
      }
    }
    const c = config[status] || {
      label: status?.toUpperCase(),
      className: 'bg-gray-50 text-gray-600 border-gray-100',
      icon: FiAlertCircle,
      color: 'text-gray-500'
    }
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[10px] font-black ${c.className}`}>
        <Icon size={10} className={c.color} />
        {c.label}
      </span>
    )
  }

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: APPEAL_STATUS.PENDING, label: 'Chờ xử lý' },
    { value: APPEAL_STATUS.APPROVED, label: 'Đã duyệt' },
    { value: APPEAL_STATUS.REJECTED, label: 'Đã từ chối' }
  ]

  const currentStatusLabel = statusOptions.find(s => s.value === status)?.label || 'Tất cả trạng thái'

  // Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <FiAlertCircle className="text-red-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Đơn cứu xét của tôi</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Theo dõi trạng thái đơn giải trình cửa hàng</p>
          </div>
        </div>
        <Link
          to="/vendor/profile-store"
          className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-brand-primary/20 hover:bg-[#c73652] transition-all duration-300 active:scale-95"
        >
          <FiPlus size={16} />
          Gửi đơn mới
        </Link>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo lý do..."
              className="pl-10 rounded-xl border-gray-200 py-2.5 text-sm font-semibold focus-visible:ring-brand-primary/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || null)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none cursor-pointer focus:border-brand-primary/50 min-w-[160px]"
            >
              {statusOptions.map(option => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang tải dữ liệu...</span>
        </div>
      ) : data?.appeals?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <FiFileText size={32} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-500">Chưa có đơn cứu xét nào</p>
            <p className="text-sm text-gray-400 mt-1">Khi bạn gửi đơn giải trình sẽ hiển thị tại đây</p>
          </div>
          <Link
            to="/vendor/profile-store"
            className="mt-2 inline-flex items-center gap-2 bg-brand-primary text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-brand-primary/20 hover:bg-[#c73652] transition-all duration-300"
          >
            <FiPlus size={16} />
            Gửi đơn ngay
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Thống kê nhanh */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng đơn</p>
              <p className="text-2xl font-black text-gray-900">{data?.pagination?.totalItems || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Đang chờ</p>
              <p className="text-2xl font-black text-amber-600">
                {data?.appeals?.filter(a => a.status === APPEAL_STATUS.PENDING).length || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Đã xử lý</p>
              <p className="text-2xl font-black text-green-600">
                {data?.appeals?.filter(a => a.status === APPEAL_STATUS.APPROVED || a.status === APPEAL_STATUS.REJECTED).length || 0}
              </p>
            </div>
          </div>

          {/* Bảng danh sách */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4 min-w-[200px]">Lý do giải trình</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Ngày gửi</th>
                    <th className="py-3 px-4 text-center">Cập nhật</th>
                    <th className="py-3 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.appeals.map((appeal, index) => (
                    <motion.tr
                      key={appeal.id}
                      variants={rowVariants}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="transition-colors duration-200"
                    >
                      <td className="py-3 px-4 text-xs font-mono text-gray-500">#{appeal.id}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-[300px]">
                          {appeal.appeal_reason || 'Không có lý do'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(appeal.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-xs">
                          <p className="font-semibold text-gray-700">{formatDateTime(appeal.created_at)}</p>
                          <p className="text-[10px] text-gray-400">{formatRelativeTime(appeal.created_at)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-xs">
                          <p className="font-semibold text-gray-700">{formatDateTime(appeal.updated_at)}</p>
                          <p className="text-[10px] text-gray-400">{formatRelativeTime(appeal.updated_at)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/vendor/appeals/${appeal.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-600 hover:text-white text-gray-600 rounded-lg transition-all duration-200 text-xs font-bold"
                        >
                          <FiEye size={14} />
                          Chi tiết
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination?.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  onPageChange={(p) => handleFilterChange('page', p)}
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}