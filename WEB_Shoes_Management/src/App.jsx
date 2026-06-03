import { Routes, Route } from 'react-router-dom'
import { HomePage } from '~/pages/user/HomePage/HomePage'
import { ProductDetailPage } from '~/pages/user/ProductDetail/ProductDetailPage'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
      </Routes>
    </div>
  )
}

export default App