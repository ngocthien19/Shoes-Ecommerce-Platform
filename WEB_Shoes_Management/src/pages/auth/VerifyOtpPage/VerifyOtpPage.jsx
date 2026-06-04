import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { authService } from '~/services/auth/authService'
import { toast } from 'react-toastify'
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi'

export const VerifyOtpPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const email = location.state?.email || ''
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const { handleSubmit, setValue, watch } = useForm({
    defaultValues: { otpValues: Array(6).fill('') }
  })

  // Theo dõi mảng giá trị OTP để hiển thị đồng bộ lên UI khi paste/nhập
  const otpValues = watch('otpValues')

  useEffect(() => {
    if (!email) {
      toast.warning('Không tìm thấy thông tin tài khoản cần xác thực.')
      navigate('/register')
    }
  }, [email, navigate])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const onSubmit = async (data) => {
    const otpCode = data.otpValues.join('')

    if (otpCode.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.')
      return
    }

    setLoading(true)

    const response = await authService.verifyOtp({ email, otpCode })

    if (response) {
      toast.success(response.message || 'Kích hoạt tài khoản thành công!')
      navigate('/login')
    } else {
      setLoading(false)
    }
  }

  const handleInputChange = (index, e) => {
    const value = e.target.value
    if (isNaN(value)) return

    setValue(`otpValues.${index}`, value.slice(-1))

    if (value && index < 5) {
      inputRefs[index + 1].current.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs[index - 1].current.focus()
    }
  }

  // Xử lý sự kiện dán (Paste) trọn bộ 6 số từ bộ nhớ tạm
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    // Kiểm tra nếu dữ liệu dán vào là chuỗi số và có độ dài tương thích
    if (/^\d+$/.test(pastedData)) {
      const numbers = pastedData.slice(0, 6).split('')

      // Đổ từng số vào react-hook-form
      numbers.forEach((num, idx) => {
        setValue(`otpValues.${idx}`, num)
      })

      // Tự động focus vào ô cuối cùng sau khi dán xong
      const focusIndex = Math.min(numbers.length - 1, 5)
      inputRefs[focusIndex].current.focus()
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    setLoading(true)
    const response = await authService.register({ email, isResend: true })
    if (response) {
      toast.success('Mã OTP mới đã được gửi tới email của bạn!')
      setCountdown(60)
    }
    setLoading(false)
  }

  const formatTime = (seconds) => {
    return `00:${seconds < 10 ? `0${seconds}` : seconds}`
  }

  const maskEmail = (str) => {
    if (!str) return ''
    const [name, domain] = str.split('@')
    return `${name.substring(0, 2)}***@${domain}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center">

        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="text-2xl font-extrabold text-gray-800 tracking-tight">ShoesStore</span>
        </Link>

        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-12 h-12 bg-red-50 text-brand-primary rounded-full flex items-center justify-center mb-4 border border-red-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 text-center">Xác thực OTP</h1>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-xs leading-relaxed">
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn <span className="font-semibold text-gray-800">{maskEmail(email)}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 flex flex-col items-center">

            {/* Hàng ngang 6 ô nhập mã OTP - Đã tích hợp onPaste */}
            <div className="flex justify-center gap-2 sm:gap-3 w-full" onPaste={handlePaste}>
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={otpValues[index] || ''}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-lg text-gray-800 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-[#e94560]/20 transition-all duration-200"
                  onChange={(e) => handleInputChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            <div className="text-sm text-center select-none pt-1">
              <span className="text-gray-500">Không nhận được mã? </span>
              {countdown > 0 ? (
                <span className="text-brand-primary font-bold">Gửi lại sau {formatTime(countdown)}</span>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="text-brand-primary font-bold hover:underline cursor-pointer transition-colors disabled:opacity-50"
                >
                  Gửi lại mã ngay
                </button>
              )}
            </div>

            {/* Nút Xác Nhận */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl transition-all duration-300 ease-out
                         hover:bg-[#c73652] hover:shadow-lg hover:shadow-[#e94560]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Đang kiểm tra...' : 'Xác Nhận'}</span>
              {!loading && <FiCheckCircle size={16} />}
            </button>

            <Link
              to="/register"
              className="text-sm text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-1 font-medium pt-2"
            >
              <FiArrowLeft size={16} />
              Quay lại trang đăng ký
            </Link>
          </form>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-400 mt-12 border-t border-gray-100 pt-4 w-full justify-center select-none">
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Chính sách bảo mật</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Điều khoản dịch vụ</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Trung tâm trợ giúp</span>
        </div>

      </div>
    </div>
  )
}