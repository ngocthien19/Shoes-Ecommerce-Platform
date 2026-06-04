import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '~/components/ui/dropdown-menu'

import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'


export const UserInfo = ({ user, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
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
  )
}