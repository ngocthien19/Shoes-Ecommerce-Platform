import { useState, useEffect } from 'react'
<<<<<<< Updated upstream
import { FiSearch, FiShoppingCart, FiChevronDown,
  FiPhone, FiGrid, FiMenu, FiX, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { categoryService } from '~/services/user/categoryService'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from '~/components/ui/navigation-menu'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '~/components/ui/dropdown-menu'
=======
import { FiPhone } from 'react-icons/fi'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { categoryService } from '~/services/user/categoryService'
import { Nav } from '~/layouts/user/Nav'
import { CategoryMenu } from '~/layouts/user/CategoryMenu'
import { UserInfo } from '~/layouts/user/UserInfo'
import { Search } from '~/layouts/user/Search'
import { MobileHeader } from '~/layouts/user/MobileHeader'

>>>>>>> Stashed changes

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [expandedMobile, setExpandedMobile] = useState(null)

<<<<<<< Updated upstream
=======
  // Thêm state cho thanh tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

>>>>>>> Stashed changes
  const userInfo = localStorage.getItem('userInfo')
  const user = userInfo ? JSON.parse(userInfo) : null

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(console.error)
  }, [])

<<<<<<< Updated upstream
=======
  // Xử lý khi Submit tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setMobileMenuOpen(false)
    }
  }

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <div className="flex-1 max-w-xl relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-12
                         focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-[#e94560]/20
                         transition-all duration-300 ease-out text-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-brand-primary rounded-full
                               flex items-center justify-center text-white
                               transition-all duration-200 ease-out hover:scale-110 hover:bg-[#c73652] cursor-pointer">
              <FiSearch size={14} />
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer group outline-none">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden transition-all duration-300 ease-out group-hover:border-brand-primary" />
                    <div className="text-sm hidden lg:block">
                      <p className="text-gray-400 text-[11px] leading-none">Xin chào,</p>
                      <p className="font-bold text-gray-800 transition-colors duration-200 group-hover:text-brand-primary">{user.fullname}</p>
                    </div>
                    <FiChevronDown size={14} className="text-gray-400 hidden lg:block transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-2">
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer gap-2">Tài khoản</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2">Đơn hàng</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer gap-2 text-red-600" onClick={() => { localStorage.clear(); window.location.reload() }}>
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="items-center gap-2 hidden sm:flex">
                <Link to="/login" className="text-base font-semibold text-gray-700 px-5 py-2.5 rounded-full border border-gray-200 transition-all hover:border-brand-primary hover:text-brand-primary">Đăng nhập</Link>
                <Link to="/register" className="text-base font-semibold text-white px-5 py-2.5 rounded-full bg-brand-primary transition-all hover:bg-[#c73652]">Đăng ký</Link>
              </div>
            )}

            <button className="md:hidden text-gray-700 hover:text-brand-primary cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
=======
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
>>>>>>> Stashed changes
        </div>

        {/* ── Bottom Section — Desktop ── */}
        <div className="hidden md:flex items-center justify-between py-3 border-t border-gray-100">

          {/* Danh mục dropdown — shadcn NavigationMenu */}
<<<<<<< Updated upstream
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg font-semibold text-base text-gray-700
                             transition-all duration-300 ease-out hover:bg-gray-100 data-[state=open]:bg-gray-100
                             data-[state=open]:text-brand-primary h-auto cursor-pointer"
                >
                  <FiGrid size={16} />
                  Danh mục sản phẩm
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="w-[560px] p-4 grid grid-cols-2 gap-1">
                    {categories.length === 0 ? (
                      <p className="col-span-2 text-sm text-gray-400 text-center py-4">Đang tải...</p>
                    ) : (
                      categories.map(cat => (
                        <div key={cat.id}>
                          {/* Parent category */}
                          <Link
                            to={`/category/${cat.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg
                                       font-semibold text-sm text-gray-800
                                       hover:bg-[#e94560]/5 hover:text-brand-primary
                                       transition-all duration-200 ease-out group"
                          >
                            <span>{cat.name}</span>
                            {cat.children?.length > 0 && (
                              <FiChevronRight size={14} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                            )}
                          </Link>

                          {/* Children */}
                          {cat.children?.length > 0 && (
                            <div className="ml-3 border-l border-gray-100 pl-2 mb-1">
                              {cat.children.map(child => (
                                <Link
                                  key={child.id}
                                  to={`/category/${child.slug}`}
                                  className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-500
                                             hover:bg-[#e94560]/5 hover:text-brand-primary
                                             transition-all duration-200 ease-out"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Nav links */}
          <nav className="flex items-center gap-8 text-base font-semibold text-gray-600">
            {[
              { name: 'Trang chủ', path: '/' },
              { name: 'Sản phẩm', path: '/products' },
              { name: 'Đơn hàng', path: '/orders' }
            ].map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative py-2 transition-colors duration-300 ease-out
        ${index === 0 ? 'text-brand-primary' : 'hover:text-brand-primary'}
        after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-brand-primary
        after:transition-all after:duration-300 after:ease-out
        ${index === 0 ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-brand-primary font-bold text-base transition-opacity duration-200 hover:opacity-80">
=======
          <CategoryMenu categories={categories} />

          {/* Nav links  */}
          <Nav />

          <div className="flex items-center gap-2 text-brand-primary font-bold text-base transition-opacity duration-200 hover:opacity-80 cursor-pointer">
>>>>>>> Stashed changes
            <FiPhone size={16} />
            <span>Hotline: 1900 1234</span>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
<<<<<<< Updated upstream
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out
          ${mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {/* Mobile Search */}
          <div className="pt-3 pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-12
                           focus:outline-none focus:border-brand-primary text-sm transition-all duration-300"
              />
              <FiSearch className="absolute right-4 top-3 text-gray-400" size={16} />
            </div>
          </div>

          <nav className="flex flex-col border-t border-gray-100 py-2">
            {/* Mobile categories — accordion */}
            <div className="border-b border-gray-50">
              <button
                className="w-full flex items-center justify-between py-3 px-1 font-semibold text-sm text-gray-700"
                onClick={() => setExpandedMobile(expandedMobile === 'categories' ? null : 'categories')}
              >
                <span className="flex items-center gap-2"><FiGrid size={14} /> Danh mục sản phẩm</span>
                <FiChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-300 ${expandedMobile === 'categories' ? 'rotate-180' : ''}`}
                />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-out
                ${expandedMobile === 'categories' ? 'max-h-[400px]' : 'max-h-0'}`}
              >
                {categories.map(cat => (
                  <div key={cat.id} className="pl-4">
                    <Link to={`/category/${cat.slug}`}
                      className="flex items-center py-2.5 text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors">
                      {cat.name}
                    </Link>
                    {cat.children?.map(child => (
                      <Link key={child.id} to={`/category/${child.slug}`}
                        className="flex items-center py-2 pl-3 text-sm text-gray-500 hover:text-brand-primary transition-colors border-l border-gray-100">
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {
              [
                { name: 'Trang chủ', path: '/' },
                { name: 'Sản phẩm', path: '/products' },
                { name: 'Đơn hàng', path: '/orders' }
              ].map((item, index) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`py-3 px-1 font-semibold text-sm border-b border-gray-50
        transition-colors duration-200 
        ${index === 0 ? 'text-brand-primary' : 'text-gray-700 hover:text-brand-primary'}`}
                >
                  {item.name}
                </Link>
              ))
            }

            {user ? (
              <div className="flex items-center justify-between pt-4 pb-2">
                <span className="text-sm font-semibold text-gray-700">Xin chào, {user.fullname}</span>
                <div className="relative cursor-pointer">
                  <FiShoppingCart size={22} className="text-gray-700" />
                  <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 pt-4 pb-2">
                <button className="flex-1 text-sm font-semibold text-brand-primary py-2.5 rounded-full border border-brand-primary transition-all duration-300 hover:bg-[#e94560]/5 active:scale-95">
                  Đăng nhập
                </button>
                <button className="flex-1 text-sm font-semibold text-white py-2.5 rounded-full bg-brand-primary transition-all duration-300 hover:bg-[#c73652] active:scale-95">
                  Đăng ký
                </button>
              </div>
            )}
          </nav>
        </div>
=======
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
>>>>>>> Stashed changes

      </div>
    </header>
  )
}