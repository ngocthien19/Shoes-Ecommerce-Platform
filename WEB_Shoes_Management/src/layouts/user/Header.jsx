import { useState, useEffect } from 'react'
import { FiPhone } from 'react-icons/fi'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { categoryService } from '~/services/user/categoryService'
import { Nav } from '~/layouts/user/Nav'
import { CategoryMenu } from '~/layouts/user/CategoryMenu'
import { UserInfo } from '~/layouts/user/UserInfo'
import { Search } from '~/layouts/user/Search'
import { MobileHeader } from '~/layouts/user/MobileHeader'


export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [expandedMobile, setExpandedMobile] = useState(null)

  // Thêm state cho thanh tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const userInfo = localStorage.getItem('userInfo')
  const user = userInfo ? JSON.parse(userInfo) : null

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(console.error)
  }, [])

  // Xử lý khi Submit tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setMobileMenuOpen(false)
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

          <div className="flex items-center gap-2 text-brand-primary font-bold text-base transition-opacity duration-200 hover:opacity-80 cursor-pointer">
            <FiPhone size={16} />
            <span>Hotline: 1900 1234</span>
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