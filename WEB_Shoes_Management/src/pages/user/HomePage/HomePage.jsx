import { useEffect, useState } from 'react'
import { productService } from '~/services/user/productService'
import { Header } from '~/layouts/user/Header'
import { HeroSection } from '~/pages/user/HomePage/HeroSection'
import { Footer } from '~/layouts/user/Footer'
import { ProductSection } from '~/components/user/ProductSection'

export const HomePage = () => {
  const [data, setData] = useState({ flashSale: [], topSelling: [], latest: [] })

  useEffect(() => {
    productService.getHomepageProducts().then(res => {
      setData(res)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="app-container px-4">
        <HeroSection />
        <ProductSection
          title="Săn Sale Chớp Nhoáng"
          products={data.flashSale}
          icon="zap"
        />
        <ProductSection
          title="Sản Phẩm Bán Chạy"
          products={data.topSelling}
          icon="trending"
        />
        <ProductSection
          title="Sản Phẩm Mới"
          products={data.latest}
          icon="clock"
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}