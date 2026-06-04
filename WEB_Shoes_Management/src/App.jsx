import { Routes, Route } from 'react-router-dom'
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import { ProductsPage } from '~/pages/user/ProductsPage/ProductsPage'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </div>
  )
}

export default App