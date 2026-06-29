import { useState, useEffect } from 'react'
import { FiPhone } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { categoryService } from '~/services/user/categoryService'
import { Nav } from '~/layouts/user/Nav'
import { CategoryMenu } from '~/layouts/user/CategoryMenu'
import { UserInfo } from '~/layouts/user/UserInfo'
import { Search } from '~/layouts/user/Search'
import { MobileHeader } from '~/layouts/user/MobileHeader'
import { useSelector } from 'react-redux'
import { vendorStoreApiService } from '~/services/vendor/vendorStoreApiService'
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [expandedMobile, setExpandedMobile] = useState(null)
  const [storeStatus, setStoreStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const user = useSelector((state) => state.user.userInfo)

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(console.error)
  }, [])

  // Kiểm tra trạng thái đăng ký cửa hàng khi user đã đăng nhập
  useEffect(() => {
    const checkStoreStatus = async () => {
      if (!user) {
        setStoreStatus(null)
        return
      }

      setLoadingStatus(true)
      try {
        const result = await vendorStoreApiService.getStoreRegistrationStatus()
        setStoreStatus(result)
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái cửa hàng:', error)
        setStoreStatus(null)
      } finally {
        setLoadingStatus(false)
      }
    }

    checkStoreStatus()
  }, [user])

  // Xử lý khi Submit tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setMobileMenuOpen(false)
    }
  }

  // Render nút Đăng ký / Xem trạng thái
  const renderStoreButton = () => {
    // Nếu chưa đăng nhập
    if (!user) {
      return (
        <Link
          to="/login"
          className="text-gray-600 font-semibold text-sm transition-colors duration-200 hover:text-brand-primary hover:underline"
        >
          Đăng ký Cửa hàng
        </Link>
      )
    }

    // Nếu đang loading
    if (loadingStatus) {
      return (
        <span className="text-gray-400 font-semibold text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          Đang kiểm tra...
        </span>
      )
    }

    // Nếu chưa có thông tin trạng thái
    if (!storeStatus) {
      return (
        <Link
          to="/register-store"
          className="text-gray-600 font-semibold text-sm transition-colors duration-200 hover:text-brand-primary hover:underline"
        >
          Đăng ký Cửa hàng
        </Link>
      )
    }

    // Render theo trạng thái
    switch (storeStatus.status) {
    case 'approved':
      return (
        <Link
          to="/vendor/dashboard"
          className="text-green-600 font-semibold text-sm transition-colors duration-200 hover:text-green-700 flex items-center gap-1.5"
        >
          <FiCheckCircle size={14} />
          <span>Quản lý cửa hàng</span>
        </Link>
      )

    case 'pending':
      return (
        <span className="text-amber-600 font-semibold text-sm flex items-center gap-1.5 cursor-default">
          <FiClock size={14} className="animate-pulse" />
          <span>Đang chờ phê duyệt</span>
        </span>
      )

    case 'rejected':
      return (
        <Link
          to="/register-store"
          className="text-red-600 font-semibold text-sm transition-colors duration-200 hover:text-red-700 flex items-center gap-1.5"
        >
          <FiXCircle size={14} />
          <span>Đăng ký lại</span>
        </Link>
      )

    case 'not_registered':
    default:
      return (
        <Link
          to="/register-store"
          className="text-gray-600 font-semibold text-sm transition-colors duration-200 hover:text-brand-primary hover:underline"
        >
            Đăng ký Cửa hàng
        </Link>
      )
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 w-full">
      <div className="app-container">

        {/* ── Top Section ── */}
        <div className="flex items-center justify-between py-4 gap-4 md:gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl transition-transform duration-300 ease-out hover:scale-110">
              S
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight hidden sm:block">
              ShoesStore
            </span>
          </Link>

          {/* Search */}
          <Search
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
          />

          {/* Right */}
          <UserInfo
            user={user}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </div>

        {/* ── Bottom Section — Desktop ── */}
        <div className="hidden md:flex items-center justify-between py-3 border-t border-gray-100">

          {/* Danh mục dropdown — shadcn NavigationMenu */}
          <CategoryMenu categories={categories} />

          {/* Nav links  */}
          <Nav />

          <div className="flex items-center gap-6">
            {renderStoreButton()}

            <div className="flex items-center gap-2 text-brand-primary font-bold text-base transition-opacity duration-200 hover:opacity-80 cursor-pointer border-l border-gray-200 pl-6">
              <FiPhone size={16} />
              <span>Hotline: 1900 1234</span>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <MobileHeader
          mobileMenuOpen={mobileMenuOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          categories={categories}
          expandedMobile={expandedMobile}
          setExpandedMobile={setExpandedMobile}
          setMobileMenuOpen={setMobileMenuOpen}
          user={user}
        />

      </div>
    </header>
  )
}