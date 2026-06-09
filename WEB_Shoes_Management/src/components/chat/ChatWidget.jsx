import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX, FiSend, FiArrowLeft, FiImage, FiChevronLeft } from 'react-icons/fi'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { chatApiService } from '~/services/chat/chatApiService'
import { DEV_API_URL } from '~/utils/constant'
import { Input } from '~/components/ui/input'
import { toast } from 'react-toastify'
import { formatLastActive, formatMessageTime, shouldShowTimeDivider, formatRelativeTime, getImageUrl } from '~/utils/formatters'

let socket = null

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  // State khung nhập liệu
  const [messageText, setMessageText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const messagesEndRef = useRef(null)

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const currentUser = useSelector((state) => state.user.userInfo)

  // Hàm tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Khởi tạo Socket.io khi Modal mở ra
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const token = localStorage.getItem('accessToken')
      socket = io(DEV_API_URL, {
        auth: { token }
      })

      socket.on('new_chat_message', (newMessage) => {
        if (activeChat && activeChat.conversation_id === newMessage.conversationId) {
          setMessages(prev => [...prev, newMessage])
        }
        fetchConversations()
      })

      socket.on('user_online_status', ({ userId, isOnline, lastActive }) => {
        setConversations(prev => prev.map(conv => {
          const isUserClient = currentUser.id === conv.client_id
          if (isUserClient && conv.store_owner_id === userId) {
            return { ...conv, store_online: isOnline, store_last_active: lastActive }
          }
          if (!isUserClient && conv.client_id === userId) {
            return { ...conv, client_online: isOnline, client_last_active: lastActive }
          }
          return conv
        }))

        if (activeChat) {
          const isUserClient = currentUser.id === activeChat.client_id
          if (isUserClient && activeChat.store_owner_id === userId) {
            setActiveChat(prev => ({ ...prev, store_online: isOnline, store_last_active: lastActive }))
          }
          if (!isUserClient && activeChat.client_id === userId) {
            setActiveChat(prev => ({ ...prev, client_online: isOnline, client_last_active: lastActive }))
          }
        }
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [isOpen, isAuthenticated, activeChat])

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Lấy danh sách Chat bên trái
  const fetchConversations = async () => {
    try {
      const data = await chatApiService.getConversationsList()
      setConversations(data)
    } catch (err) {
      console.error('Lỗi tải danh sách:', err)
    }
  }

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setLoadingList(true)
      fetchConversations().finally(() => setLoadingList(false))
    }
  }, [isOpen, isAuthenticated])

  // Gọi khi Click chọn 1 phòng chat để lấy lịch sử
  useEffect(() => {
    if (activeChat) {
      setLoadingChat(true)
      chatApiService.getChatHistory(activeChat.conversation_id)
        .then(data => {
          // 🟢 ĐÃ FIX: Bỏ .reverse() để mảng render từ cũ -> mới (mới nhất ở dưới cùng)
          setMessages(data)
        })
        .catch(err => toast.error('Không thể tải tin nhắn'))
        .finally(() => setLoadingChat(false))
    }
  }, [activeChat])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() && !selectedImage) return

    const formData = new FormData()
    formData.append('storeId', activeChat.store_id)
    formData.append('content', messageText.trim())
    if (selectedImage) {
      formData.append('chatImages', selectedImage)
    }

    try {
      const result = await chatApiService.sendMessage(formData)
      // Tin nhắn mới sẽ được push vào cuối mảng -> render ở dưới cùng
      setMessages(prev => [...prev, result])

      setMessageText('')
      setSelectedImage(null)
    } catch (error) {
      toast.error('Gửi tin nhắn thất bại')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) setSelectedImage(file)
  }

  const getOnlineStatus = (conv) => {
    const isUserClient = currentUser.id === conv.client_id
    const isOnline = isUserClient ? conv.store_online : conv.client_online
    const lastActive = isUserClient ? conv.store_last_active : conv.client_last_active

    if (isOnline) {
      return { text: 'Đang hoạt động', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  const handleSelectConversation = async (conv) => {
    setActiveChat(conv)

    // Nếu có tin nhắn chưa đọc thì gọi API set is_read = 1
    if (conv.unread_count > 0) {
      try {
        await chatApiService.markAsRead(conv.conversation_id)
        // Reset count trên giao diện lập tức
        setConversations(prev => prev.map(c =>
          c.conversation_id === conv.conversation_id ? { ...c, unread_count: 0 } : c
        ))
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc', error)
      }
    }
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9, originY: 1, originX: 1 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }
  }

  const bubbleVariants = {
    hover: { scale: 1.1, rotate: -10 },
    tap: { scale: 0.9 }
  }

  if (!isAuthenticated) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* MODAL CHAT CHÍNH */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white w-[90vw] sm:w-[800px] h-[500px] sm:h-[550px] rounded-3xl shadow-2xl border border-gray-200 mb-4 flex flex-col overflow-hidden"
          >
            {/* Header Modal */}
            <div className="bg-brand-primary px-4 py-2.5 flex items-center justify-between text-white shadow-sm z-10">
              <div className="flex items-center gap-2">
                {activeChat && (
                  <button
                    onClick={() => setActiveChat(null)}
                    className="hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer sm:hidden"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                )}
                <h3 className="font-bold text-sm">
                  {activeChat ? (
                    <>
                      {(() => {
                        const isUserClient = currentUser.id === activeChat.client_id
                        const displayName = isUserClient ? activeChat.store_name : activeChat.client_name
                        const isOnline = isUserClient ? activeChat.store_online : activeChat.client_online
                        const lastActive = isUserClient ? activeChat.store_last_active : activeChat.client_last_active
                        return (
                          <div>
                            <div>{displayName}</div>
                            <div className={`text-xs font-normal ${isOnline ? 'text-green-200' : 'text-white/70'}`}>
                              {isOnline ? 'Đang hoạt động' : `Hoạt động ${formatLastActive(lastActive).toLowerCase()}`}
                            </div>
                          </div>
                        )
                      })()}
                    </>
                  ) : 'Tin nhắn của bạn'
                  }
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer">
                <FiX size={18} />
              </button>
            </div>

            {/* Body Modal - Layout 2 cột */}
            <div className="flex-1 bg-gray-50 flex overflow-hidden relative">

              {/* Sidebar - Danh sách conversation */}
              <div className={`${activeChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 flex-col border-r border-gray-200 bg-white overflow-hidden`}>
                <div className="px-3 py-2 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700 text-sm">Đoạn chat</h4>
                </div>

                {loadingList ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-6 h-6 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                        <FiMessageCircle size={40} className="text-gray-300 mb-2" />
                        <p className="text-xs font-medium text-center">Chưa có cuộc trò chuyện nào.</p>
                        <p className="text-xs text-center px-4 mt-1">Hãy xem sản phẩm và nhấn Chat với Shop để bắt đầu nhé!</p>
                      </div>
                    ) : (
                      conversations.map((conv) => {
                        const isUserClient = currentUser.id === conv.client_id
                        const displayAvatar = isUserClient ? conv.store_logo : conv.client_avatar
                        const displayName = isUserClient ? conv.store_name : conv.client_name
                        const status = getOnlineStatus(conv)

                        return (
                          <div
                            key={conv.conversation_id}
                            onClick={() => handleSelectConversation(conv)}
                            className={`flex items-center gap-2 p-2 hover:bg-brand-primary/5 rounded-lg cursor-pointer transition-all mx-1 my-0.5 ${
                              activeChat?.conversation_id === conv.conversation_id
                                ? 'bg-brand-primary/10 border-l-2 border-brand-primary'
                                : 'border border-transparent'
                            }`}
                          >
                            <div className="relative">
                              <img
                                src={getImageUrl(displayAvatar, 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User')}
                                alt={displayName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                              {status.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500"></span>
                              )}
                            </div>

                            {/* KHU VỰC HIỂN THỊ CHƯA ĐỌC */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-bold text-xs truncate ${conv.unread_count > 0 ? 'text-black' : 'text-gray-800'}`}>
                                  {displayName}
                                </h4>
                                <span className={`text-[10px] ${conv.unread_count > 0 ? 'text-brand-primary font-bold' : 'text-gray-400'}`}>
                                  {formatRelativeTime(conv.updated_at)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className={`text-[10px] truncate ${conv.unread_count > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                                  {status.isOnline ? 'Đang hoạt động' : status.text}
                                </p>

                                {/* Cục badge đỏ hiển thị số lượng */}
                                {conv.unread_count > 0 && (
                                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                    {conv.unread_count}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Chat Area - Nội dung chat bên phải */}
              <div className={`${activeChat ? 'flex' : 'hidden sm:flex'} flex-1 flex-col h-full bg-gray-50`}>
                {activeChat ? (
                  <>
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      {/* Danh sách bong bóng tin nhắn */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {loadingChat ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="w-6 h-6 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : messages.length === 0 ? (
                          <p className="text-center text-xs text-gray-400 my-6">Hãy bắt đầu cuộc trò chuyện với cửa hàng</p>
                        ) : (
                          messages.map((msg, idx) => {
                            // 🟢 ĐÃ FIX: Đồng bộ hóa snake_case (từ DB) và camelCase (từ API/Socket)
                            const actualSenderId = msg.sender_id || msg.senderId
                            const actualCreatedAt = msg.created_at || msg.createdAt

                            const isMe = actualSenderId === currentUser.id

                            const prevMsg = idx > 0 ? messages[idx - 1] : null
                            const prevCreatedAt = prevMsg ? (prevMsg.created_at || prevMsg.createdAt) : null

                            const showTimeDivider = shouldShowTimeDivider(prevCreatedAt, actualCreatedAt)

                            return (
                              <div key={idx}>
                                {/* Mốc thời gian */}
                                {showTimeDivider && (
                                  <div className="flex justify-center my-2">
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                      {formatMessageTime(actualCreatedAt)}
                                    </span>
                                  </div>
                                )}

                                {/* Bong bóng tin nhắn */}
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 shadow-sm ${
                                    isMe
                                      ? 'bg-brand-primary text-white rounded-br-none'
                                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                  }`}>
                                    {msg.content && <p className="text-xs break-words">{msg.content}</p>}

                                    {/* Hiển thị ảnh */}
                                    {msg.images && msg.images.length > 0 && (
                                      <img
                                        src={msg.images[0].secure_url}
                                        alt="img"
                                        className={`max-w-full mt-1 rounded-lg ${msg.content ? '' : ''}`}
                                      />
                                    )}

                                    {/* Thời gian gửi tin nhắn nhỏ xíu ở góc */}
                                    <div className={`text-[9px] mt-0.5 ${isMe ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                                      {formatMessageTime(actualCreatedAt)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Ảnh xem trước khi chọn */}
                      {selectedImage && (
                        <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200 relative flex items-center">
                          <img src={URL.createObjectURL(selectedImage)} alt="preview" className="h-12 w-12 object-cover rounded-lg" />
                          <button onClick={() => setSelectedImage(null)} className="absolute top-1 left-12 bg-black/50 text-white rounded-full p-0.5 shadow-sm hover:bg-black/70">
                            <FiX size={12}/>
                          </button>
                        </div>
                      )}

                      {/* Form nhập liệu */}
                      <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-gray-200 flex items-center gap-2">
                        <label className="text-gray-400 hover:text-brand-primary cursor-pointer p-1.5 transition-colors">
                          <FiImage size={18} />
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Nhập tin nhắn..."
                          className="flex-1 rounded-full border-gray-200 focus-visible:ring-brand-primary/20 text-sm h-8"
                        />
                        <button
                          type="submit"
                          disabled={!messageText.trim() && !selectedImage}
                          className="bg-brand-primary text-white p-1.5 rounded-full hover:bg-[#c73652] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiSend size={16} />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FiMessageCircle size={48} className="text-gray-300 mb-3" />
                    <p className="text-xs font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
                    <p className="text-[10px] text-center px-8 mt-1">Nhấn vào cửa hàng bên trái để xem tin nhắn</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NÚT ICON CHAT NỔI */}
      <motion.button
        variants={bubbleVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/40 flex items-center justify-center cursor-pointer relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX size={22} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
              <FiMessageCircle size={22} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  )
}