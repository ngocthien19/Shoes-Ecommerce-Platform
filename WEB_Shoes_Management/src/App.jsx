import { Routes, Route } from 'react-router-dom'
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import { ProductsPage } from '~/pages/user/ProductsPage/ProductsPage'
import { RegisterPage } from '~/pages/auth/RegisterPage/RegisterPage'
import { VerifyOtpPage } from '~/pages/auth/VerifyOtpPage/VerifyOtpPage'
import { LoginPage } from '~/pages/auth/LoginPage/LoginPage'
import { ForgotPasswordPage } from '~/pages/auth/ForgotPasswordPage/ForgotPasswordPage'
import { ResetPasswordPage } from '~/pages/auth/ResetPasswordPage/ResetPasswordPage'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

      </Routes>
    </div>
  )
}

export default App