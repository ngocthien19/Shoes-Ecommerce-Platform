import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { StoreProfileHeader } from './StoreProfileHeader'
import { StoreProductList } from './StoreProductList'
import { storeService } from '~/services/user/storeService'
import { toast } from 'react-toastify'

export const StoreDetailPage = () => {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hàm tải thông tin
  const fetchStoreData = async (page = 1) => {
    try {
      setLoading(true)
      const [storeDetail, productsData] = await Promise.all([
        storeService.getStoreDetail(id),
        storeService.getStoreProducts(id, page, 12)
      ])

      setStore(storeDetail)
      setProducts(productsData.products)
      setPagination(productsData.pagination)
    } catch (error) {
      toast.error('Không tìm thấy thông tin cửa hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStoreData(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const handlePageChange = (newPage) => {
    fetchStoreData(newPage)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  // Khung xương Loading (Skeleton)
  if (loading && !store) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full animate-pulse">
          <div className="h-64 bg-gray-200 rounded-3xl mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 flex-1 w-full transition-all duration-300">
        {store && (
          <>
            <StoreProfileHeader store={store} />
            <StoreProductList
              products={products}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}