import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { ProductGallery } from '~/pages/user/ProductDetail/ProductGallery'
import { ProductInfo } from '~/pages/user/ProductDetail/ProductInfo'
import { StoreInfo } from '~/pages/user/ProductDetail/StoreInfo'
import { RelatedProducts } from '~/pages/user/ProductDetail/RelatedProducts'
import { ProductReview } from '~/pages/user/ProductDetail/ProductReview'
import { productService } from '~/services/user/productService'
import { scrollToTop } from '~/utils/formatters'
import { BreadCrumb } from '~/components/user/BreadCrumb'

export const ProductDetailPage = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [storeId, setStoreId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      scrollToTop()

      // Gọi API để lấy chi tiết sản phẩm
      const productData = await productService.getProductDetail(slug)
      setProduct(productData)
      setStoreId(productData.store_id)
      setLoading(false)
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) return <div>Sản phẩm không tồn tại</div>

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Header />

      <main className="app-container py-8 flex-1">
        {/* Breadcrumb */}
        <BreadCrumb
          items={[
            {
              label: 'Trang chủ',
              link: '/'
            },
            {
              label: product?.category_name || 'Danh mục',
              link: `/products?categories=${product?.category_slug}`
            },
            {
              label: product?.name || 'Chi tiết',
              link: null
            }
          ]}
        />

        {/* Khối nội dung chính */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cột trái: Ảnh */}
            <div className="w-full">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Cột phải: Thông tin */}
            <div className="w-full">
              <ProductInfo product={product} />
            </div>
          </div>
        </div>

        {/* Thông tin cửa hàng */}
        <StoreInfo storeId={storeId} />

        {/* Đánh giá sản phẩm */}
        <ProductReview product={product} />

        {/* Sản phẩm liên quan */}
        <RelatedProducts products={product.relatedProducts} />
      </main>

      <Footer />
    </div>
  )
}