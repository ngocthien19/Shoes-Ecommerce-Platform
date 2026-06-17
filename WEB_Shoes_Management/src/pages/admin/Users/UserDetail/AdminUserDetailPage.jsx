import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiArrowLeft } from 'react-icons/fi'
import { adminUserApiService } from '~/services/admin/adminUserApiService'
import { UserDetailHeader } from './UserDetailHeader'
import { UserInfoCard } from './UserInfoCard'
import { UserActivityCard } from './UserActivityCard'
import { UserOrdersCard } from './UserOrdersCard'
import { UserStoreCard } from './UserStoreCard'

export const AdminUserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminUserApiService.getUserDetail(id)
      setUser(res)
    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || ''
      setError(errorMessage)
      if (!errorMessage.includes('không tồn tại') && !errorMessage.includes('đã bị xóa')) {
        toast.error(errorMessage || 'Không thể tải thông tin người dùng')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchUserDetail()
  }, [id])

  const handleToggleActive = async (isActive) => {
    try {
      const res = await adminUserApiService.toggleUsersActive([user.id], isActive)
      toast.success(res.message)
      fetchUserDetail()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleChangeRole = async (targetRoleId) => {
    try {
      const res = await adminUserApiService.changeUsersRole([user.id], targetRoleId)
      toast.success(res.message)
      fetchUserDetail()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (error && (error.includes('không tồn tại') || error.includes('đã bị xóa'))) {
    return (
      <DeletedContentNotice
        title="Người dùng không tồn tại"
        message="Tài khoản này có thể đã bị xóa khỏi hệ thống hoặc bạn không có quyền truy cập."
        backLink="/admin/users"
        backText="Quay lại danh sách"
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-semibold text-gray-400"
        >
          Đang tải thông tin người dùng...
        </motion.span>
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <UserDetailHeader
        user={user}
        onToggleActive={handleToggleActive}
        onChangeRole={handleChangeRole}
        onBack={() => navigate('/admin/users')}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2 space-y-6">
          <UserInfoCard user={user} />
          <UserActivityCard user={user} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <UserOrdersCard user={user} />
          <UserStoreCard user={user} />
        </div>
      </div>
    </motion.div>
  )
}