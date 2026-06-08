import { useState, useEffect } from 'react'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { Pagination } from '~/components/common/Pagination'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { orderTrackingApiService } from '~/services/user/orderTrackingApiService'
import { toast } from 'react-toastify'
import { OrderCard } from './OrderCard'
import { CancelOrderModal } from './CancelOrderModal'
import { WithdrawCancelModal } from './WithdrawCancelModal'
import { ORDER_STATUS } from '~/utils/constant'
import { FiGrid, FiFileText,
  FiPackage, FiTruck,
  FiCheckCircle, FiXCircle,
  FiAlertCircle, FiInbox
} from 'react-icons/fi'

export const OrderTrackingPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('all')
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 5 })
  const [statusCounts, setStatusCounts] = useState({})
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [selectedOrderForWithdraw, setSelectedOrderForWithdraw] = useState(null)

  const fetchOrders = async (page = 1, status = 'all') => {
    setLoading(true)
    try {
      const res = await orderTrackingApiService.getOrderHistory(page, pagination.limit, status)
      setOrders(res.orders)
      setPagination(res.pagination)
      setStatusCounts(res.statusCounts || {})
    } catch (error) {
      toast.error('Gặp lỗi khi tải lịch sử đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  // Chạy khi Component mount hoặc khi đổi Tab/Đổi Trang
  useEffect(() => {
    fetchOrders(pagination.currentPage, currentTab)
    // Đưa scroll lên top nhẹ nhàng
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pagination.currentPage, currentTab])

  // Xử lý đổi Tab
  const handleTabChange = (value) => {
    setCurrentTab(value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  // HÀM XỬ LÝ HỦY ĐƠN HÀNG TRUYỀN XUỐNG CARD
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return

    try {
      const res = await orderTrackingApiService.cancelOrder(orderId)
      toast.success(res.message)
      fetchOrders(pagination.currentPage, currentTab)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hủy đơn.')
    }
  }

  // HÀM XỬ LÝ RÚT YÊU CẦU HỦY
  const handleWithdrawCancel = async (orderId) => {
    if (!window.confirm('Xác nhận rút lại yêu cầu hủy đơn?')) return

    try {
      const res = await orderTrackingApiService.withdrawCancelRequest(orderId)
      toast.success(res.message)
      fetchOrders(pagination.currentPage, currentTab) // Reload data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi rút yêu cầu.')
    }
  }

  const triggerCancelModal = (order) => {
    setSelectedOrderForCancel(order)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async (orderId, reason) => {
    setIsCancelModalOpen(false)
    try {
      // Truyền thêm reason vào API call
      const res = await orderTrackingApiService.cancelOrder(orderId, { reason })
      toast.success(res.message)
      fetchOrders(pagination.currentPage, currentTab)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hủy đơn.')
    }
  }

  const triggerWithdrawModal = (order) => {
    setSelectedOrderForWithdraw(order)
    setIsWithdrawModalOpen(true)
  }

  const handleConfirmWithdraw = async (orderId) => {
    setIsWithdrawModalOpen(false)
    try {
      const res = await orderTrackingApiService.withdrawCancelRequest(orderId)
      toast.success(res.message)

      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi rút yêu cầu.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-brand-secondary flex items-center gap-3 after:content-[''] after:inline-block after:w-20 after:h-[5px] after:bg-brand-primary/60 after:rounded-full">
            <FiPackage size={28} className="text-brand-primary" />
                Theo dõi đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mt-2">Quản lý và xem lộ trình vận chuyển các đơn hàng của bạn.</p>
        </div>

        <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full flex overflow-x-auto justify-start lg:justify-between items-center bg-white px-3 py-8 gap-1.5 rounded-2xl shadow-sm mb-6 border border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger value="all" className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <FiGrid size={16} />
                <span>Tất cả</span>
                {statusCounts?.all > 0 && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.all}</span>}
              </div>
            </TabsTrigger>

            <TabsTrigger value={ORDER_STATUS.PENDING} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <FiFileText size={16} />
                <span>Đơn hàng mới</span>
                {statusCounts?.pending > 0 && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.pending}</span>}
              </div>
            </TabsTrigger>

            <TabsTrigger value={ORDER_STATUS.PROCESSING} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <FiPackage size={16} />
                <span>Đang xử lý</span>
                {statusCounts?.processing > 0 && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.processing}</span>}
              </div>
            </TabsTrigger>

            <TabsTrigger value={ORDER_STATUS.SHIPPED} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <FiTruck size={16} />
                <span>Đang giao</span>
                {statusCounts?.shipped > 0 && <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.shipped}</span>}
              </div>
            </TabsTrigger>

            <TabsTrigger value={ORDER_STATUS.DELIVERED} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <FiCheckCircle size={16} />
                <span>Đã giao</span>
                {statusCounts?.delivered > 0 && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.delivered}</span>}
              </div>
            </TabsTrigger>

            <TabsTrigger value={ORDER_STATUS.CANCELLED} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <FiXCircle size={16} />
                <span>Đã hủy</span>
                {statusCounts?.cancelled > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.cancelled}</span>}
              </div>
            </TabsTrigger>

            <TabsTrigger value={ORDER_STATUS.CANCEL_REQUESTED} className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-500 rounded-xl hover:text-brand-primary hover:bg-gray-50/80 data-[state=active]:bg-brand-primary/10 data-[state=active]:text-brand-primary data-[state=active]:font-bold transition-all duration-300 ease-in-out active:scale-95 cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <FiAlertCircle size={16} />
                <span>Yêu cầu hủy</span>
                {statusCounts?.cancel_requested > 0 && <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{statusCounts.cancel_requested}</span>}
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Content thay đổi theo Tab */}
          <TabsContent value={currentTab} className="mt-0 outline-none animate-fadeIn">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-20 h-20 ring ring-brand-primary bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FiInbox size={40} className="text-brand-primary" />
                </div>

                <p className="text-gray-500 font-medium">Chưa có đơn hàng nào ở trạng thái này.</p>
              </div>
            ) : (
              <>
                {orders.map((order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onCancelOrder={() => triggerCancelModal(order)}
                    onWithdrawCancel={() => triggerWithdrawModal(order)}
                  />
                ))}

                <CancelOrderModal
                  isOpen={isCancelModalOpen}
                  onClose={() => setIsCancelModalOpen(false)}
                  order={selectedOrderForCancel}
                  onConfirm={handleConfirmCancel}
                />

                <WithdrawCancelModal
                  isOpen={isWithdrawModalOpen}
                  onClose={() => setIsWithdrawModalOpen(false)}
                  order={selectedOrderForWithdraw}
                  onConfirm={handleConfirmWithdraw}
                />

                {/* Phân trang */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

      </main>
      <Footer />
    </div>
  )
}