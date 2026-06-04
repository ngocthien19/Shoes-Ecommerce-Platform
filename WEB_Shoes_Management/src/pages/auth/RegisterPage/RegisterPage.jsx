import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin } from 'react-icons/fi'
import { InputField } from '~/components/common/InputField'
import { Checkbox } from '~/components/ui/checkbox'
import { Field, FieldLabel, FieldDescription } from '~/components/ui/field'
import { authService } from '~/services/auth/authService'
import { toast } from 'react-toastify'

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      address: '',
      agreeTerms: false
    }
  })

  // Theo dõi giá trị mật khẩu phục vụ đối chiếu xác nhận mật khẩu
  const passwordValue = watch('password')

  // Không sử dụng try-catch thủ công vì interceptor tại authorizedAxiosInstance đã bao quát lỗi hệ thống
  const onSubmit = async (data) => {
    setLoading(true)
    const { fullname, email, phone, password, address } = data

    const response = await authService.register({ fullname, email, phone, password, address })

    if (response) {
      toast.success(response.message || 'Đăng ký thành công! Vui lòng kiểm tra Email nhận OTP.')
      navigate('/verify-otp', { state: { email } })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      {/* Container form chính - Đã bỏ grid-cols-12, thu nhỏ max-w thành 3xl để ôm form vừa vặn, đẹp mắt */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center">

        {/* Logo Brand */}
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="text-2xl font-extrabold text-gray-800 tracking-tight">ShoesStore</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Tạo tài khoản mới</h1>
          <p className="text-sm text-gray-500">Tham gia cộng đồng ShoesStore ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">

          {/* Họ và tên */}
          <InputField
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            icon={FiUser}
            {...register('fullname', {
              required: 'Vui lòng nhập họ và tên của bạn.',
              maxLength: { value: 50, message: 'Họ và tên không được vượt quá 50 ký tự.' }
            })}
            error={errors.fullname}
          />

          {/* Khối song song: Email & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Email"
              type="email"
              placeholder="example@gmail.com"
              icon={FiMail}
              {...register('email', {
                required: 'Vui lòng cung cấp địa chỉ Email.',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Định dạng Email không hợp lệ.' }
              })}
              error={errors.email}
            />

            <InputField
              label="Số điện thoại"
              placeholder="0901 234 567"
              icon={FiPhone}
              {...register('phone', {
                required: 'Vui lòng cung cấp số điện thoại.',
                pattern: { value: /^0[0-9]{9}$/, message: 'Số điện thoại bắt đầu bằng 0 và có đúng 10 chữ số.' }
              })}
              error={errors.phone}
            />
          </div>

          {/* Khối song song: Mật khẩu & Xác nhận mật khẩu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              {...register('password', {
                required: 'Vui lòng thiết lập mật khẩu.',
                minLength: { value: 6, message: 'Mật khẩu phải chứa ít nhất 6 ký tự.' }
              })}
              error={errors.password}
            />

            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              {...register('confirmPassword', {
                required: 'Vui lòng nhập lại mật khẩu xác thực.',
                validate: value => value === passwordValue || 'Mật khẩu xác nhận không trùng khớp.'
              })}
              error={errors.confirmPassword}
            />
          </div>

          {/* Địa chỉ giao hàng */}
          <InputField
            label="Địa chỉ"
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
            icon={FiMapPin}
            {...register('address', {
              required: 'Vui lòng cung cấp địa chỉ nhận hàng chính xác.'
            })}
            error={errors.address}
          />

          {/* Khối Checkbox Điều khoản pháp lý theo chuẩn cấu trúc Field mới */}
          <Field orientation="horizontal" className="items-start gap-2.5 pt-1">
            <Checkbox
              id="agreeTerms"
              className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer mt-0.5"
              {...register('agreeTerms', {
                required: 'Bạn phải đồng ý với điều khoản dịch vụ để tiếp tục.'
              })}
              onCheckedChange={(checked) => {
                setValue('agreeTerms', checked)
                trigger('agreeTerms')
              }}
            />

            <div className="flex flex-col gap-1">
              <FieldLabel
                htmlFor="agreeTerms"
                className="text-sm text-gray-600 font-normal cursor-pointer select-none leading-none"
              >
                Tôi đồng ý với{' '}
                <span className="text-brand-primary font-semibold hover:underline">Điều khoản & Chính sách</span>{' '}
                của ShoesStore
              </FieldLabel>

              {errors.agreeTerms && (
                <FieldDescription className="text-xs text-red-500 font-medium animate-fadeIn">
                  {errors.agreeTerms.message}
                </FieldDescription>
              )}
            </div>
          </Field>

          {/* Nút Đăng Ký */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl transition-all duration-300 ease-out
                       hover:bg-[#c73652] hover:shadow-lg hover:shadow-[#e94560]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loading ? 'Đang xử lý hệ thống...' : 'Đăng Ký Tài Khoản'}
          </button>

          <p className="text-sm text-gray-600 text-center pt-2">
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className="text-brand-primary font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </form>

        {/* Sub Footer */}
        <div className="flex items-center gap-6 text-xs text-gray-400 mt-12 border-t border-gray-100 pt-4 w-full justify-center">
          <Link to="/" className="hover:text-brand-primary transition-colors">Trang chủ</Link>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Trung tâm hỗ trợ</span>
          <span>•</span>
          <span className="hover:text-brand-primary transition-colors cursor-pointer">Câu hỏi thường gặp</span>
        </div>

      </div>
    </div>
  )
}