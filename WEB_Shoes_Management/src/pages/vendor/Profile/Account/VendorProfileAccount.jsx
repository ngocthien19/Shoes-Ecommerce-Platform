import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCamera } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { vendorUserApiService } from '~/services/vendor/vendorUserApiService'
import { updateUserFields } from '~/redux/user/userSlice'
import { getImageUrl } from '~/utils/formatters'
import { VendorProfileInfo } from './VendorProfileInfo'
import { VendorPasswordChange } from './VendorPasswordChange'

export const VendorProfileAccount = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()

  // Lấy userInfo từ Redux store
  const userInfo = useSelector((state) => state.user.userInfo)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'password' ? 'password' : 'profile')
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // Khởi tạo user từ Redux khi component mount
  useEffect(() => {
    if (userInfo) {
      setUser(userInfo)
      setPreviewAvatar(getImageUrl(userInfo.avatar))
    }
  }, [userInfo])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewAvatar(URL.createObjectURL(file))
    }
  }

  const handleUpdateProfile = async (data, resetCallback = null) => {
    setLoading(true)
    const formData = new FormData()

    if (data.password) {
      formData.append('fullname', user?.fullname || '')
      formData.append('phone', user?.phone || '')
      formData.append('address', user?.address || '')
      formData.append('password', data.password)
    } else {
      formData.append('fullname', data.fullname)
      formData.append('phone', data.phone)
      formData.append('address', data.address)
    }

    if (selectedFile) {
      formData.append('avatar', selectedFile)
    }

    try {
      const response = await vendorUserApiService.updateProfile(formData)
      toast.success(response.message || 'Cập nhật thành công!')

      // Cập nhật Redux
      dispatch(updateUserFields(response.user))

      // Cập nhật state local
      setUser(response.user)
      setPreviewAvatar(getImageUrl(response.user.avatar))
      setSelectedFile(null)

      if (typeof resetCallback === 'function') {
        resetCallback()
      }
      if (activeTab === 'password') {
        setActiveTab('profile')
      }
    } catch (error) {
      const backendErrors = error.response?.data?.errors
      const backendMessage = error.response?.data?.message
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        backendErrors.forEach((err) => toast.error(err))
      } else if (backendMessage) {
        toast.error(backendMessage)
      } else {
        toast.error('Cập nhật thất bại!')
      }
    } finally {
      setLoading(false)
    }
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
  }

  if (!user) {
    return (
      <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm w-full">
      {/* Header với avatar */}
      <div className="flex items-center gap-5 pb-8 border-b border-gray-100 w-full mb-8">
        <div className="relative group/avatar">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden ring-1 ring-gray-200">
            <img src={previewAvatar} alt="Hồ sơ" className="w-full h-full object-cover" />
          </div>
          <label htmlFor="avatar-file" className="absolute bottom-0 right-0 w-7 h-7 bg-brand-primary text-white border-2 border-white rounded-full flex items-center justify-center shadow-md hover:bg-[#c73652] cursor-pointer transition-all">
            <FiCamera size={12} />
          </label>
          <input type="file" id="avatar-file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-brand-secondary tracking-tight">{user?.fullname}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Mã thành viên: #{user?.id || '0000'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'profile'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'password'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <VendorProfileInfo user={user} loading={loading} onUpdateProfile={handleUpdateProfile} />
            </motion.div>
          )}

          {activeTab === 'password' && (
            <motion.div
              key="password"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <VendorPasswordChange loading={loading} onUpdateProfile={handleUpdateProfile} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}