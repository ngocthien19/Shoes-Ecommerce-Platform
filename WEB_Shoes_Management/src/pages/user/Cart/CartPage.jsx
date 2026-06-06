import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { cartApiService } from '~/services/user/cartService'
import { orderApiService } from '~/services/user/orderService'
import { setCartCount } from '~/redux/user/cartSlice'
import { toast } from 'react-toastify'
import { FiShoppingBag } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import { CartItemList } from './CartItemList'
import { CheckoutForm } from './CheckoutForm'
import { CartSummary } from './CartSummary'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'
import { RecommendedProducts } from '~/components/user/RecommendedProducts'

export const CartPage = () => {
  const dispatch = useDispatch()
  const userInfo = useSelector((state) => state.user.userInfo)

  const navigate = useNavigate()

  const [cartItems, setCartItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const [storeVouchers, setStoreVouchers] = useState({})
  const [loadingOrder, setLoadingOrder] = useState(false)

  // ── STATES QUẢN LÝ MODAL XÓA ──
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState([])

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      recipientName: userInfo?.fullname || '',
      recipientPhone: userInfo?.phone || '',
      shippingAddress: userInfo?.address || ''
    }
  })

  const fetchCartData = async () => {
    try {
      const data = await cartApiService.getCart()
      if (Array.isArray(data)) {
        setCartItems(data)
        const totalItems = data.reduce((sum, item) => sum + item.cart_quantity, 0)
        dispatch(setCartCount(totalItems))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleReloadAndScrollTop = () => {
    fetchCartData()

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    fetchCartData()
  }, [])

  // ── Xóa 1 sản phẩm lẻ (Bấm từ icon thùng rác từng dòng) ──
  const handleRequestRemoveSingle = (variantId) => {
    setPendingDeleteIds([variantId])
    setIsDeleteModalOpen(true)
  }

  // ── Xóa hàng loạt sản phẩm (Bấm từ nút Xóa mục đã chọn ở tiêu đề) ──
  const handleRequestRemoveSelectedBulk = () => {
    if (selectedItems.length === 0) return
    setPendingDeleteIds(selectedItems)
    setIsDeleteModalOpen(true)
  }

  // ── Xác nhận xóa chính thức trên Modal ──
  const handleConfirmRemoveItemsSubmit = async () => {
    if (pendingDeleteIds.length === 0) return

    try {
      // Gọi API xóa hàng loạt (đã cấu hình nhận mảng ở các bước trước)
      const res = await cartApiService.removeFromCart(pendingDeleteIds)

      if (res) {
        toast.success(pendingDeleteIds.length > 1 ? 'Đã xóa tất cả sản phẩm thành công!' : 'Đã gỡ sản phẩm khỏi giỏ.')

        // Cập nhật lại UI: Xóa khỏi mảng đang chọn
        setSelectedItems(prev => prev.filter(id => !pendingDeleteIds.includes(id)))

        // Cập nhật lại UI: Xóa mã giảm giá của các mặt hàng đó
        setStoreVouchers(v => {
          const copy = { ...v }
          pendingDeleteIds.forEach(id => delete copy[id])
          return copy
        })

        fetchCartData()
      }
    } catch (error) {
      toast.error('Gặp lỗi khi xóa sản phẩm!')
    } finally {
      // Đóng modal và reset data an toàn
      setIsDeleteModalOpen(false)
      setPendingDeleteIds([])
    }
  }

  // Xử lý Checkbox chọn hàng lẻ
  const handleToggleSelect = (variantId) => {
    setSelectedItems(prev => {
      const isRemoving = prev.includes(variantId)
      if (isRemoving) {
        setStoreVouchers(v => {
          const copy = { ...v }
          delete copy[variantId]
          return copy
        })
      }
      return isRemoving ? prev.filter(id => id !== variantId) : [...prev, variantId]
    })
  }

  // Chọn toàn bộ giỏ hàng
  const handleToggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
      setStoreVouchers({})
    } else {
      setSelectedItems(cartItems.map(item => item.variant_id))
    }
  }

  const handleUpdateQuantity = async (variantId, newQty) => {
    try {
      const res = await cartApiService.updateQuantity(variantId, newQty)
      if (res) fetchCartData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật số lượng!')
    }
  }

  const handleStoreVoucherSelect = (storeId, code, discountValue) => {
    setStoreVouchers(prev => ({
      ...prev,
      [storeId]: { code, discountValue }
    }))
    toast.success('Đã áp dụng mã của cửa hàng thành công!')
  }

  // ── LOGIC CỘNG DỒN TÍNH TOÁN DÒNG TIỀN TỔNG HỢP ──
  const selectedCartObjects = cartItems.filter(item => selectedItems.includes(item.variant_id))

  const subTotal = selectedCartObjects.reduce((sum, item) => {
    return sum + (Number(item.base_price) * item.cart_quantity)
  }, 0)

  const totalDiscountAmount = selectedCartObjects.reduce((sum, item) => {
    const itemRowPrice = Number(item.base_price) * item.cart_quantity

    const backendPromoPercent = Number(item.discount_percentage || 0)
    const productItemDiscount = itemRowPrice * (backendPromoPercent / 100)

    const voucherRowPercent = storeVouchers[item.store_id]?.discountValue || 0
    const voucherRowDiscount = itemRowPrice * (voucherRowPercent / 100)

    return sum + productItemDiscount + voucherRowDiscount
  }, 0)

  const finalTotal = Math.max(0, subTotal - totalDiscountAmount)

  // XỬ LÝ ĐẶT HÀNG
  const handleCheckoutProcess = handleSubmit(async (formData) => {
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng tích chọn ít nhất một đôi giày để tiến hành thanh toán!')
      return
    }

    setLoadingOrder(true)

    const orderPayload = {
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      shippingAddress: formData.shippingAddress,
      discountAmount: totalDiscountAmount,
      paymentMethod: paymentMethod
    }

    try {
      if (paymentMethod === 'COD') {
        const data = await orderApiService.createOrderCOD(orderPayload)

        if (data) {
          toast.success('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.')
          dispatch(setCartCount(0))

          const formattedOrderIds = data.orderIds && data.orderIds.length > 0
            ? `#${data.orderIds.join(', #')}`
            : '#ORD-UNKNOWN'

          const uniqueCategoryIds = [...new Set(selectedCartObjects.map(item => item.category_id))]

          const boughtProductIds = selectedCartObjects.map(item => item.product_id)

          navigate('/order-success', {
            state: {
              orderData: {
                orderId: formattedOrderIds,
                orderDate: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
                paymentMethod: 'Thanh toán khi nhận hàng (COD)'
              },
              categoryIds: uniqueCategoryIds,
              excludedIds: boughtProductIds
            }
          })
        }
      } else {
        const data = await orderApiService.createOrderOnline(orderPayload)

        if (data?.paymentUrl) {
          toast.info('Đang chuyển hướng sang cổng thanh toán an toàn...')

          window.location.href = data.paymentUrl
        } else {
          toast.error('Không nhận được đường dẫn thanh toán từ cổng điện tử.')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hệ thống trong quá trình đặt hàng!')
    } finally {
      setLoadingOrder(false)
    }
  })

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Header />

      <div className="py-8 w-full flex-1 flex flex-col">
        <main className="app-container flex-1">

          {/* ── Header Giỏ hàng & Nút Xóa hàng loạt ── */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-brand-secondary uppercase tracking-tight flex items-center gap-2.5 after:content-[''] after:inline-block after:w-20 after:h-[5px] after:bg-brand-primary/60 after:rounded-full">
              <FiShoppingBag size={24} className="text-brand-primary shrink-0" />
              <span>Giỏ hàng của bạn ({cartItems.length} sản phẩm)</span>
            </h2>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-bold max-w-xl mx-auto my-8 animate-fadeIn">
              <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                <FiShoppingBag size={32} />
              </div>

              <h3 className="text-base font-bold text-gray-800 mb-1">Giỏ hàng của bạn đang trống</h3>
              <p className="text-xs text-gray-400 italic max-w-xs mx-auto mb-6">
                Có vẻ như bạn chưa thêm bất kỳ đôi giày nào vào giỏ hàng của mình.
              </p>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-[#c73652] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span>Mua sản phẩm ngay</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* CỘT TRÁI (Chiếm 2 phần): Danh sách giày */}
              <div className="lg:col-span-2">
                <CartItemList
                  cartItems={cartItems}
                  selectedItems={selectedItems}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRequestRemoveSingle}
                  handleRequestRemoveSelectedBulk={handleRequestRemoveSelectedBulk}
                  storeVouchers={storeVouchers}
                  onStoreVoucherSelect={handleStoreVoucherSelect}
                />
              </div>

              {/* CỘT PHẢI (Chiếm 1 phần): Thông tin & Tổng hợp tiền */}
              <div className="space-y-6">
                <CheckoutForm
                  register={register}
                  errors={errors}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />

                <CartSummary
                  subTotal={subTotal}
                  discountAmount={totalDiscountAmount}
                  finalTotal={finalTotal}
                  hasSelectedItems={selectedItems.length > 0}
                  onSubmitOrder={handleCheckoutProcess}
                  loadingOrder={loadingOrder}
                />
              </div>

            </div>
          )}
          {cartItems.length === 0 ?
            <RecommendedProducts
              type="empty-cart"
              limit={8}
              onAddToCartSuccess={handleReloadAndScrollTop}
            />
            : <></>
          }
        </main>
      </div>

      {/* ── MODAL ĐƯỢC CẤU HÌNH ĐỘNG CHO CẢ XÓA LẺ & HÀNG LOẠT ── */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title={pendingDeleteIds.length > 1 ? 'Xóa hàng loạt sản phẩm' : 'Gỡ sản phẩm khỏi giỏ hàng'}
        message={pendingDeleteIds.length > 1
          ? `Bạn có chắc chắn muốn xóa hoàn toàn ${pendingDeleteIds.length} sản phẩm đang được tick chọn này ra khỏi giỏ hàng không?`
          : 'Hành động này sẽ xóa hoàn toàn sản phẩm và các mã giảm giá đang áp dụng của đôi giày này khỏi giỏ hàng hiện tại.'}

        // Nếu chỉ xóa 1 sản phẩm -> Tìm thông tin sản phẩm đó truyền vào để hiển thị Ảnh thu nhỏ. Xóa nhiều thì tự ẩn.
        productInfo={pendingDeleteIds.length === 1 ? cartItems.find(item => item.variant_id === pendingDeleteIds[0]) : null}

        onClose={() => {
          setIsDeleteModalOpen(false)
          setPendingDeleteIds([])
        }}
        onConfirm={handleConfirmRemoveItemsSubmit}
      />

      <Footer />
    </div>
  )
}