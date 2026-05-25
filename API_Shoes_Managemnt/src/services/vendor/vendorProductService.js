import { vendorProductModel } from '~/models/vendor/product/vendorProductModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import slugify from 'slugify'

const getVerifiedStoreId = async (userId) => {
  const store = await vendorProductModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Tài khoản chưa đăng ký cửa hàng trên hệ thống.')
  if (!store.is_active) throw new Error('Cửa hàng hiện đang chờ phê duyệt hoặc đã bị khóa.')
  return store.id
}

// Thêm sản phẩm mới
const createProduct = async (userId, productData) => {
  const storeId = await getVerifiedStoreId(userId)

  const baseSlug = slugify(productData.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    locale: 'vi',
    trim: true
  })
  const slug = `${baseSlug}-${Date.now()}`

  await vendorProductModel.createProduct({
    storeId,
    categoryId: productData.categoryId,
    name: productData.name,
    slug,
    description: productData.description,
    price: productData.price,
    images: JSON.stringify(productData.images)
  })

  return { message: 'Đăng ký sản phẩm thành công! Vui lòng chờ Điều hành viên sàn phê duyệt hiển thị.' }
}

// Chỉnh sửa thông tin sản phẩm
const updateProduct = async (userId, productId, updateData) => {
  const storeId = await getVerifiedStoreId(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, storeId)
  if (!isOwner) throw new Error('Bạn không có quyền chỉnh sửa sản phẩm này.')

  await vendorProductModel.updateProduct(productId, {
    categoryId: updateData.categoryId,
    name: updateData.name,
    description: updateData.description,
    price: updateData.price,
    images: JSON.stringify(updateData.images)
  })

  return { message: 'Cập nhật sản phẩm thành công! Mặt hàng đã được chuyển về hàng chờ kiểm duyệt lại.' }
}

// Xóa cứng sản phẩm khỏi DB và xóa toàn bộ ảnh trên Cloudinary
const deleteProduct = async (userId, productId) => {
  const storeId = await getVerifiedStoreId(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, storeId)
  if (!isOwner) {
    throw new Error('Bạn không có quyền xóa sản phẩm này.')
  }

  const product = await vendorProductModel.getProductImages(productId)

  // Bọc SAFE_PARSE chống sập luồng khi chuỗi images lỗi format JSON
  if (product && product.images) {
    try {
      // Kiểm tra nếu là chuỗi rỗng hoặc rác thì không parse
      const trimmedImages = product.images.trim()
      if (trimmedImages && trimmedImages !== '[]' && trimmedImages !== 'null') {
        const imagesArray = JSON.parse(trimmedImages)

        // Duyệt qua mảng và gọi Cloudinary xóa sạch từng file theo public_id
        for (const img of imagesArray) {
          if (img && img.public_id) {
            await CloudinaryProvider.cloudinary.uploader.destroy(img.public_id)
          }
        }
      }
    } catch (cloudinaryError) {
      // Log ra cảnh báo dữ liệu bẩn nhưng KHÔNG làm crash app, vẫn cho chạy tiếp xuống lệnh xóa DB
      console.error('Cảnh báo: Chuỗi JSON ảnh lỗi format hoặc ảnh đã xóa trên Cloudinary:', cloudinaryError.message)
    }
  }

  // 2. Thực hiện câu lệnh DELETE xóa hoàn toàn sản phẩm dưới MySQL (Variants tự bay theo)
  await vendorProductModel.hardDeleteProduct(productId)

  return { message: 'Xóa sản phẩm thành công.' }
}

// Thêm biến thể phân loại (Size, Màu, Số lượng tồn kho)
const createVariant = async (userId, productId, variantData) => {
  const storeId = await getVerifiedStoreId(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, storeId)
  if (!isOwner) throw new Error('Bạn không có quyền tạo biến thể cho sản phẩm này.')

  await vendorProductModel.createVariant({
    productId,
    size: variantData.size,
    color: variantData.color,
    stock: variantData.stock
  })

  return { message: 'Thêm biến thể kho hàng thành công.' }
}

// Lấy danh sách sản phẩm phân trang + tìm kiếm + lọc + sắp xếp
const getVendorProducts = async (userId, filters) => {
  const storeId = await getVerifiedStoreId(userId)

  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    categoryId: filters.categoryId || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    minPrice: filters.minPrice || null,
    maxPrice: filters.maxPrice || null,
    sortBy: filters.sortBy || 'ctime',
    limit,
    offset
  }

  const [products, totalItems, overviewStats] = await Promise.all([
    vendorProductModel.getVendorProductsWithFilters(storeId, filterParams),
    vendorProductModel.countVendorProductsWithFilters(storeId, filterParams),
    vendorProductModel.getProductsOverviewStats(storeId)
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    products
  }
}

// Lấy chi tiết sản phẩm và biến thể phục vụ chỉnh sửa
const getProductDetail = async (userId, productId) => {
  const storeId = await getVerifiedStoreId(userId)
  const productDetail = await vendorProductModel.getProductDetailWithVariants(productId, storeId)
  if (!productDetail) throw new Error('Sản phẩm không tồn tại hoặc không thuộc quyền sở hữu của cửa hàng.')
  return productDetail
}

// Bật/Tắt trạng thái hoạt động hàng loạt (is_active = 1 hoặc 0)
const toggleProductsActiveBulk = async (userId, productIds, isActive) => {
  const storeId = await getVerifiedStoreId(userId)

  const isAllOwner = await vendorProductModel.checkMultipleProductsOwnership(productIds, storeId)
  if (!isAllOwner) throw new Error('Danh sách sản phẩm chứa mã không thuộc quyền sở hữu của cửa hàng bạn.')

  const affectedRows = await vendorProductModel.updateProductsStatusBulk(productIds, Number(isActive), storeId)

  if (affectedRows < productIds.length) {
    if (isActive) {
      throw new Error(
        'Không thể tự kích hoạt lại hoạt động! Trong danh sách có sản phẩm chưa được duyệt (Pending) hoặc đã bị khóa (Banned). Bạn phải gửi yêu cầu gỡ phạt để được cứu xét.'
      )
    }
  }
  return {
    message: isActive
      ? `Đã mở bán lại thành công ${affectedRows} sản phẩm đã chọn.`
      : `Đã tạm ẩn hiển thị thành công ${affectedRows} sản phẩm đã chọn.`
  }
}

// Xóa cứng hàng loạt sản phẩm + Dọn sạch kho ảnh Cloudinary
const deleteProductsBulk = async (userId, productIds) => {
  const storeId = await getVerifiedStoreId(userId)

  const isAllOwner = await vendorProductModel.checkMultipleProductsOwnership(productIds, storeId)
  if (!isAllOwner) {
    throw new Error('Danh sách sản phẩm chứa mã không thuộc quyền sở hữu của cửa hàng bạn.')
  }

  const productsImageList = await vendorProductModel.getMultipleProductImages(productIds, storeId)

  for (const p of productsImageList) {
    if (p && p.images) {
      try {
        const trimmedImages = p.images.trim()
        if (trimmedImages && trimmedImages !== '[]' && trimmedImages !== 'null') {
          const imagesArray = JSON.parse(trimmedImages)
          for (const img of imagesArray) {
            if (img && img.public_id) {
              await CloudinaryProvider.cloudinary.uploader.destroy(img.public_id)
            }
          }
        }
      } catch (err) {
        console.error('Lỗi dọn ảnh bulk (Bỏ qua để xóa DB):', err.message)
      }
    }
  }

  const affectedRows = await vendorProductModel.hardDeleteProductsBulk(productIds, storeId)
  return { message: `Đã xóa hoàn toàn dữ liệu của ${affectedRows} sản phẩm thành công.` }
}

const toggleProductActiveSingle = async (userId, productId, isActive) => {
  return await toggleProductsActiveBulk(userId, [Number(productId)], isActive)
}

const requestProductsReapprovalBulk = async (userId, productIds) => {
  const store = await vendorProductModel.getStoreByOwnerId(userId)
  if (!store) throw new Error('Cửa hàng không tồn tại trên hệ thống.')

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error('Danh sách ID sản phẩm gửi yêu cầu không hợp lệ.')
  }

  const isAllOwner = await vendorProductModel.checkMultipleProductsOwnership(productIds, store.id)
  if (!isAllOwner) throw new Error('Danh sách chứa sản phẩm không thuộc quyền quản lý của shop.')

  const affectedRows = await vendorProductModel.requestProductsReapprovalBulk(productIds, store.id)
  if (affectedRows === 0) {
    throw new Error('Gửi yêu cầu thất bại. Có thể các sản phẩm được chọn không nằm trong trạng thái bị Banned.')
  }

  return { message: `Đã gửi yêu cầu phê duyệt lại thành công cho ${affectedRows} sản phẩm lên Ban quản trị sàn.` }
}

export const vendorProductService = {
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  getVendorProducts,
  getProductDetail,
  toggleProductsActiveBulk,
  deleteProductsBulk,
  toggleProductActiveSingle,
  requestProductsReapprovalBulk
}