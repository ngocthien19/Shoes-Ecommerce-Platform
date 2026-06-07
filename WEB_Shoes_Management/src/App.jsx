// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import { ProductsPage } from '~/pages/user/Products/ProductsPage'
import { RegisterPage } from '~/pages/auth/RegisterPage/RegisterPage'
import { VerifyOtpPage } from '~/pages/auth/VerifyOtpPage/VerifyOtpPage'
import { LoginPage } from '~/pages/auth/LoginPage/LoginPage'
import { ForgotPasswordPage } from '~/pages/auth/ForgotPasswordPage/ForgotPasswordPage'
import { ResetPasswordPage } from '~/pages/auth/ResetPasswordPage/ResetPasswordPage'
import { ProfilePage } from '~/pages/user/Profile/ProfilePage'
import { CartPage } from '~/pages/user/Cart/CartPage'
import { OrderSuccessPage } from '~/pages/user/OrderSuccess/OrderSuccessPage'
import { OrderTrackingPage } from '~/pages/user/OrderHistory/OrderTrackingPage'

import { ProtectedRoute, RejectedRoute } from '~/components/common/ProtectedRoute'
import { PageTransition } from '~/components/common/PageTransition'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="app-wrapper">
      <Routes>
        {/* ── CÁC ROUTE CÔNG CỘNG (PUBLIC ROUTES) ── */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/product/:slug" element={<PageTransition><ProductDetailPage /></PageTransition>} />
        <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />


        {/* ── CÁC ROUTE BẮT BUỘC ĐĂNG NHẬP (PROTECTED ROUTES) ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/order-success" element={<PageTransition><OrderSuccessPage /></PageTransition>} />
          <Route path="/orders" element={<PageTransition><OrderTrackingPage /></PageTransition>} />
        </Route>


        {/* ── CÁC ROUTE CHẶN KHI ĐÃ ĐĂNG NHẬP (REJECTED ROUTES) ── */}
        <Route element={<RejectedRoute />}>
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/verify-otp" element={<PageTransition><VerifyOtpPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        </Route>

      </Routes>
    </div>
  )
}

export default App