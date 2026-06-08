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
  const [showMobileChat, setShowMobileChat] = useState(false)

  // State khung nhập liệu
  const [messageText, setMessageText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const messagesEndRef = useRef(null)

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const currentUser = useSelector((state) => state.user.userInfo)

  // Hàm tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  // Gọi khi lần đầu nhấn nút mở hộp chat
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
          setMessages(data.reverse())
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

  // Lấy trạng thái online cho conversation
  const getOnlineStatus = (conv) => {
    const isUserClient = currentUser.id === conv.client_id
    const isOnline = isUserClient ? conv.store_online : conv.client_online
    const lastActive = isUserClient ? conv.store_last_active : conv.client_last_active

    if (isOnline) {
      return { text: 'Đang hoạt động', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  // Animation Configs
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
            className="bg-white w-[90vw] sm:w-[800px] h-[600px] sm:h-[700px] rounded-3xl shadow-2xl border border-gray-200 mb-4 flex flex-col overflow-hidden"
          >
            {/* Header Modal */}
            <div className="bg-brand-primary p-4 flex items-center justify-between text-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                {activeChat && (
                  <button
                    onClick={() => {
                      setActiveChat(null)
                      setShowMobileChat(false)
                    }}
                    className="hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer sm:hidden"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                )}
                <h3 className="font-bold text-base">
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
                              {isOnline ? 'Đang hoạt động' : formatLastActive(lastActive)}
                            </div>
                          </div>
                        )
                      })()}
                    </>
                  ) : 'Tin nhắn của bạn'
                  }
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            {/* Body Modal - Layout 2 cột */}
            <div className="flex-1 bg-gray-50 flex overflow-hidden relative">

              {/* Sidebar - Danh sách conversation (ẩn trên mobile khi đang chat) */}
              <div className={`${activeChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 flex-col border-r border-gray-200 bg-white overflow-hidden`}>
                <div className="p-3 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700">Đoạn chat</h4>
                </div>

                {loadingList ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                        <FiMessageCircle size={48} className="text-gray-300 mb-2" />
                        <p className="text-sm font-medium text-center">Chưa có cuộc trò chuyện nào.</p>
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
                            onClick={() => {
                              setActiveChat(conv)
                              if (window.innerWidth < 640) setShowMobileChat(true)
                            }}
                            className={`flex items-center gap-3 p-3 hover:bg-brand-primary/5 rounded-xl cursor-pointer transition-all mx-2 my-1 ${
                              activeChat?.conversation_id === conv.conversation_id
                                ? 'bg-brand-primary/10 border-l-4 border-brand-primary'
                                : 'border border-transparent'
                            }`}
                          >
                            <div className="relative">
                              <img
                                src={getImageUrl(displayAvatar, 'https://placehold.co/100x100/f6f9fc/a0aabf?text=User')}
                                alt={displayName}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                              />
                              {status.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full bg-green-500"></span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{displayName}</h4>
                                <span className="text-xs text-gray-400">{formatRelativeTime(conv.updated_at)}</span>
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {status.isOnline ? 'Đang hoạt động' : status.text}
                              </p>
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
                    {/* Khung chat chi tiết */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      {/* Danh sách bong bóng tin nhắn */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {loadingChat ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : messages.length === 0 ? (
                          <p className="text-center text-xs text-gray-400 my-10">Hãy bắt đầu cuộc trò chuyện với cửa hàng</p>
                        ) : (
                          messages.map((msg, idx) => {
                            const isMe = msg.sender_id === currentUser.id
                            const prevMsg = idx > 0 ? messages[idx - 1] : null
                            const showTimeDivider = shouldShowTimeDivider(prevMsg?.created_at, msg.created_at)

                            return (
                              <div key={idx}>
                                {/* Time divider */}
                                {showTimeDivider && (
                                  <div className="flex justify-center my-3">
                                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                      {formatMessageTime(msg.created_at)}
                                    </span>
                                  </div>
                                )}

                                {/* Message bubble */}
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                    isMe
                                      ? 'bg-brand-primary text-white rounded-br-none'
                                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                  }`}>
                                    {msg.content && <p className="text-sm break-words">{msg.content}</p>}

                                    {/* Hiển thị ảnh nếu có */}
                                    {msg.images && msg.images.length > 0 && (
                                      <img
                                        src={msg.images[0].secure_url}
                                        alt="img"
                                        className={`max-w-full mt-2 rounded-xl ${msg.content ? '' : ''}`}
                                      />
                                    )}

                                    {/* Message time inside bubble (for latest message) */}
                                    <div className={`text-[10px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                                      {formatMessageTime(msg.created_at)}
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
                        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 relative">
                          <img src={URL.createObjectURL(selectedImage)} alt="preview" className="h-16 w-16 object-cover rounded-lg" />
                          <button onClick={() => setSelectedImage(null)} className="absolute top-1 left-16 bg-black/50 text-white rounded-full p-1">
                            <FiX size={12}/>
                          </button>
                        </div>
                      )}

                      {/* Form nhập liệu */}
                      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                        <label className="text-gray-400 hover:text-brand-primary cursor-pointer p-2 transition-colors">
                          <FiImage size={20} />
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Nhập tin nhắn..."
                          className="flex-1 rounded-full border-gray-200 focus-visible:ring-brand-primary/20"
                        />
                        <button
                          type="submit"
                          disabled={!messageText.trim() && !selectedImage}
                          className="bg-brand-primary text-white p-2.5 rounded-full hover:bg-[#c73652] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiSend size={18} />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FiMessageCircle size={64} className="text-gray-300 mb-4" />
                    <p className="text-sm font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
                    <p className="text-xs text-center px-8 mt-1">Nhấn vào cửa hàng bên trái để xem tin nhắn</p>
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
        className="w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/40 flex items-center justify-center cursor-pointer relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX size={26} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
              <FiMessageCircle size={26} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  )
}