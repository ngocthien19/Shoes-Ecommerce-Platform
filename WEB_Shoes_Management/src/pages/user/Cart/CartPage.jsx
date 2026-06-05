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
import { Link } from 'react-router-dom'

import { CartItemList } from './CartItemList'
import { CheckoutForm } from './CheckoutForm'
import { CartSummary } from './CartSummary'
import { ConfirmDeleteModal } from '~/components/common/ConfirmDeleteModal'

export const CartPage = () => {
  const dispatch = useDispatch()
  const userInfo = useSelector((state) => state.user.userInfo)

  const [cartItems, setCartItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const [itemVouchers, setItemVouchers] = useState({})
  const [loadingOrder, setLoadingOrder] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [pendingDeleteVariant, setPendingDeleteVariant] = useState(null)

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

  useEffect(() => {
    fetchCartData()
  }, [])

  const handleRequestRemoveItem = (variantId) => {
    // Tìm đúng object sản phẩm trong giỏ để truyền thông tin sang Modal hiển thị ảnh/tên
    const targetItem = cartItems.find(item => item.variant_id === variantId)
    if (targetItem) {
      setPendingDeleteVariant(targetItem)
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmRemoveItemSubmit = async () => {
    if (!pendingDeleteVariant) return

    try {
      const variantId = pendingDeleteVariant.variant_id
      const res = await cartApiService.removeFromCart(variantId)

      if (res) {
        toast.success('Đã gỡ sản phẩm khỏi giỏ hàng thành công!')
        setSelectedItems(prev => prev.filter(id => id !== variantId))
        setItemVouchers(v => { const copy = { ...v }; delete copy[variantId]; return copy })
        fetchCartData()
      }
    } catch (error) {
      toast.error('Gặp lỗi khi xóa sản phẩm!')
    } finally {
      // Dọn dẹp đóng modal sạch sẽ
      setIsDeleteModalOpen(false)
      setPendingDeleteVariant(null)
    }
  }

  // Xử lý Checkbox chọn hàng lẻ
  const handleToggleSelect = (variantId) => {
    setSelectedItems(prev => {
      const isRemoving = prev.includes(variantId)
      // Nếu bỏ tick chọn checkbox sản phẩm đó, tự động xóa voucher đã áp cho dòng đó đi
      if (isRemoving) {
        setItemVouchers(v => {
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
      setItemVouchers({}) // Clear sạch voucher dòng
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

  const handleRemoveItem = async (variantId) => {
    try {
      const res = await cartApiService.removeFromCart(variantId)
      if (res) {
        toast.success('Đã gỡ sản phẩm khỏi giỏ.')
        setSelectedItems(prev => prev.filter(id => id !== variantId))
        setItemVouchers(v => { const copy = { ...v }; delete copy[variantId]; return copy })
        fetchCartData()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleItemVoucherSelect = (variantId, code, discountValue) => {
    setItemVouchers(prev => ({
      ...prev,
      [variantId]: { code, discountValue }
    }))
    toast.success(`Đã áp mã ${code} thành công cho sản phẩm!`)
  }

  // ── LOGIC CỘNG DỒN TÍNH TOÁN DÒNG TIỀN TỔNG HỢP ──
  const selectedCartObjects = cartItems.filter(item => selectedItems.includes(item.variant_id))

  // 1. Tính tổng tạm tính tiền gốc của những mục được tick chọn checkbox
  const subTotal = selectedCartObjects.reduce((sum, item) => {
    return sum + (Number(item.base_price) * item.cart_quantity)
  }, 0)

  // 2. Tính tổng tiền giảm giá (Bao gồm giảm giá trực tiếp từ sản phẩm Backend + Giảm giá Voucher Shop cộng dồn)
  const totalDiscountAmount = selectedCartObjects.reduce((sum, item) => {
    const itemRowPrice = Number(item.base_price) * item.cart_quantity

    // Phần trăm giảm từ chương trình flash sale/sản phẩm
    const backendPromoPercent = Number(item.discount_percentage || 0)
    const productItemDiscount = itemRowPrice * (backendPromoPercent / 100)

    // Phần trăm giảm từ Voucher của Shop được chọn trong Combobox
    const voucherRowPercent = itemVouchers[item.variant_id]?.discountValue || 0
    const voucherRowDiscount = itemRowPrice * (voucherRowPercent / 100)

    return sum + productItemDiscount + voucherRowDiscount
  }, 0)

  const finalTotal = Math.max(0, subTotal - totalDiscountAmount)

  // XỬ LÝ ĐẶT HÀNG GỬI LÊN ENDPOINT CHUẨN PAYLOAD CỦA BẠN
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
          window.location.href = '/profile'
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
          <h2 className="text-xl font-extrabold text-brand-secondary text-left mb-6 uppercase tracking-tight flex items-center gap-2.5 after:content-[''] after:inline-block after:w-20 after:h-[5px] after:bg-brand-primary/60 after:rounded-full">
            <FiShoppingBag size={24} className="text-brand-primary shrink-0" />
            <span>Giỏ hàng của bạn ({cartItems.length} sản phẩm)</span>
          </h2>

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
                  onRemoveItem={handleRequestRemoveItem}
                  itemVouchers={itemVouchers}
                  onItemVoucherSelect={handleItemVoucherSelect}
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
        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        productInfo={pendingDeleteVariant}
        title="Gỡ sản phẩm khỏi giỏ hàng"
        message="Hành động này sẽ xóa hoàn toàn sản phẩm và các mã giảm giá đang áp dụng của đôi giày này khỏi giỏ hàng hiện tại."
        onClose={() => {
          setIsDeleteModalOpen(false)
          setPendingDeleteVariant(null)
        }}
        onConfirm={handleConfirmRemoveItemSubmit}
      />

      <Footer />
    </div>
  )
}