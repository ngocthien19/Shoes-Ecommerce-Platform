import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCompass } from 'react-icons/fi'
import { InputField } from '~/components/common/InputField'
import { authService } from '~/services/auth/authService'
import { toast } from 'react-toastify'

export const ResetPasswordPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const email = location.state?.email || ''

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { otpCode: '', password: '', confirmPassword: '' }
  })

  useEffect(() => {
    if (!email) {
      toast.warning('Vui lòng nhập Email xác thực trước.')
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const passwordValue = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    const { otpCode, password } = data

    try {
      // Gọi API gửi Email, Mã OTP và Mật khẩu mới lên Backend
      const response = await authService.resetPassword({ email, otpCode, password })

      if (response) {
        toast.success(response.message || 'Đặt lại mật khẩu thành công!')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center">

        {/* Logo Brand */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="text-2xl font-extrabold text-gray-800 tracking-tight">ShoesStore</span>
        </Link>

        {/* Khối giao diện chính */}
        <div className="w-full max-w-md flex flex-col items-center">

          {/* Icon Khiên/Chìa khóa bảo mật */}
          <div className="w-12 h-12 bg-red-50 text-brand-primary rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 text-center">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-xs leading-relaxed">
            Vui lòng tạo mật khẩu mới an toàn cho tài khoản của bạn.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">

            {/* Ô hiển thị Email tĩnh chỉ để đọc (Read-only) giúp người dùng biết họ đang thao tác trên tài khoản nào */}
            <InputField
              label="Địa chỉ Email"
              type="text"
              value={email}
              disabled
              icon={FiMail}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 px-4 pl-11 text-sm text-gray-500 cursor-not-allowed outline-none"
            />

            {/* Ô nhập mã xác thực OTP gửi về mail */}
            <InputField
              label="Mã xác thực OTP"
              type="text"
              placeholder="Nhập 6 số mã OTP"
              icon={FiCompass}
              {...register('otpCode', {
                required: 'Vui lòng nhập mã OTP khôi phục.',
                maxLength: { value: 6, message: 'Mã OTP bao gồm đúng 6 chữ số.' },
                pattern: { value: /^[0-9]+$/, message: 'Mã OTP chỉ bao gồm các chữ số.' }
              })}
              error={errors.otpCode}
            />

            {/* Ô nhập Mật khẩu mới */}
            <div className="relative">
              <InputField
                label="Mật khẩu mới"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                icon={FiLock}
                {...register('password', {
                  required: 'Vui lòng thiết lập mật khẩu mới.',
                  minLength: { value: 6, message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự.' }
                })}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Ô Xác nhận mật khẩu mới */}
            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              icon={FiLock}
              {...register('confirmPassword', {
                required: 'Vui lòng nhập lại mật khẩu xác thực.',
                validate: value => value === passwordValue || 'Mật khẩu xác nhận không trùng khớp.'
              })}
              error={errors.confirmPassword}
            />

            {/* Nút Cập nhật */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl transition-all duration-300 ease-out
                         hover:bg-[#c73652] hover:shadow-lg hover:shadow-[#e94560]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? 'Đang cập nhật hệ thống...' : 'Cập nhật mật khẩu'}
            </button>

            {/* Liên kết quay lại đăng nhập */}
            <div className="flex justify-center pt-2">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-1.5 font-semibold group"
              >
                <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-0.5" size={16} />
                <span>Quay lại Đăng nhập</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Sub Footer */}
        <div className="flex items-center gap-6 text-xs text-gray-400 mt-12 border-t border-gray-100 pt-4 w-full justify-center select-none">
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Chính sách bảo mật</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Điều khoản dịch vụ</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Liên hệ</span>
        </div>

      </div>
    </div>
  )
}