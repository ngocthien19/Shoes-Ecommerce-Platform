import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiPackage, FiEye, FiStar, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { FaBan } from 'react-icons/fa'
import { formatPrice, formatDateTime, getImageUrl } from '~/utils/formatters'
import { managerProductApiService } from '~/services/manager/managerProductApiService'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constant'
import { ConfirmReasonModal } from '../ConfirmReasonModal'
import { Pagination } from '~/components/common/Pagination'

export const StoreProductsList = ({ storeId, storeName }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 })
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, productId: null, productName: '', title: '', message: '', placeholder: '' })
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      const res = await managerProductApiService.getProducts({ storeId, page, limit: pagination.limit })
      setProducts(res.products || [])
      setPagination({ currentPage: res.pagination?.currentPage || page, totalPages: res.pagination?.totalPages || 1, totalItems: res.pagination?.totalItems || 0, limit: res.pagination?.limit || 10 })
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (storeId) fetchProducts(1) }, [storeId])

  const handleUpdateStatus = async (productId, targetStatus, reason = null) => {
    setIsLoading(true)
    try {
      const res = await managerProductApiService.updateProductStatus(productId, targetStatus, reason)
      toast.success(res.message)
      fetchProducts(pagination.currentPage)
      setModalConfig({ isOpen: false, type: null, productId: null, productName: '' })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const openRejectModal = (productId, productName) => {
    setModalConfig({ isOpen: true, type: 'reject', productId, productName, title: 'Từ chối sản phẩm', message: 'Vui lòng nhập lý do từ chối sản phẩm.', placeholder: 'Nhập lý do từ chối...' })
  }

  const openBanModal = (productId, productName) => {
    setModalConfig({ isOpen: true, type: 'ban', productId, productName, title: 'Khóa sản phẩm', message: 'Vui lòng nhập lý do khóa sản phẩm.', placeholder: 'Nhập lý do khóa...' })
  }

  const handleModalConfirm = async (reason) => {
    if (modalConfig.type === 'reject') {
      await handleUpdateStatus(modalConfig.productId, PRODUCT_MODERATION_STATUS.REJECTED, reason)
    } else if (modalConfig.type === 'ban') {
      await handleUpdateStatus(modalConfig.productId, PRODUCT_MODERATION_STATUS.BANNED, reason)
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      [PRODUCT_MODERATION_STATUS.APPROVED]: { label: 'ĐÃ DUYỆT', color: 'bg-green-100 text-green-700', icon: FiCheckCircle },
      [PRODUCT_MODERATION_STATUS.PENDING]: { label: 'CHỜ DUYỆT', color: 'bg-amber-100 text-amber-700', icon: FiClock },
      [PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL]: { label: 'CHỜ DUYỆT LẠI', color: 'bg-orange-100 text-orange-700', icon: FiRefreshCw },
      [PRODUCT_MODERATION_STATUS.REJECTED]: { label: 'BỊ TỪ CHỐI', color: 'bg-red-100 text-red-700', icon: FiXCircle },
      [PRODUCT_MODERATION_STATUS.BANNED]: { label: 'BỊ KHÓA', color: 'bg-gray-100 text-gray-700', icon: FaBan }
    }
    const c = config[status] || { label: 'KHÔNG XÁC ĐỊNH', color: 'bg-gray-100 text-gray-500', icon: FiAlertCircle }
    const Icon = c.icon
    return <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${c.color}`}><Icon size={10} />{c.label}</span>
  }

  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 p-8"><div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" /></div></div>
  }

  if (products.length === 0) {
    return <div className="bg-white rounded-2xl border border-gray-100 p-8"><div className="flex flex-col items-center justify-center py-12 gap-3"><FiPackage size={48} className="text-gray-300" /><p className="text-gray-500 font-medium">Chưa có sản phẩm nào</p><p className="text-xs text-gray-400">Cửa hàng này chưa đăng bán sản phẩm nào</p></div></div>
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center"><FiPackage className="text-brand-primary" size={18} /></div>
            <div><h3 className="text-lg font-black text-gray-900">Sản phẩm của cửa hàng</h3><p className="text-xs text-gray-500 mt-0.5">Tổng số: {pagination.totalItems} sản phẩm</p></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4">Giá</th>
                <th className="py-3 px-4 text-center">Đã bán</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Ngày tạo</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-gray-500">#{product.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(product.images, 'https://placehold.co/40x40')} alt={product.product_name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                      <div><p className="font-semibold text-gray-800 line-clamp-1">{product.product_name}</p><p className="text-[10px] text-gray-400">{product.category_name}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-primary">{formatPrice(product.price)}</td>
                  <td className="py-3 px-4 text-center font-semibold">{product.sold || 0}</td>
                  <td className="py-3 px-4 text-center"><div className="flex items-center justify-center gap-1"><FiStar className="text-yellow-500" size={12} /><span className="font-semibold">{(product.rating_avg || 0).toFixed(1)}</span></div></td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(product.status)}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">{formatDateTime(product.created_at)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/manager/products/detail/${product.slug}`} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg transition-all"><FiEye size={14} /></Link>
                      {(product.status === PRODUCT_MODERATION_STATUS.PENDING || product.status === PRODUCT_MODERATION_STATUS.PENDING_REAPPROVAL) && (
                        <>
                          <button onClick={() => handleUpdateStatus(product.id, PRODUCT_MODERATION_STATUS.APPROVED)} className="p-2 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"><FiCheckCircle size={14} /></button>
                          <button onClick={() => openRejectModal(product.id, product.product_name)} className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"><FiXCircle size={14} /></button>
                        </>
                      )}
                      {product.status === PRODUCT_MODERATION_STATUS.APPROVED && (
                        <button onClick={() => openBanModal(product.id, product.product_name)} className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"><FaBan size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100"><Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={fetchProducts} /></div>
        )}
      </div>

      <ConfirmReasonModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ isOpen: false, type: null, productId: null, productName: '' })} onConfirm={handleModalConfirm} title={modalConfig.title} message={`Từ chối sản phẩm "${modalConfig.productName}"`} placeholder={modalConfig.placeholder} isLoading={isLoading} />
    </>
  )
}