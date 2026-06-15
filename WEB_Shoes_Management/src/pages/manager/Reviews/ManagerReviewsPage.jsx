import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFlag, FiStar } from 'react-icons/fi'

import { managerReviewApiService } from '~/services/manager/managerReviewApiService'
import { managerStoreApiService } from '~/services/manager/managerStoreApiService'
import { ReviewOverviewWidgets } from './ReviewOverviewWidgets'
import { ReviewFilters } from './ReviewFilters'
import { ReviewTable } from './ReviewTable'
import { ReviewBulkActionPanel } from './ReviewBulkActionPanel'
import { ReviewSearchResultsInfo } from './ReviewSearchResultsInfo'
import { Pagination } from '~/components/common/Pagination'

export const ManagerReviewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedReviews, setSelectedReviews] = useState([])
  const [stores, setStores] = useState([])

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  const type = searchParams.get('type') || 'product'
  const search = searchParams.get('search') || null
  const rating = searchParams.get('rating') || null
  const storeId = searchParams.get('storeId') || null
  const startDate = searchParams.get('startDate') || null
  const endDate = searchParams.get('endDate') || null
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'DESC'

  const activeFilters = { page, limit, type, search, rating, storeId, startDate, endDate, sortBy, sortOrder }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await managerReviewApiService.getReportedReviews(activeFilters)
      setData(res)
    } catch (error) {
      toast.error(error.message || 'Lỗi nạp dữ liệu đánh giá.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch danh sách stores cho bộ lọc
  const fetchStores = async () => {
    try {
      const res = await managerStoreApiService.getStores({ limit: 100 })
      if (res?.stores && Array.isArray(res.stores)) {
        setStores(res.stores)
      }
    } catch (error) {
      console.error('Lỗi tải danh sách cửa hàng:', error)
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchStores()
    setSelectedIds([])
    setSelectedReviews([])
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

  const handleResetFilters = () => setSearchParams({})

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
    const review = data?.reviews?.find(r => r.id === id)
    if (review) {
      setSelectedReviews(prev => prev.includes(review) ? prev.filter(r => r.id !== id) : [...prev, review])
    }
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked && data?.reviews) {
      setSelectedIds(data.reviews.map(r => r.id))
      setSelectedReviews([...data.reviews])
    } else {
      setSelectedIds([])
      setSelectedReviews([])
    }
  }

  const handleResolveBulk = async (action) => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn đánh giá cần xử lý')
      return
    }

    try {
      const res = await managerReviewApiService.resolveReviewsBulk(selectedIds, type, action)
      toast.success(res.message)
      setSelectedIds([])
      setSelectedReviews([])
      fetchReviews()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleResolveSingle = async (reviewId, action) => {
    try {
      const res = await managerReviewApiService.resolveReviewsBulk([reviewId], type, action)
      toast.success(res.message)
      fetchReviews()
      setSelectedIds([])
      setSelectedReviews([])
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (search) count++
    if (rating) count++
    if (storeId) count++
    if (startDate) count++
    if (endDate) count++
    if (type !== 'product') count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <FiFlag className="text-amber-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Quản lý khiếu nại đánh giá</h2>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Phân xử các đánh giá bị tố cáo vi phạm</p>
        </div>
      </div>

      {data?.overview && <ReviewOverviewWidgets overview={data.overview} />}

      <ReviewFilters
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        stores={stores}
      />

      {!loading && data && (
        <ReviewSearchResultsInfo
          totalItems={data.pagination.totalItems}
          currentPage={data.pagination.currentPage}
          limit={data.pagination.limit}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      <AnimatePresence mode="wait">
        {selectedIds.length > 0 && (
          <ReviewBulkActionPanel
            selectedCount={selectedIds.length}
            onBulkAction={handleResolveBulk}
            onClearSelection={() => {
              setSelectedIds([])
              setSelectedReviews([])
            }}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Đang nạp dữ liệu đánh giá...</span>
        </div>
      ) : (
        data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <ReviewTable
              reviews={data.reviews}
              reviewType={type}
              selectedIds={selectedIds}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onResolveSingle={handleResolveSingle}
            />

            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => handleFilterChange('page', p)}
            />
          </motion.div>
        )
      )}
    </div>
  )
}