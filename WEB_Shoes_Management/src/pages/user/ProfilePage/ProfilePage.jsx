import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUserFields, logoutSuccess, setFavorites, removeFromFavorites } from '~/redux/user/userSlice'
import { userService } from '~/services/user/userService'
import { authService } from '~/services/auth/authService'
import { productService } from '~/services/user/productService'
import { ProfileSidebar } from './ProfileSidebar'
import { ProfileTabsContent } from './ProfileTabsContent'
import { toast } from 'react-toastify'
import { Header } from '~/layouts/user/Header'
import { Footer } from '~/layouts/user/Footer'
import { getAvatarUrl } from '~/utils/formatters'

export const ProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // State lưu danh sách chi tiết sản phẩm yêu thích trả về từ API getFavorites
  const [favoriteProducts, setFavoriteProducts] = useState([])

  const user = useSelector((state) => state.user.userInfo)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  const [previewAvatar, setPreviewAvatar] = useState(getAvatarUrl(user))
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setPreviewAvatar(getAvatarUrl(user))
  }, [user])

  // EFFECT GỌI API LẤY DANH SÁCH SẢN PHẨM CHI TIẾT KHI CHUYỂN TAB FAVORITES
  useEffect(() => {
    if (isAuthenticated && activeTab === 'favorites') {
      setLoading(true)
      productService.getFavorites()
        .then(data => {
          setFavoriteProducts(data || [])
          const ids = data.map(item => item.product_id)
          dispatch(setFavorites(ids))
        })
        .catch(err => console.error('Lỗi tải danh sách yêu thích:', err))
        .finally(() => setLoading(false))
    }
  }, [activeTab, isAuthenticated, dispatch])

  // HÀM XỬ LÝ BỎ YÊU THÍCH TRỰC TIẾP TẠI TAB DANH SÁCH WISHLIST
  const handleRemoveFavoriteItem = async (productId) => {
    try {
      const response = await productService.toggleFavorite(productId)
      if (response && response.isFavorite === false) {
        toast.success(response.message || 'Đã xóa khỏi danh sách yêu thích.')
        dispatch(removeFromFavorites(productId))
        setFavoriteProducts(prev => prev.filter(item => item.product_id !== productId))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewAvatar(URL.createObjectURL(file))
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logoutSuccess())
      toast.success('Đăng xuất thành công!')
      navigate('/login')
    } catch {
      dispatch(logoutSuccess())
    }
  }

  const handleUpdateProfile = async (data, resetCallback = null) => {
    setLoading(true)
    const formData = new FormData()

    // 1. Nếu hành động submit này đến từ Tab Đổi mật khẩu
    if (data.password) {
      // Đính kèm các trường thông tin cá nhân hiện có từ Redux để Joi validation không bắt lỗi [required]
      formData.append('fullname', user?.fullname || '')
      formData.append('phone', user?.phone || '')
      formData.append('address', user?.address || '')

      // Đính kèm duy nhất mật khẩu mới
      formData.append('password', data.password)
    } else {
      // 2. Nếu hành động submit đến từ Tab Thông tin cá nhân
      formData.append('fullname', data.fullname)
      formData.append('phone', data.phone)
      formData.append('address', data.address)
    }

    // Nếu người dùng có chọn ảnh đại diện mới qua nút bấm Camera trước đó
    if (selectedFile) {
      formData.append('avatar', selectedFile)
    }

    try {
      const response = await userService.updateProfile(formData)
      if (response) {
        toast.success(response.message || 'Cập nhật thành công!')
        dispatch(updateUserFields(response.user))
        setSelectedFile(null)

        if (typeof resetCallback === 'function') {
          resetCallback()
        }
      }
    } catch (error) {
      console.error(error)
      // Quét mảng errors chi tiết động từ Joi Backend đưa xuống để hiển thị Toast
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50/50 py-8 md:py-12 select-none">
        <div className="app-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ProfileSidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            avatarUrl={getAvatarUrl(user)}
          />
          <ProfileTabsContent
            user={user}
            activeTab={activeTab}
            loading={loading}
            onUpdateProfile={handleUpdateProfile}
            onFileChange={handleFileChange}
            previewAvatar={previewAvatar}
            favoriteProducts={favoriteProducts}
            onRemoveFavoriteItem={handleRemoveFavoriteItem}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}