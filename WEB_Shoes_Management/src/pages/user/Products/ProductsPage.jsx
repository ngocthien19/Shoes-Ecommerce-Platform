import { useState, useEffect } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { BreadCrumb } from '~/components/user/BreadCrumb'
import { FilterSidebar } from './FilterSidebar'
import { Pagination } from '~/components/common/Pagination'
import { ProductCard } from '~/components/user/ProductCard'
import { productService } from '~/services/user/productService'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { FiX, FiZap } from 'react-icons/fi'

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 })
  const [loading, setLoading] = useState(false)

  // KHỞI TẠO STATE TỪ URL (Nếu URL trống thì lấy giá trị mặc định)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categories: searchParams.get('categories') ? searchParams.get('categories').split(',') : [],
    stores: searchParams.get('stores') ? searchParams.get('stores').split(',') : [],
    prices: searchParams.get('prices') ? searchParams.get('prices').split(',') : [],
    ratings: searchParams.get('ratings') ? searchParams.get('ratings').split(',').map(Number) : [],
    sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
    isDiscounted: searchParams.get('isDiscounted') === 'true',
    page: Number(searchParams.get('page')) || 1,
    limit: 9,
    sortBy: searchParams.get('sortBy') || 'latest'
  })

  useEffect(() => {
    // Dịch URL thành Object state chuẩn
    const parsedFilters = {
      search: searchParams.get('search') || '',
      categories: searchParams.get('categories') ? searchParams.get('categories').split(',') : [],
      stores: searchParams.get('stores') ? searchParams.get('stores').split(',') : [],
      prices: searchParams.get('prices') ? searchParams.get('prices').split(',') : [],
      ratings: searchParams.get('ratings') ? searchParams.get('ratings').split(',').map(Number) : [],
      sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
      colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
      isDiscounted: searchParams.get('isDiscounted') === 'true',
      page: Number(searchParams.get('page')) || 1,
      limit: 9,
      sortBy: searchParams.get('sortBy') || 'latest'
    }

    setFilters(prevFilters => {
      if (JSON.stringify(prevFilters) !== JSON.stringify(parsedFilters)) {
        return parsedFilters
      }
      return prevFilters
    })
  }, [location.search])

  // ĐỒNG BỘ STATE LÊN URL MỖI KHI BỘ LỌC THAY ĐỔI
  useEffect(() => {
    const urlParams = {}

    // Chỉ đưa lên URL những tham số nào có chứa dữ liệu (để URL nhìn sạch sẽ, không bị rác)
    if (filters.search) urlParams.search = filters.search
    if (filters.categories.length > 0) urlParams.categories = filters.categories.join(',')
    if (filters.stores.length > 0) urlParams.stores = filters.stores.join(',')
    if (filters.prices.length > 0) urlParams.prices = filters.prices.join(',')
    if (filters.ratings.length > 0) urlParams.ratings = filters.ratings.join(',')
    if (filters.sizes.length > 0) urlParams.sizes = filters.sizes.join(',')
    if (filters.colors.length > 0) urlParams.colors = filters.colors.join(',')
    if (filters.isDiscounted) urlParams.isDiscounted = 'true'

    // Chỉ hiển thị số trang nếu nó khác 1, chỉ hiển thị sắp xếp nếu nó khác mặc định
    if (filters.page > 1) urlParams.page = filters.page
    if (filters.sortBy !== 'latest') urlParams.sortBy = filters.sortBy

    // Cập nhật URL
    setSearchParams(urlParams)
  }, [filters, setSearchParams])


  // GỌI API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // ĐÓNG GÓI PARAMS GỬI XUỐNG BACKEND
        const params = {
          ...filters,
          categories: filters.categories.join(','),
          stores: filters.stores.join(','),
          ratings: filters.ratings.join(','),
          sizes: filters.sizes.join(','),
          colors: filters.colors.join(','),
          prices: filters.prices.join(',')
        }

        const response = await productService.searchAndFilterProducts(params)
        setProducts(response.products)
        setPagination(response.pagination)
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters])

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage })
  }

  // --- CÁC HÀM XỬ LÝ NHÃN (BADGE) HIỂN THỊ TRẠNG THÁI LỌC ---
  const handleRemoveArrayFilter = (field, value) => {
    setFilters({ ...filters, [field]: filters[field].filter(item => item !== value), page: 1 })
  }

  const handleClearAllFilters = () => {
    setFilters({
      search: '', categories: [], stores: [], prices: [],
      ratings: [], sizes: [], colors: [], isDiscounted: false, page: 1, limit: 9, sortBy: 'latest'
    })
  }

  const hasActiveFilters = filters.categories.length > 0 || filters.sizes.length > 0 ||
                           filters.colors.length > 0 || filters.ratings.length > 0 ||
                           filters.prices.length > 0 || filters.isDiscounted

  const priceLabels = {
    '0-1000000': 'Dưới 1.000.000đ', '1000000-3000000': '1tr - 3tr',
    '3000000-5000000': '3tr - 5tr', '5000000-max': 'Trên 5.000.000đ'
  }

  return (
    <div className="bg-brand-bg min-h-screen flex flex-col">
      <Header />

      <main className="app-container py-8 flex-1">
        <BreadCrumb items={[{ label: 'Trang chủ', link: '/' }, { label: 'Tất cả sản phẩm', link: '/products' }]} />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Cột trái: Sidebar Lọc */}
          <div className="w-full lg:w-1/4 shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Cột phải: Content chính */}
          <div className="flex-1">

            {/* Thanh Top bar (Sắp xếp & Active Filters) */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div className="text-gray-600 font-medium mb-3 sm:mb-0">
                  <span className="font-bold text-gray-900 text-xl mr-1.5">{pagination.totalItems}</span>
                  Sản phẩm tìm thấy
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">Sắp xếp theo:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary bg-gray-50 cursor-pointer transition-colors hover:border-brand-primary"
                  >
                    <option value="latest">Mới nhất</option>
                    <option value="sold_desc">Bán chạy nhất</option>
                    <option value="views_desc">Xem nhiều nhất</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao xuống Thấp</option>
                    <option value="rating_desc">Đánh giá cao nhất</option>
                    <option value="name_asc">Tên: A - Z</option>
                  </select>
                </div>
              </div>

              {/* KHU VỰC HIỂN THỊ BADGE LỌC */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm">
                  <span className="text-gray-500 mr-2">Đang lọc:</span>

                  {filters.categories.map(cat => (
                    <span key={cat} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                      Danh mục: {cat} <FiX className="cursor-pointer hover:text-red-600 hover:scale-110 transition-transform" onClick={() => handleRemoveArrayFilter('categories', cat)} />
                    </span>
                  ))}

                  {filters.prices.map(price => (
                    <span key={price} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
      Giá: {priceLabels[price]} <FiX className="cursor-pointer hover:text-red-600 hover:scale-110 transition-transform" onClick={() => handleRemoveArrayFilter('prices', price)} />
                    </span>
                  ))}

                  {filters.sizes.map(size => (
                    <span key={size} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                      Size {size} <FiX className="cursor-pointer hover:text-red-600 hover:scale-110 transition-transform" onClick={() => handleRemoveArrayFilter('sizes', size)} />
                    </span>
                  ))}

                  {filters.colors.map(color => (
                    <span key={color} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium capitalize">
                      Màu {color} <FiX className="cursor-pointer hover:text-red-600 hover:scale-110 transition-transform" onClick={() => handleRemoveArrayFilter('colors', color)} />
                    </span>
                  ))}

                  {filters.ratings.map(rating => (
                    <span key={rating} className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                      Từ {rating} sao <FiX className="cursor-pointer hover:text-red-600 hover:scale-110 transition-transform" onClick={() => handleRemoveArrayFilter('ratings', rating)} />
                    </span>
                  ))}

                  {filters.isDiscounted && (
                    <span className="bg-[#e94560]/10 text-brand-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                      Đang giảm giá <FiZap /><FiX className="cursor-pointer hover:text-red-600 hover:scale-110 transition-transform" onClick={() => setFilters({ ...filters, isDiscounted: false, page: 1 })} />
                    </span>
                  )}

                  <button
                    onClick={handleClearAllFilters}
                    className="cursor-pointer text-gray-500 hover:text-brand-primary underline ml-2 font-medium transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            {/* Grid Sản phẩm */}
            {loading ? (
              <div className="flex justify-center items-center h-64 text-brand-primary font-semibold text-lg">Đang tải dữ liệu...</div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} sortBy={filters.sortBy} />
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center text-gray-500 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">👟</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm!</h3>
                <p>Thử bỏ bớt một vài bộ lọc hoặc tìm kiếm bằng từ khóa khác xem sao nhé.</p>
                <button
                  onClick={handleClearAllFilters}
                  className="cursor-pointer mt-6 px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}