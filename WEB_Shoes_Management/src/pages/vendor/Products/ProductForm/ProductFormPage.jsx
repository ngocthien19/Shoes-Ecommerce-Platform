import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
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
  const [flatCategories, setFlatCategories] = useState([])
  const [attributes, setAttributes] = useState({ sizes: [], colors: [] })

  const [imageFiles, setImageFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const [editingVariantIndex, setEditingVariantIndex] = useState(null)
  const [isAddingVariant, setIsAddingVariant] = useState(false)

  const methods = useForm({
    defaultValues: {
      name: '',
      categoryId: '',
      price: '',
      description: '',
      variants: []
    }
  })

  const { control, getValues, reset, setValue } = methods
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants'
  })

  const flattenCategories = (categories, level = 0) => {
    let result = []
    categories.forEach(category => {
      result.push({
        ...category,
        level,
        displayName: level > 0 ? '└ ' + '  '.repeat(level) + category.name : category.name
      })
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1))
      }
    })
    return result
  }

  const findCategoryById = (categories, id) => {
    for (const cat of categories) {
      if (cat.id === id) return cat
      if (cat.children) {
        const found = findCategoryById(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  // Hàm reload dữ liệu sản phẩm
  const reloadProductData = async () => {
    if (!isEditMode || !id) return

    try {
      setLoading(true)
      const data = await vendorProductApiService.getProductDetail(id)

      reset({
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
    } catch (error) {
      toast.error('Không thể tải lại dữ liệu sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([
      categoryService.getAllCategories(),
      attributeService.getGlobalAttributes()
    ]).then(([cats, attrs]) => {
      setCategories(cats)
      setFlatCategories(flattenCategories(cats))
      setAttributes(attrs)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (isEditMode) {
      setLoading(true)
      vendorProductApiService.getProductDetail(id).then(data => {
        const category = findCategoryById(categories, data.category_id)

        reset({
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
  }, [id, isEditMode, reset, navigate, categories])

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

  // Bắt đầu thêm biến thể mới
  const handleAddVariant = () => {
    append({
      size: '',
      color: '',
      stock: 0,
      image: null,
      imageFile: null,
      imagePreview: null
    })
    setIsAddingVariant(true)
    setEditingVariantIndex(fields.length)
  }

  // Bắt đầu sửa biến thể
  const handleEditVariant = (index) => {
    setEditingVariantIndex(index)
    setIsAddingVariant(false)
  }

  // Lưu biến thể (cập nhật)
  const handleUpdateVariant = async (index) => {
    const variants = getValues('variants')
    const variant = variants[index]

    // Kiểm tra dữ liệu hợp lệ
    if (!variant.size) {
      toast.error('Vui lòng chọn kích cỡ (Size)')
      return
    }
    if (variant.stock === undefined || variant.stock === null || variant.stock < 0) {
      toast.error('Vui lòng nhập số lượng tồn kho hợp lệ')
      return
    }

    // Xử lý ảnh variant - lấy file để upload
    let imageData = null
    if (variant.imageFile) {
    // Nếu có file ảnh mới, gửi file lên server (FormData sẽ xử lý)
      imageData = variant.imageFile
    } else if (variant.image) {
    // Giữ nguyên ảnh cũ
      imageData = variant.image
    }

    if (variant.id) {
    // Cập nhật biến thể đã có trong DB
      try {
        setLoading(true)

        // Tạo FormData để gửi file ảnh
        const formData = new FormData()
        formData.append('size', variant.size)
        formData.append('color', variant.color || '')
        formData.append('stock', variant.stock)
        if (imageData instanceof File) {
          formData.append('image', imageData)
        }

        await vendorProductApiService.updateVariant(id, variant.id, formData)

        toast.success('Cập nhật biến thể thành công!')
        setEditingVariantIndex(null)
        setIsAddingVariant(false)
        await reloadProductData()
      } catch (error) {
        toast.error(error.message || 'Cập nhật biến thể thất bại!')
      } finally {
        setLoading(false)
      }
    } else {
    // Biến thể mới - lưu vào form (sẽ được tạo khi submit)
      if (imageData) {
        setValue(`variants.${index}.image`, imageData)
      }
      setEditingVariantIndex(null)
      setIsAddingVariant(false)
      toast.success('Biến thể đã được thêm vào danh sách!')
    }
  }

  // Hủy chỉnh sửa biến thể
  const handleCancelEditVariant = () => {
    const variants = getValues('variants')

    // Nếu đang thêm mới và không có dữ liệu thì xóa luôn
    if (isAddingVariant && variants.length > 0) {
      const lastVariant = variants[variants.length - 1]
      if (!lastVariant.size && !lastVariant.color && (lastVariant.stock === 0 || !lastVariant.stock)) {
        remove(variants.length - 1)
      }
    }

    setEditingVariantIndex(null)
    setIsAddingVariant(false)
  }

  // Xóa biến thể
  const handleDeleteVariant = async (index) => {
    const variants = getValues('variants')
    const variant = variants[index]

    if (variant.id) {
      try {
        setLoading(true)
        await vendorProductApiService.deleteVariant(id, variant.id)
        toast.success('Xóa biến thể thành công!')
        await reloadProductData()
      } catch (error) {
        toast.error(error.message || 'Xóa biến thể thất bại!')
      } finally {
        setLoading(false)
      }
    } else {
      remove(index)
      toast.success('Đã xóa biến thể khỏi danh sách!')
    }
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

        // Tạo các variant mới (không có id)
        if (data.variants && data.variants.length > 0) {
          const newVariants = data.variants.filter(variant => !variant.id)

          if (newVariants.length > 0) {
            for (const variant of newVariants) {
              const variantFormData = new FormData()
              variantFormData.append('size', variant.size)
              variantFormData.append('color', variant.color || '')
              variantFormData.append('stock', variant.stock)
              if (variant.imageFile) {
                variantFormData.append('image', variant.imageFile)
              }
              await vendorProductApiService.createVariant(id, variantFormData)
            }
          }
        }

        toast.success('Cập nhật sản phẩm và biến thể thành công!')
        navigate('/vendor/products')
      } else {
        if (imageFiles.length === 0) return toast.warning('Vui lòng chọn ít nhất 1 hình ảnh minh họa')

        const resProduct = await vendorProductApiService.createProduct(formData)
        const newProductId = resProduct.insertId

        if (data.variants && data.variants.length > 0 && newProductId) {
          for (const variant of data.variants) {
            const variantFormData = new FormData()
            variantFormData.append('size', variant.size)
            variantFormData.append('color', variant.color || '')
            variantFormData.append('stock', variant.stock)
            if (variant.imageFile) {
              variantFormData.append('image', variant.imageFile)
            }
            await vendorProductApiService.createVariant(newProductId, variantFormData)
          }
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
              categories={flatCategories}
              imageFiles={imageFiles}
              existingImages={existingImages}
              onImageSelect={handleImageSelect}
              onRemoveNewImage={handleRemoveNewImage}
              onRemoveOldImage={handleRemoveOldImage}
            />

            <VariantsSection
              attributes={attributes}
              fields={fields}
              remove={remove}
              editingIndex={editingVariantIndex}
              isAddingVariant={isAddingVariant}
              onAddVariant={handleAddVariant}
              onEditVariant={handleEditVariant}
              onUpdateVariant={handleUpdateVariant}
              onDeleteVariant={handleDeleteVariant}
              onCancelEdit={handleCancelEditVariant}
            />

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