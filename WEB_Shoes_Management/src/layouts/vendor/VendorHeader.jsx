import { FiBell, FiUser, FiLogOut, FiShoppingBag, FiChevronDown } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getImageUrl } from '~/utils/formatters'
import { logoutSuccess } from '~/redux/user/userSlice'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'

export const VendorHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userInfo)

  const getPageTitle = () => {
    if (location.pathname === '/vendor') return 'Tổng quan kinh doanh'
    if (location.pathname.includes('/vendor/products')) return 'Quản lý kho hàng'
    if (location.pathname.includes('/vendor/orders')) return 'Quản lý đơn hàng'
    if (location.pathname.includes('/vendor/promotions')) return 'Chiến dịch khuyến mãi'
    if (location.pathname.includes('/vendor/reviews')) return 'Đánh giá từ khách hàng'
    if (location.pathname.includes('/vendor/payouts')) return 'Tài chính & Rút tiền'
    if (location.pathname.includes('/vendor/profile')) return 'Hồ sơ cửa hàng'
    return 'Kênh Người Bán'
  }

  const handleLogout = () => {
    dispatch(logoutSuccess())
    navigate('/login')
  }

  return (
    <header className="h-20 bg-gradient-to-r from-header-bg-start to-header-bg-end border-b border-header-border flex items-center justify-between px-8 sticky top-0 z-30 shadow-lg transition-all duration-300 hover:shadow-xl">

      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-brand-primary rounded-full transition-all duration-300 hover:scale-y-110 hover:shadow-[0_0_20px_rgba(233,69,96,0.3)]"></div>
        <h1 className="text-xl font-extrabold text-white tracking-tight transition-all duration-300 hover:translate-x-1">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-6">

        <button className="relative p-2 text-white/80 hover:text-brand-primary transition-all duration-300 hover:bg-white/10 rounded-full cursor-pointer hover:scale-110 hover:rotate-12">
          <FiBell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        </button>

        <div className="w-px h-8 bg-white/20"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer group">
              <img
                src={getImageUrl(user?.avatar, 'https://placehold.co/100x100?text=User')}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-sm group-hover:border-brand-primary group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(233,69,96,0.3)]"
              />
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-[11px] text-white/60 font-medium group-hover:text-white/90 transition-all duration-300">
                  Xin chào,
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white group-hover:text-brand-primary transition-all duration-300">
                    {user?.fullname || 'Ngọc Thiên'}
                  </span>
                  <FiChevronDown
                    size={14}
                    className="text-white/60 group-hover:text-brand-primary transition-all duration-300 group-hover:rotate-180"
                  />
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-lg border-slate-100 p-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.fullname || 'Ngọc Thiên'}</p>
                <p className="text-xs text-slate-500 leading-none">{user?.email || 'thien@example.com'}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-100 my-2" />

            <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-slate-50 py-2.5 transition-all duration-300 hover:translate-x-1">
              <Link to="/vendor/profile-account" className="flex items-center gap-2">
                <FiUser size={16} className="text-slate-500 transition-all duration-300 group-hover:text-brand-primary" />
                <span className="font-semibold text-slate-700">Tài khoản cá nhân</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-slate-50 py-2.5 transition-all duration-300 hover:translate-x-1">
              <Link to="/vendor/profile-store" className="flex items-center gap-2">
                <FiShoppingBag size={16} className="text-slate-500 transition-all duration-300 group-hover:text-brand-primary" />
                <span className="font-semibold text-slate-700">Thông tin cửa hàng</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100 my-2" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-xl hover:bg-red-50 text-red-500 py-2.5 focus:bg-red-50 focus:text-red-600 transition-all duration-300 hover:translate-x-1"
            >
              <div className="flex items-center gap-2 font-bold">
                <FiLogOut size={16} className="transition-all duration-300 group-hover:scale-110" />
                <span>Đăng xuất</span>
              </div>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}