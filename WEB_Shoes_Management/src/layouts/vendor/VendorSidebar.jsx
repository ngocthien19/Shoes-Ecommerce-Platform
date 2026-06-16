import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPieChart, FiBox, FiHeart, FiShoppingCart,
  FiTag, FiStar, FiCreditCard, FiLogOut, FiChevronDown, FiList,
  FiMessageCircle, FiAlertCircle
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { logoutSuccess } from '~/redux/user/userSlice'
import { chatApiService } from '~/services/chat/chatApiService'

export const VendorSidebar = ({ isBanned = false }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const currentUser = useSelector((state) => state.user.userInfo)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  // Lấy tổng số tin nhắn chưa đọc từ API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return

    try {
      const conversations = await chatApiService.getConversationsList()
      const totalUnread = conversations.reduce((total, conv) => {
        return total + (conv.unread_count || 0)
      }, 0)

      setUnreadCount(prev => {
        if (prev !== totalUnread) {
          console.log(`Cập nhật badge: ${prev} -> ${totalUnread}`)
        }
        return totalUnread
      })
    } catch (error) {
      console.error('Lỗi lấy số tin nhắn chưa đọc:', error)
    }
  }, [isAuthenticated, currentUser])

  // Lấy số lượng chưa đọc khi component mount
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUnreadCount()
    }
  }, [isAuthenticated, currentUser, fetchUnreadCount])

  // Lắng nghe sự kiện real-time từ chat
  useEffect(() => {
    const handleNewChatMessage = () => {
      fetchUnreadCount()
    }

    window.addEventListener('newChatMessage', handleNewChatMessage)

    return () => {
      window.removeEventListener('newChatMessage', handleNewChatMessage)
    }
  }, [fetchUnreadCount])

  // Lắng nghe sự kiện đã đọc tin nhắn
  useEffect(() => {
    const handleMessagesRead = () => {
      fetchUnreadCount()
    }

    window.addEventListener('messagesRead', handleMessagesRead)

    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead)
    }
  }, [fetchUnreadCount])

  // Cập nhật badge khi focus lại tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab được focus, cập nhật badge...')
        fetchUnreadCount()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUnreadCount])

  const handleLogout = () => {
    dispatch(logoutSuccess())
    navigate('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: <FiPieChart size={20} />, exact: true },
    {
      name: 'Quản lý sản phẩm',
      icon: <FiBox size={20} />,
      isSubmenu: true,
      isOpen: isProductMenuOpen,
      setIsOpen: setIsProductMenuOpen,
      children: [
        { name: 'Danh sách sản phẩm', path: '/vendor/products', icon: <FiList size={16} /> },
        { name: 'Sản phẩm yêu thích', path: '/vendor/favorites', icon: <FiHeart size={16} /> }
      ]
    },
    { name: 'Quản lý đơn hàng', path: '/vendor/orders', icon: <FiShoppingCart size={20} /> },
    { name: 'Chương trình Khuyến mãi', path: '/vendor/promotions', icon: <FiTag size={20} /> },
    { name: 'Quản lý Đánh giá', path: '/vendor/reviews', icon: <FiStar size={20} /> },
    { name: 'Tài chính & Rút tiền', path: '/vendor/payouts', icon: <FiCreditCard size={20} /> },
    {
      name: 'Tin nhắn',
      path: '/vendor/chat',
      icon: <FiMessageCircle size={20} />,
      badge: unreadCount
    }
  ]

  // Nếu bị khóa
  if (isBanned) {
    menuItems.push({
      name: 'Cứu xét cửa hàng',
      path: '/vendor/appeals',
      icon: <FiAlertCircle size={20} />,
      exact: false
    })
  }

  const checkIsActive = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="w-74 bg-gradient-to-br from-sidebar-bg-start to-sidebar-bg-end border-r border-sidebar-border flex flex-col h-screen sticky top-0 shadow-lg z-40">
      {/* Logo Kênh Người Bán */}
      <div className="h-20 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <Link to="/vendor/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-all duration-300">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-800 tracking-tight leading-tight group-hover:text-brand-secondary transition-all duration-300">
              ShoesStore
            </span>
            <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase">
              Kênh Người Bán
            </span>
          </div>
        </Link>
      </div>

      {/* Menu Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {menuItems.map((item, index) => {
          if (item.isSubmenu) {
            return (
              <div key={index} className="flex flex-col">
                <button
                  onClick={() => item.setIsOpen(!item.isOpen)}
                  className={`cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    item.children.some(child => checkIsActive(child.path))
                      ? 'bg-sidebar-item-active text-brand-primary font-bold'
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
                    animate={{ rotate: item.isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <FiChevronDown size={16} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {item.isOpen && (
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
                                  ? 'bg-sidebar-item-active text-brand-primary font-bold'
                                  : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-medium'
                              } hover:translate-x-1`}
                            >
                              {child.icon && (
                                <span className="transition-all duration-300 group-hover:scale-110">
                                  {child.icon}
                                </span>
                              )}
                              <span>{child.name}</span>
                              {isChildActive && (
                                <div className="ml-auto w-1 h-4 bg-brand-primary rounded-full"></div>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  ? 'bg-sidebar-item-active text-brand-primary font-bold'
                  : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover font-semibold'
              } hover:translate-x-1`}
            >
              <span className="transition-all duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span className="flex-1">{item.name}</span>

              {/* Badge hiển thị số tin nhắn chưa đọc */}
              {item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-md"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Nút Đăng xuất ở đáy */}
      <div className="p-4 border-t border-sidebar-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-sidebar-text-hover rounded-xl font-bold transition-all duration-300 cursor-pointer group hover:translate-x-1"
        >
          <FiLogOut size={18} className="transition-all duration-300 group-hover:scale-110" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}