<<<<<<< Updated upstream
import { Routes, Route } from 'react-router-dom'
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
=======
<<<<<<< Updated upstream
const App = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">

      {/* Thẻ Card áp dụng shadow-custom đã định nghĩa ở index.css */}
      <div className="bg-white p-8 rounded-2xl shadow-custom text-center max-w-sm space-y-4">

        {/* text-brand-primary: màu chữ #e94560 */}
        <h1 className="text-3xl font-bold text-brand-primary">
          Shoes Store 👟
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed">
          Môi trường CSS khởi tạo toàn cục (Reset CSS, Poppins Font, Custom BoxShadow) đã hoạt động hoàn hảo trên Tailwind v4!
        </p>

        <div className="pt-2">
          {/* Áp dụng màu nền chính cho button */}
          <button className="px-5 py-2.5 bg-brand-primary text-white font-medium rounded-xl hover:opacity-90 transition-all duration-200 cursor-pointer">
            Xem Sản Phẩm
          </button>
        </div>

      </div>

=======
import { Routes, Route } from 'react-router-dom'
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import { ProductsPage } from '~/pages/user/ProductsPage/ProductsPage'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
>>>>>>> Stashed changes
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
<<<<<<< Updated upstream
      </Routes>
=======
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
>>>>>>> Stashed changes
>>>>>>> Stashed changes
    </div>
  )
}

export default App