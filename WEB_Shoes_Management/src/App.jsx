import { Routes, Route } from 'react-router-dom'
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import { ProductsPage } from '~/pages/user/ProductsPage/ProductsPage'
import { RegisterPage } from '~/pages/auth/RegisterPage/RegisterPage'
import { VerifyOtpPage } from '~/pages/auth/VerifyOtpPage/VerifyOtpPage'
import { LoginPage } from '~/pages/auth/LoginPage/LoginPage'
import { ForgotPasswordPage } from '~/pages/auth/ForgotPasswordPage/ForgotPasswordPage'
import { ResetPasswordPage } from '~/pages/auth/ResetPasswordPage/ResetPasswordPage'
import { ProfilePage } from '~/pages/user/ProfilePage/ProfilePage'

import { ProtectedRoute, RejectedRoute } from '~/components/common/ProtectedRoute'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="app-wrapper">
      <Routes>
        {/* ── CÁC ROUTE CÔNG CỘNG (PUBLIC ROUTES) ── */}
        {/* Ai cũng có thể xem được, đăng nhập hay chưa đều okee */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />


        {/* ── CÁC ROUTE BẮT BUỘC ĐĂNG NHẬP (PROTECTED ROUTES) ── */}
        {/* Chỉ những tài khoản đã đăng nhập thành công mới được vào xem */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          {/* Bạn có thể dễ dàng nhét thêm trang /checkout, /order-history... vào đây sau này */}
        </Route>


        {/* ── CÁC ROUTE CHẶN KHI ĐÃ ĐĂNG NHẬP (REJECTED ROUTES) ── */}
        {/* Đăng nhập rồi thì KHÔNG cho phép quay lại xem các trang form này nữa */}
        <Route element={<RejectedRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

      </Routes>
    </div>
  )
}

export default App