import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FiSave, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'

import { vendorProductApiService } from '~/services/vendor/vendorProductApiService'
import { categoryService } from '~/services/user/categoryService'
import { attributeService } from '~/services/user/attributeService'

import { BasicInfoSection } from './BasicInfoSection'
import { VariantsSection } from './VariantsSection'

export const ProductFormPage = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [attributes, setAttributes] = useState({ sizes: [], colors: [] })

  const [imageFiles, setImageFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const methods = useForm({
    defaultValues: { name: '', categoryId: '', price: '', description: '', variants: [] }
  })

  useEffect(() => {
    Promise.all([
      categoryService.getAllCategories(),
      attributeService.getGlobalAttributes()
    ]).then(([cats, attrs]) => {
      setCategories(cats)
      setAttributes(attrs)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (isEditMode) {
      setLoading(true)
      vendorProductApiService.getProductDetail(id).then(data => {
        methods.reset({
          name: data.name,
          categoryId: data.category_id,
          price: data.price,
          description: data.description,
          variants: data.variants || []
        })

        let parsedImages = []
        if (typeof data.images === 'string') {
          try {
            parsedImages = JSON.parse(data.images)
          } catch {
            parsedImages = []
          }
        } else if (Array.isArray(data.images)) {
          parsedImages = data.images
        } else if (data.images) {
          parsedImages = [data.images]
        }

        setExistingImages(Array.isArray(parsedImages) ? parsedImages : [parsedImages])

      }).catch(() => {
        toast.error('Không tải được thông tin sản phẩm')
        navigate('/vendor/products')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditMode, methods, navigate])

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(prev => [...prev, ...files])
  }

  const handleRemoveNewImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleRemoveOldImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('categoryId', data.categoryId)
      formData.append('price', data.price)
      if (data.description) formData.append('description', data.description)

      imageFiles.forEach(file => formData.append('images', file))
      if (isEditMode) formData.append('oldImages', JSON.stringify(existingImages))

      if (isEditMode) {
        await vendorProductApiService.updateProduct(id, formData)

        if (data.variants && data.variants.length > 0) {
          const newVariants = data.variants.filter(variant => !variant.id)

          if (newVariants.length > 0) {
            const variantPromises = newVariants.map(variant =>
              vendorProductApiService.createVariant(id, variant)
            )
            await Promise.all(variantPromises)
          }
        }

        toast.success('Cập nhật sản phẩm và biến thể thành công!')
        navigate('/vendor/products')
      } else {
        if (imageFiles.length === 0) return toast.warning('Vui lòng chọn ít nhất 1 hình ảnh minh họa')

        const resProduct = await vendorProductApiService.createProduct(formData)
        const newProductId = resProduct.insertId

        if (data.variants && data.variants.length > 0 && newProductId) {
          const variantPromises = data.variants.map(variant =>
            vendorProductApiService.createVariant(newProductId, variant)
          )
          await Promise.all(variantPromises)
        }

        toast.success('Thêm sản phẩm và biến thể thành công!')
        navigate('/vendor/products')
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER: Trái là Title, Phải là Info Text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/vendor/products')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:border-brand-primary hover:text-brand-primary transition-colors duration-300 shadow-sm cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-black text-brand-primary tracking-tight">{isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <p className="text-xs font-bold text-gray-400 mt-1">Hệ thống Quản lý Danh mục hàng hóa</p>
          </div>
        </div>

        {/* Text hiển thị góc phải trên */}
        <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100">
          <FiCheck size={16} />
          <span className="text-xs font-bold">{isEditMode ? 'Đang cập nhật thông tin' : 'Thiết lập thông tin và cấu hình biến thể'}</span>
        </div>
      </motion.div>

      {loading && isEditMode && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">Đang tải dữ liệu sản phẩm...</span>
        </div>
      )}

      {!loading && (
        <FormProvider {...methods}>
          <form className="space-y-6 flex flex-col">

            <BasicInfoSection
              categories={categories}
              imageFiles={imageFiles}
              existingImages={existingImages}
              onImageSelect={handleImageSelect}
              onRemoveNewImage={handleRemoveNewImage}
              onRemoveOldImage={handleRemoveOldImage}
            />

            {/* Khối Biến thể */}
            <VariantsSection attributes={attributes} />

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex justify-end pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={methods.handleSubmit(onSubmit)}
                disabled={loading}
                className="flex items-center gap-2 bg-brand-primary hover:bg-[#c73652] text-white px-10 py-4 rounded-2xl font-black text-sm transition-all duration-100 shadow-lg shadow-brand-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span> : <FiSave size={18} />}
                {isEditMode ? 'LƯU THAY ĐỔI' : 'TẠO SẢN PHẨM'}
              </motion.button>
            </motion.div>

          </form>
        </FormProvider>
      )}
    </div>
  )
}