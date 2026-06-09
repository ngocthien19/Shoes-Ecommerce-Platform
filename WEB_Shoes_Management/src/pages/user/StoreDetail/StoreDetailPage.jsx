import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { StoreProfileHeader } from './StoreProfileHeader'
import { StoreProductList } from './StoreProductList'
import { StoreReview } from './StoreReview'
import { storeService } from '~/services/user/storeService'
import { toast } from 'react-toastify'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

export const StoreDetailPage = () => {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Hàm tải thông tin đồng thời từ 3 API
  const fetchStoreData = async (page = 1) => {
    try {
      setLoading(true)
      const [storeDetail, productsData, reviewsData] = await Promise.all([
        storeService.getStoreDetail(id),
        storeService.getStoreProducts(id, page, 12),
        storeService.getStoreReviews(id)
      ])

      setStore(storeDetail)
      setProducts(productsData.products)
      setPagination(productsData.pagination)
      setReviews(reviewsData)
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  const listVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 flex-1 w-full">
        <AnimatePresence mode="wait">
          {loading && !store ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="w-full animate-pulse"
            >
              <div className="h-64 bg-gray-200 rounded-3xl mb-8"></div>
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
            </motion.div>
          ) : (
            store && (
              <motion.div
                key="store-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="w-full flex flex-col"
              >
                <motion.div variants={headerVariants}>
                  <StoreProfileHeader store={store} />
                </motion.div>

                <motion.div variants={listVariants} className="mt-8">
                  <Tabs defaultValue="products" className="w-full">
                    <div className="flex justify-center mb-6">
                      <TabsList className="bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm inline-flex h-auto">
                        <TabsTrigger
                          value="products"
                          className="rounded-xl px-8 py-3 text-sm font-bold data-[state=active]:bg-brand-primary data-[state=active]:text-white transition-all duration-300"
                        >
                          Sản phẩm ({pagination?.total || 0})
                        </TabsTrigger>
                        <TabsTrigger
                          value="reviews"
                          className="rounded-xl px-8 py-3 text-sm font-bold data-[state=active]:bg-brand-primary data-[state=active]:text-white transition-all duration-300"
                        >
                          Đánh giá ({reviews.length})
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="products" className="mt-0 outline-none">
                      <StoreProductList
                        products={products}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                      />
                    </TabsContent>

                    {/* Nội dung Tab Đánh Giá */}
                    <TabsContent value="reviews" className="mt-0 outline-none">
                      <StoreReview reviews={reviews} />
                    </TabsContent>
                  </Tabs>

                </motion.div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}