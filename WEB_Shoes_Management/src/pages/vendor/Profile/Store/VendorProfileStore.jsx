import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiHome, FiInfo, FiMapPin, FiCamera, FiUpload, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { InputField } from '~/components/common/InputField'
import { vendorStoreApiService } from '~/services/vendor/vendorStoreApiService'
import { getImageUrl } from '~/utils/formatters'

export const VendorProfileStore = () => {
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    fetchStoreProfile()
  }, [])

  const fetchStoreProfile = async () => {
    try {
      setLoading(true)
      const res = await vendorStoreApiService.getStoreProfile()
      setStore(res)
      setLogoPreview(getImageUrl(res.logo))
      setBannerPreview(getImageUrl(res.banner))
      setValue('name', res.name || '')
      setValue('bio', res.bio || '')
      setValue('address', res.address || '')
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.message?.includes('chưa đăng ký cửa hàng')) {
        setStore({ is_registered: false })
      } else {
        toast.error(error.response?.data?.message || 'Không thể tải thông tin cửa hàng')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('bio', data.bio || '')
    formData.append('address', data.address)

    if (logoFile) {
      formData.append('logo', logoFile)
    }
    if (bannerFile) {
      formData.append('banner', bannerFile)
    }

    try {
      const res = await vendorStoreApiService.updateStoreProfile(formData)
      toast.success(res.message || 'Cập nhật cửa hàng thành công!')
      // Cập nhật lại store state
      const updatedStore = await vendorStoreApiService.getStoreProfile()
      setStore(updatedStore)
      setLogoPreview(getImageUrl(updatedStore.logo))
      setBannerPreview(getImageUrl(updatedStore.banner))
      setLogoFile(null)
      setBannerFile(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại!')
    } finally {
      setLoading(false)
    }
  }

  // Form đăng ký cửa hàng (nếu chưa có)
  const RegisterStoreForm = () => {
    const [registerLoading, setRegisterLoading] = useState(false)
    const [registerLogo, setRegisterLogo] = useState(null)
    const [registerBanner, setRegisterBanner] = useState(null)
    const [registerLogoPreview, setRegisterLogoPreview] = useState(null)
    const [registerBannerPreview, setRegisterBannerPreview] = useState(null)

    const { register: reg, handleSubmit: handleRegSubmit, formState: { errors: regErrors } } = useForm()

    const handleRegLogoChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setRegisterLogo(file)
        setRegisterLogoPreview(URL.createObjectURL(file))
      }
    }

    const handleRegBannerChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setRegisterBanner(file)
        setRegisterBannerPreview(URL.createObjectURL(file))
      }
    }

    const onRegisterSubmit = async (data) => {
      setRegisterLoading(true)
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('bio', data.bio || '')
      formData.append('address', data.address)
      if (registerLogo) formData.append('logo', registerLogo)
      if (registerBanner) formData.append('banner', registerBanner)

      try {
        const res = await vendorStoreApiService.registerStore(formData)
        toast.success(res.message)
        fetchStoreProfile()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Đăng ký thất bại!')
      } finally {
        setRegisterLoading(false)
      }
    }

    return (
      <form onSubmit={handleRegSubmit(onRegisterSubmit)} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <FiAlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-800">Bạn chưa đăng ký cửa hàng</p>
            <p className="text-xs text-blue-600 mt-1">Vui lòng điền thông tin bên dưới để đăng ký mở gian hàng trên hệ thống.</p>
          </div>
        </div>

        <InputField
          label="Tên cửa hàng"
          type="text"
          placeholder="Nhập tên cửa hàng"
          icon={FiHome}
          {...reg('name', { required: 'Tên cửa hàng là bắt buộc' })}
          error={regErrors.name}
        />

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiInfo size={14} className="text-brand-primary" />
            Giới thiệu cửa hàng
          </label>
          <textarea
            {...reg('bio')}
            rows={3}
            placeholder="Giới thiệu ngắn gọn về cửa hàng của bạn..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
          />
        </div>

        <InputField
          label="Địa chỉ cửa hàng"
          type="text"
          placeholder="Nhập địa chỉ cửa hàng"
          icon={FiMapPin}
          {...reg('address', { required: 'Địa chỉ cửa hàng là bắt buộc' })}
          error={regErrors.address}
        />

        {/* Logo upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Logo cửa hàng</label>
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleRegLogoChange} className="hidden" id="reg-logo" />
            <label htmlFor="reg-logo" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-primary/30 transition-all">
              {registerLogoPreview ? (
                <img src={registerLogoPreview} alt="Logo preview" className="w-24 h-24 rounded-xl object-cover" />
              ) : (
                <>
                  <FiUpload size={24} className="text-gray-400" />
                  <p className="text-xs text-gray-400 mt-1">Chọn logo cửa hàng</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Banner upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Banner cửa hàng</label>
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleRegBannerChange} className="hidden" id="reg-banner" />
            <label htmlFor="reg-banner" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-primary/30 transition-all">
              {registerBannerPreview ? (
                <img src={registerBannerPreview} alt="Banner preview" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <FiUpload size={24} className="text-gray-400" />
                  <p className="text-xs text-gray-400 mt-1">Chọn banner cửa hàng</p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={registerLoading}
            className="bg-brand-primary hover:bg-[#c73652] text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {registerLoading ? 'Đang đăng ký...' : 'Đăng ký mở cửa hàng'}
          </button>
        </div>
      </form>
    )
  }

  if (!store) {
    return (
      <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (store.is_registered === false || !store.id) {
    return (
      <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm w-full">
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <FiHome className="text-brand-primary" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-secondary tracking-tight">Đăng ký mở cửa hàng</h2>
            <p className="text-xs text-gray-400 mt-0.5">Trở thành người bán trên hệ thống</p>
          </div>
        </div>
        <RegisterStoreForm />
      </div>
    )
  }

  return (
    <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm w-full">
      <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
          <FiHome className="text-brand-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-brand-secondary tracking-tight">Thông tin cửa hàng</h2>
          <p className="text-xs text-gray-400 mt-0.5">Quản lý thông tin gian hàng của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo preview */}
        <div className="flex items-center gap-6 pb-4 border-b border-gray-100">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              <img src={logoPreview || 'https://placehold.co/100x100?text=Logo'} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <label htmlFor="logo-upload" className="absolute bottom-0 right-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#c73652] transition-all">
              <FiCamera size={10} />
            </label>
            <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Logo cửa hàng</p>
            <p className="text-[10px] text-gray-400">* Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
          </div>
        </div>

        {/* Banner preview */}
        <div className="relative">
          <div className="w-full h-40 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <img src={bannerPreview || 'https://placehold.co/800x200?text=Banner'} alt="Banner" className="w-full h-full object-cover" />
          </div>
          <label htmlFor="banner-upload" className="absolute bottom-2 right-2 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#c73652] transition-all">
            <FiCamera size={10} />
          </label>
          <input type="file" id="banner-upload" accept="image/*" onChange={handleBannerChange} className="hidden" />
        </div>

        <InputField
          label="Tên cửa hàng"
          type="text"
          placeholder="Nhập tên cửa hàng"
          icon={FiHome}
          {...register('name', { required: 'Tên cửa hàng là bắt buộc' })}
          error={errors.name}
        />

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <FiInfo size={14} className="text-brand-primary" />
            Giới thiệu cửa hàng
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            placeholder="Giới thiệu ngắn gọn về cửa hàng của bạn..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
          />
        </div>

        <InputField
          label="Địa chỉ cửa hàng"
          type="text"
          placeholder="Nhập địa chỉ cửa hàng"
          icon={FiMapPin}
          {...register('address', { required: 'Địa chỉ cửa hàng là bắt buộc' })}
          error={errors.address}
        />

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Trạng thái hoạt động</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${store.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {store.is_active ? 'Đang hoạt động' : 'Chờ duyệt'}
            </span>
          </div>
          {!store.is_active && (
            <p className="text-xs text-amber-600 mt-2">* Cửa hàng của bạn đang chờ Ban quản trị phê duyệt. Một số chức năng có thể bị giới hạn.</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-secondary hover:bg-[#0f3460]/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}