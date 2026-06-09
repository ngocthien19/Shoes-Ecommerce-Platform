import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { vendorStoreService } from '~/services/vendor/vendorStoreService'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { ImageUploadBox } from './ImageUploadBox'
import { FiCheckCircle, FiHome, FiMapPin, FiAlignLeft, FiLayout } from 'react-icons/fi'

export const RegisterStoreForm = () => {
  const navigate = useNavigate()
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: '', bio: '', address: '' }
  })

  const onSubmit = async (data) => {
    if (!logoFile) return toast.warning('Vui lòng tải lên Logo cửa hàng')

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('bio', data.bio)
      formData.append('address', data.address)
      formData.append('logo', logoFile)
      if (bannerFile) formData.append('banner', bannerFile)

      const res = await vendorStoreService.registerStore(formData)
      toast.success(res.message)
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Cột trái: Thông tin văn bản */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-secondary flex items-center gap-2 italic">
              <FiHome className="text-brand-primary" /> Tên gian hàng <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name', { required: 'Tên gian hàng không được để trống' })}
              placeholder="Vd: Sneaker World Luxury"
              className="rounded-2xl py-6 px-5 border-gray-200 focus:border-brand-primary transition-all duration-300 shadow-sm"
            />
            {errors.name && <p className="text-red-500 text-xs font-medium ml-2">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-secondary flex items-center gap-2 italic">
              <FiMapPin className="text-brand-primary" /> Địa chỉ kho hàng <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('address', { required: 'Vui lòng nhập địa chỉ lấy hàng' })}
              placeholder="Số nhà, tên đường, quận/huyện..."
              className="rounded-2xl py-6 px-5 border-gray-200 focus:border-brand-primary transition-all duration-300 shadow-sm"
            />
            {errors.address && <p className="text-red-500 text-xs font-medium ml-2">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-secondary flex items-center gap-2 italic">
              <FiAlignLeft className="text-brand-primary" /> Giới thiệu cửa hàng
            </label>
            <Textarea
              {...register('bio')}
              placeholder="Viết một vài dòng mô tả về shop của bạn..."
              className="rounded-[1.5rem] p-5 min-h-[180px] border-gray-200 focus:border-brand-primary transition-all duration-300 shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Cột phải: Hình ảnh */}
        <div className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
            <ImageUploadBox label="Logo thương hiệu" file={logoFile} setFile={setLogoFile} />
            <div className="hidden xl:block opacity-40 p-4 border-2 border-dashed border-gray-100 rounded-[2rem] flex items-center justify-center text-center text-xs font-medium">
               Ảnh Logo giúp khách hàng nhận diện thương hiệu của bạn tốt hơn trên danh sách sản phẩm.
            </div>
          </div>
          <ImageUploadBox label="Ảnh bìa gian hàng (Banner)" file={bannerFile} setFile={setBannerFile} aspectClass="aspect-[21/9]" icon={FiLayout} />
        </div>
      </div>

      {/* Button Submit */}
      <div className="pt-8 border-t border-gray-100 flex justify-center sm:justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-brand-primary text-white px-12 py-4 rounded-2xl font-extrabold shadow-lg shadow-brand-primary/20 hover:bg-[#c73652] transition-all duration-300 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <FiCheckCircle size={22} />
          )}
          {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐĂNG KÝ'}
        </motion.button>
      </div>
    </form>
  )
}