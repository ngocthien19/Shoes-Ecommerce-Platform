import { vendorProductModel } from '~/models/vendor/product/vendorProductModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import slugify from 'slugify'

// Hàm kiểm tra trạng thái hoạt động của cửa hàng và bốc store_id
const getVerifiedStoreId = async (userId) => {
  const store = await vendorProductModel.getStoreByOwnerId(userId)
  if (!store) {
    throw new Error('Tài khoản chưa đăng ký cửa hàng trên hệ thống.')
  }
  if (!store.is_active) {
    throw new Error('Cửa hàng hiện đang chờ phê duyệt hoặc đã bị khóa.')
  }
  return store.id
}

// Thêm sản phẩm mới
const createProduct = async (userId, productData) => {
  const storeId = await getVerifiedStoreId(userId)

  // Sử dụng thư viện slugify xử lý tên sản phẩm tiếng Việt thành chuỗi không dấu gạch ngang
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

  return { message: 'Đăng bán sản phẩm mới thành công.' }
}

// Chỉnh sửa thông tin sản phẩm
const updateProduct = async (userId, productId, updateData) => {
  const storeId = await getVerifiedStoreId(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, storeId)
  if (!isOwner) {
    throw new Error('Bạn không có quyền chỉnh sửa sản phẩm này.')
  }

  await vendorProductModel.updateProduct(productId, {
    categoryId: updateData.categoryId,
    name: updateData.name,
    description: updateData.description,
    price: updateData.price,
    images: JSON.stringify(updateData.images)
  })

  return { message: 'Cập nhật thông tin sản phẩm thành công.' }
}

// Xóa cứng sản phẩm khỏi DB và xóa toàn bộ ảnh trên Cloudinary
const deleteProduct = async (userId, productId) => {
  const storeId = await getVerifiedStoreId(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, storeId)
  if (!isOwner) {
    throw new Error('Bạn không có quyền xóa sản phẩm này.')
  }

  // 1. Tìm thông tin hình ảnh lưu dưới DB của sản phẩm
  const product = await vendorProductModel.getProductImages(productId)

  if (product && product.images) {
    try {
      const imagesArray = JSON.parse(product.images)

      // Duyệt qua mảng và gọi Cloudinary xóa sạch từng file theo public_id
      for (const img of imagesArray) {
        if (img.public_id) {
          await CloudinaryProvider.cloudinary.uploader.destroy(img.public_id)
        }
      }
    } catch (cloudinaryError) {
      console.error('Lỗi phát sinh khi xóa hình ảnh trên Cloudinary:', cloudinaryError.message)
    }
  }

  // 2. Thực hiện câu lệnh DELETE xóa hoàn toàn sản phẩm dưới MySQL
  await vendorProductModel.hardDeleteProduct(productId)

  return { message: 'Xóa sản phẩm và toàn bộ dữ liệu hình ảnh liên quan thành công.' }
}

// Thêm biến thể phân loại (Size, Màu, Số lượng tồn kho)
const createVariant = async (userId, productId, variantData) => {
  const storeId = await getVerifiedStoreId(userId)
  const isOwner = await vendorProductModel.checkProductOwnership(productId, storeId)
  if (!isOwner) {
    throw new Error('Bạn không có quyền tạo biến thể cho sản phẩm này.')
  }

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

  //  Chạy song song cả 3 câu lệnh truy vấn (Danh sách, Đếm tổng lọc, Thống kê tổng quan) để tối ưu hiệu năng
  const [products, totalItems, overviewStats] = await Promise.all([
    vendorProductModel.getVendorProductsWithFilters(storeId, filterParams),
    vendorProductModel.countVendorProductsWithFilters(storeId, filterParams),
    vendorProductModel.getProductsOverviewStats(storeId) // Gọi hàm thống kê
  ])

  const totalPages = Math.ceil(totalItems / limit)

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages,
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

  if (!productDetail) {
    throw new Error('Sản phẩm không tồn tại hoặc không thuộc quyền sở hữu của cửa hàng.')
  }

  return productDetail
}

// Bật/Tắt trạng thái hoạt động hàng loạt (is_active = 1 hoặc 0)
const toggleProductsActiveBulk = async (userId, productIds, isActive) => {
  const storeId = await getVerifiedStoreId(userId)

  // Kiểm tra tính chính chủ của toàn bộ mảng ID sản phẩm
  const isAllOwner = await vendorProductModel.checkMultipleProductsOwnership(productIds, storeId)
  if (!isAllOwner) {
    throw new Error('Danh sách sản phẩm chứa mã không thuộc quyền sở hữu của cửa hàng bạn.')
  }

  const affectedRows = await vendorProductModel.updateProductsStatusBulk(productIds, Number(isActive), storeId)

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

  // 1. Quét qua DB lấy toàn bộ mảng ảnh của đống sản phẩm này để xóa sạch trên Cloudinary trước
  const productsImageList = await vendorProductModel.getMultipleProductImages(productIds, storeId)

  for (const p of productsImageList) {
    if (p.images) {
      try {
        const imagesArray = JSON.parse(p.images)
        for (const img of imagesArray) {
          if (img.public_id) {
            await CloudinaryProvider.cloudinary.uploader.destroy(img.public_id)
          }
        }
      } catch (err) {
        console.error('Lỗi phát sinh khi dọn ảnh bulk trên Cloudinary:', err.message)
      }
    }
  }

  // 2. Thực hiện xóa cứng đồng loạt dưới MySQL
  const affectedRows = await vendorProductModel.hardDeleteProductsBulk(productIds, storeId)

  return { message: `Đã xóa hoàn toàn dữ liệu của ${affectedRows} sản phẩm thành công.` }
}

const toggleProductActiveSingle = async (userId, productId, isActive) => {
  return await toggleProductsActiveBulk(userId, [Number(productId)], isActive)
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
  toggleProductActiveSingle
}