import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHome, FiPackage, FiStar, FiLogOut
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { logoutSuccess } from '~/redux/user/userSlice'

export const ManagerSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userInfo)

  const menuItems = [
    {
      name: 'Quản lý Cửa hàng',
      path: '/manager/stores',
      icon: <FiHome size={20} />
    },
    {
      name: 'Quản lý Sản phẩm',
      path: '/manager/products',
      icon: <FiPackage size={20} />
    },
    {
      name: 'Quản lý Đánh giá',
      path: '/manager/reviews',
      icon: <FiStar size={20} />
    }
  ]

  const checkIsActive = (path) => {
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    dispatch(logoutSuccess())
    navigate('/login')
  }

  return (
    <aside className="w-74 bg-gradient-to-br from-sidebar-bg-start to-sidebar-bg-end border-r border-sidebar-border flex flex-col h-screen sticky top-0 shadow-lg z-40">
      {/* Logo */}
      <div className="h-20 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <Link to="/manager/stores" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-all duration-300">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-800 tracking-tight leading-tight group-hover:text-blue-600 transition-all duration-300">
              ShoesStore
            </span>
            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">
              Quản trị sàn
            </span>
          </div>
        </Link>
      </div>

      {/* Menu Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {menuItems.map((item, index) => {
          const isActive = checkIsActive(item.path)
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-sidebar-item-active text-blue-600 font-bold'
                  : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-semibold'
              } hover:translate-x-1`}
            >
              <span className="transition-all duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Nút Đăng xuất */}
      <div className="p-4 border-t border-sidebar-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-all duration-300 cursor-pointer group hover:translate-x-1"
        >
          <FiLogOut size={18} className="transition-all duration-300 group-hover:scale-110" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}