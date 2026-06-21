import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
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
import { usePageTitle } from '~/hooks/usePageTitle'

export const CartPage = () => {
  usePageTitle('Giỏ hàng', 'Xem và quản lý giỏ hàng của bạn tại Shoes Platform')
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
      const res = await cartApiService.removeFromCart(pendingDeleteIds)

      if (res) {
        toast.success(pendingDeleteIds.length > 1 ? 'Đã xóa tất cả sản phẩm thành công!' : 'Đã gỡ sản phẩm khỏi giỏ.')

        setSelectedItems(prev => prev.filter(id => !pendingDeleteIds.includes(id)))

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
    const oldItem = cartItems.find(item => item.variant_id === variantId)
    const oldQty = oldItem?.cart_quantity || 1

    setCartItems(prev =>
      prev.map(item =>
        item.variant_id === variantId
          ? { ...item, cart_quantity: newQty }
          : item
      )
    )

    try {
      await cartApiService.updateQuantity(variantId, newQty)
      // fetchCartData()
    } catch (error) {
      setCartItems(prev =>
        prev.map(item =>
          item.variant_id === variantId
            ? { ...item, cart_quantity: oldQty }
            : item
        )
      )
      toast.error(error.response?.data?.message || 'Lỗi cập nhật số lượng!')
    }
  }

  const handleStoreVoucherSelect = (storeId, code, discountValue) => {
    setStoreVouchers(prev => ({
      ...prev,
      [storeId]: { code, discountValue }
    }))
  }

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

    const storeDiscounts = {}

    selectedCartObjects.forEach(item => {
      const storeId = item.store_id

      if (!storeDiscounts[storeId]) {
        storeDiscounts[storeId] = {
          amount: 0,
          code: storeVouchers[storeId]?.code || null
        }
      }

      const itemRowPrice = Number(item.base_price) * item.cart_quantity
      const backendPromoPercent = Number(item.discount_percentage || 0)
      const productItemDiscount = itemRowPrice * (backendPromoPercent / 100)

      const voucherRowPercent = storeVouchers[storeId]?.discountValue || 0
      const voucherRowDiscount = itemRowPrice * (voucherRowPercent / 100)

      storeDiscounts[storeId].amount += (productItemDiscount + voucherRowDiscount)
    })

    const orderPayload = {
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      shippingAddress: formData.shippingAddress,
      discountAmount: totalDiscountAmount,
      paymentMethod: paymentMethod,
      storeDiscounts: storeDiscounts
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const leftColumnVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const rightColumnVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 15 } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">

      <div className="py-8 w-full flex-1 flex flex-col">
        <main className="app-container flex-1">

          {/* ── Header Giỏ hàng ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex justify-between items-center mb-6"
          >
            <h2 className="text-xl font-extrabold text-brand-secondary uppercase tracking-tight flex items-center gap-2.5 after:content-[''] after:inline-block after:w-20 after:h-[5px] after:bg-brand-primary/60 after:rounded-full">
              <FiShoppingBag size={24} className="text-brand-primary shrink-0" />
              <span>Giỏ hàng của bạn ({cartItems.length} sản phẩm)</span>
            </h2>
          </motion.div>

          <AnimatePresence mode="wait">
            {cartItems.length === 0 ? (
              <motion.div
                key="empty-cart"
                variants={emptyStateVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm max-w-xl mx-auto my-8"
              >
                <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <FiShoppingBag size={32} />
                </div>

                <h3 className="text-base font-bold text-gray-800 mb-1">Giỏ hàng của bạn đang trống</h3>
                <p className="text-xs text-gray-400 italic max-w-xs mx-auto mb-6">
                  Có vẻ như bạn chưa thêm bất kỳ đôi giày nào vào giỏ hàng của mình.
                </p>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-brand-primary hover:bg-[#c73652] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Mua sản phẩm ngay</span>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="populated-cart"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
              >
                <motion.div variants={leftColumnVariants} className="lg:col-span-2">
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
                </motion.div>

                <motion.div variants={rightColumnVariants} className="space-y-6">
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sản phẩm gợi ý khi giỏ hàng trống */}
          {cartItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <RecommendedProducts
                type="empty-cart"
                limit={8}
                onAddToCartSuccess={handleReloadAndScrollTop}
              />
            </motion.div>
          )}

        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title={pendingDeleteIds.length > 1 ? 'Xóa hàng loạt sản phẩm' : 'Gỡ sản phẩm khỏi giỏ hàng'}
        message={pendingDeleteIds.length > 1
          ? `Bạn có chắc chắn muốn xóa hoàn toàn ${pendingDeleteIds.length} sản phẩm đang được tick chọn này ra khỏi giỏ hàng không?`
          : 'Hành động này sẽ xóa hoàn toàn sản phẩm và các mã giảm giá đang áp dụng của đôi giày này khỏi giỏ hàng hiện tại.'}
        productInfo={pendingDeleteIds.length === 1 ? cartItems.find(item => item.variant_id === pendingDeleteIds[0]) : null}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setPendingDeleteIds([])
        }}
        onConfirm={handleConfirmRemoveItemsSubmit}
      />
    </div>
  )
}