import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHome, FiPackage, FiStar, FiLogOut, FiChevronDown,
  FiUsers, FiCheckCircle, FiAlertCircle, FiClock
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { logoutSuccess } from '~/redux/user/userSlice'

export const ManagerSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userInfo)

  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }))
  }

  const menuItems = [
    {
      name: 'Quản lý Cửa hàng',
      path: '/manager/stores',
      icon: <FiHome size={20} />,
      exact: false
    },
    {
      name: 'Quản lý Sản phẩm',
      icon: <FiPackage size={20} />,
      isSubmenu: true,
      submenuKey: 'products',
      children: [
        {
          name: 'Chờ duyệt',
          path: '/manager/products/pending',
          icon: <FiClock size={16} />,
          badge: 'pending'
        },
        {
          name: 'Chờ duyệt lại',
          path: '/manager/products/reapproval',
          icon: <FiAlertCircle size={16} />,
          badge: 'reapproval'
        },
        {
          name: 'Đã duyệt',
          path: '/manager/products/approved',
          icon: <FiCheckCircle size={16} />,
          badge: 'approved'
        },
        {
          name: 'Bị từ chối',
          path: '/manager/products/rejected',
          icon: <FiAlertCircle size={16} />,
          badge: 'rejected'
        },
        {
          name: 'Đã khóa',
          path: '/manager/products/banned',
          icon: <FiAlertCircle size={16} />,
          badge: 'banned'
        }
      ]
    },
    {
      name: 'Quản lý Review',
      icon: <FiStar size={20} />,
      isSubmenu: true,
      submenuKey: 'reviews',
      children: [
        {
          name: 'Báo cáo đánh giá',
          path: '/manager/reviews/reported',
          icon: <FiAlertCircle size={16} />,
          badge: 'reported'
        },
        {
          name: 'Yêu cầu mở lại',
          path: '/manager/reviews/reopen-requests',
          icon: <FiClock size={16} />,
          badge: 'reopen'
        }
      ]
    }
  ]

  const checkIsActive = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    dispatch(logoutSuccess())
    navigate('/login')
  }

  const getBadgeColor = (type) => {
    switch (type) {
    case 'pending':
      return 'bg-amber-500'
    case 'reapproval':
      return 'bg-orange-500'
    case 'approved':
      return 'bg-green-500'
    case 'rejected':
      return 'bg-red-500'
    case 'banned':
      return 'bg-gray-500'
    case 'reported':
      return 'bg-red-500'
    case 'reopen':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
    }
  }

  return (
    <aside className="w-74 bg-gradient-to-br from-sidebar-bg-start to-sidebar-bg-end border-r border-sidebar-border flex flex-col h-screen sticky top-0 shadow-lg z-40">
      {/* Logo */}
      <div className="h-20 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <Link to="/manager/dashboard" className="flex items-center gap-2.5 group">
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
          if (item.isSubmenu) {
            const isOpen = openMenus[item.submenuKey] || false
            const isAnyChildActive = item.children.some(child => checkIsActive(child.path))

            return (
              <div key={index} className="flex flex-col">
                <button
                  onClick={() => toggleMenu(item.submenuKey)}
                  className={`cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    isAnyChildActive
                      ? 'bg-sidebar-item-active text-blue-600 font-bold'
                      : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-semibold'
                  } hover:translate-x-1 group`}
                >
                  <div className="flex items-center gap-3">
                    <span className="transition-all duration-300 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <FiChevronDown size={16} />
                  </motion.div>
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1 mt-1 ml-4 pl-4 border-l-2 border-sidebar-border">
                      {item.children.map((child, cIdx) => {
                        const isChildActive = checkIsActive(child.path, child.exact)
                        return (
                          <Link
                            key={cIdx}
                            to={child.path}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 text-sm group ${
                              isChildActive
                                ? 'bg-sidebar-item-active text-blue-600 font-bold'
                                : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-medium'
                            } hover:translate-x-1`}
                          >
                            {child.icon && (
                              <span className="transition-all duration-300 group-hover:scale-110">
                                {child.icon}
                              </span>
                            )}
                            <span className="flex-1">{child.name}</span>
                            {child.badge && (
                              <span className={`w-2 h-2 rounded-full ${getBadgeColor(child.badge)} animate-pulse`} />
                            )}
                            {isChildActive && (
                              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )
          }

          const isActive = checkIsActive(item.path, item.exact)
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

      {/* User Info & Đăng xuất */}
      <div className="p-4 border-t border-sidebar-border shrink-0 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUsers size={14} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-700 truncate">{user?.fullname || 'Điều hành viên'}</p>
            <p className="text-[10px] text-gray-400 truncate">Quản trị sàn</p>
          </div>
        </div>

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