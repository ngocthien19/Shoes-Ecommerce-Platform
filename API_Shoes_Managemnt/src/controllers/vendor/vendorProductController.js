import { vendorProductService } from '~/services/vendor/vendorProductService'

// Hàm tiện ích bóc tách mảng file từ req.files sau khi upload qua Cloudinary
const extractImagesFromReqFiles = (reqFiles) => {
  const imagesArray = []
  if (reqFiles && reqFiles.length > 0) {
    reqFiles.forEach(file => {
      imagesArray.push({
        public_id: file.filename,
        secure_url: file.path
      })
    })
  }
  return imagesArray
}

// 1. POST: Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    // Bốc tách dữ liệu từ req.body
    const { categoryId, name, description, price } = req.body
    const images = extractImagesFromReqFiles(req.files)

    if (!categoryId || !name || !price) {
      return res.status(400).json({ message: 'Danh mục, tên sản phẩm và giá bán là thông tin bắt buộc.' })
    }

    // 🌟 XỬ LÝ CHẶN UNDEFINED: Nếu description không được truyền lên, gán giá trị bằng null hoặc chuỗi rỗng
    const finalDescription = description !== undefined ? description : null

    const result = await vendorProductService.createProduct(userId, {
      categoryId: Number(categoryId),
      name,
      description: finalDescription,
      price: Number(price),
      images
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi thêm sản phẩm: ${error.message}` })
  }
}

// 2. PUT: Chỉnh sửa thông tin sản phẩm
const updateProduct = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { categoryId, name, description, price, oldImages } = req.body

    let images = extractImagesFromReqFiles(req.files)

    // Nếu Vendor không cập nhật mảng ảnh mới, giữ lại mảng ảnh cũ do Client gửi lên
    if (images.length === 0 && oldImages) {
      images = JSON.parse(oldImages)
    }

    if (!categoryId || !name || !price) {
      return res.status(400).json({ message: 'Danh mục, tên sản phẩm và giá bán là thông tin bắt buộc.' })
    }

    const finalDescription = description !== undefined ? description : null

    const result = await vendorProductService.updateProduct(userId, Number(id), {
      categoryId: Number(categoryId),
      name,
      description: finalDescription,
      price: Number(price),
      images
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi cập nhật sản phẩm: ${error.message}` })
  }
}

// 3. DELETE: Xóa cứng hoàn toàn sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ.' })
    }

    const result = await vendorProductService.deleteProduct(userId, Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xóa sản phẩm: ${error.message}` })
  }
}

// 4. POST: Thêm biến thể size, màu và số lượng kho hàng
const createVariant = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { size, color, stock } = req.body

    if (!size || stock === undefined) {
      return res.status(400).json({ message: 'Kích thước (size) và số lượng tồn kho là bắt buộc.' })
    }

    const result = await vendorProductService.createVariant(userId, Number(id), {
      size,
      color: color || null,
      stock: Number(stock)
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi thêm biến thể kho: ${error.message}` })
  }
}

// 5. GET: Lấy danh sách sản phẩm của Shop (Phân trang, tìm kiếm, lọc dropdown, sắp xếp)
const getVendorProducts = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id

    // Toàn bộ bộ lọc từ Dropdown FE sẽ được truyền lên qua Query String trên URL
    const { page, limit, search, categoryId, isActive, minPrice, maxPrice, sortBy } = req.query

    const result = await vendorProductService.getVendorProducts(userId, {
      page,
      limit,
      search,
      categoryId,
      isActive,
      minPrice,
      maxPrice,
      sortBy
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tải danh sách sản phẩm: ${error.message}` })
  }
}

// 6. GET: Lấy thông tin chi tiết 1 sản phẩm kèm các biến thể kho
const getProductDetail = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params

    const result = await vendorProductService.getProductDetail(userId, Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tải chi tiết sản phẩm: ${error.message}` })
  }
}

// 7. PATCH: Cập nhật trạng thái hoạt động hàng loạt từ Checkbox
const toggleProductsActiveBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productIds, isActive } = req.body // Nhận mảng [2, 3, 4] và trạng thái true/false (hoặc 1/0)

    if (!Array.isArray(productIds) || productIds.length === 0 || isActive === undefined) {
      return res.status(400).json({ message: 'Mảng danh sách ID sản phẩm và trạng thái \'isActive\' là bắt buộc.' })
    }

    const result = await vendorProductService.toggleProductsActiveBulk(userId, productIds, isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý trạng thái sản phẩm hàng loạt: ${error.message}` })
  }
}

// 8. DELETE: Xóa hàng loạt sản phẩm được tích chọn qua Checkbox
const deleteProductsBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productIds } = req.body // Nhận mảng ID [2, 3, 4] cần xóa bốc từ body

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID sản phẩm cần xóa không hợp lệ hoặc đang trống.' })
    }

    const result = await vendorProductService.deleteProductsBulk(userId, productIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xóa hàng loạt sản phẩm: ${error.message}` })
  }
}

// 9. PATCH: Cập nhật trạng thái hoạt động của 1 sản phẩm đơn lẻ
const toggleProductActiveSingle = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { isActive } = req.body

    if (isActive === undefined) {
      return res.status(400).json({ message: 'Trạng thái \'isActive\' (true/false) là bắt buộc.' })
    }

    const result = await vendorProductService.toggleProductActiveSingle(userId, id, isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi cập nhật trạng thái sản phẩm: ${error.message}` })
  }
}

const requestProductsReapprovalBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productIds } = req.body

    const result = await vendorProductService.requestProductsReapprovalBulk(userId, productIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi gửi khiếu nại sản phẩm: ${error.message}` })
  }
}

export const vendorProductController = {
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