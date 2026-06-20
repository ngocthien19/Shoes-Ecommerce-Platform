import { vendorProductService } from '~/services/vendor/vendorProductService'

const extractImagesFromReqFiles = (reqFiles) => {
  const imagesArray = []
  if (reqFiles && reqFiles.length > 0) {
    reqFiles.forEach(file => {
      imagesArray.push({ public_id: file.filename, secure_url: file.path })
    })
  }
  return imagesArray
}

const createProduct = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { categoryId, name, description, price } = req.body
    const images = extractImagesFromReqFiles(req.files)

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

const updateProduct = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { categoryId, name, description, price, oldImages } = req.body

    let newImages = extractImagesFromReqFiles(req.files)

    let keptOldImages = []
    if (oldImages) {
      try {
        keptOldImages = JSON.parse(oldImages)
      } catch (error) {
        keptOldImages = []
      }
    }

    const finalImages = [...keptOldImages, ...newImages]

    if (finalImages.length > 10) {
      return res.status(400).json({ message: 'Sản phẩm chỉ được phép hiển thị tối đa 10 hình ảnh.' })
    }

    const finalDescription = description !== undefined ? description : null

    const result = await vendorProductService.updateProduct(userId, Number(id), {
      categoryId: Number(categoryId),
      name,
      description: finalDescription,
      price: Number(price),
      images: finalImages
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi cập nhật sản phẩm: ${error.message}` })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params

    const result = await vendorProductService.deleteProduct(userId, Number(id))
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xóa sản phẩm: ${error.message}` })
  }
}

const createVariant = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { size, color, stock } = req.body

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

const updateVariant = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productId, variantId } = req.params
    const { size, color, stock } = req.body

    const result = await vendorProductService.updateVariant(
      userId,
      Number(productId),
      Number(variantId),
      {
        size,
        color: color || null,
        stock: Number(stock)
      }
    )
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi cập nhật biến thể: ${error.message}` })
  }
}

const deleteVariant = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productId, variantId } = req.params

    const result = await vendorProductService.deleteVariant(
      userId,
      Number(productId),
      Number(variantId)
    )
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi xóa biến thể: ${error.message}` })
  }
}

const getVendorProducts = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await vendorProductService.getVendorProducts(userId, req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khi tải danh sách sản phẩm: ${error.message}` })
  }
}

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

const toggleProductsActiveBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productIds, isActive } = req.body

    const result = await vendorProductService.toggleProductsActiveBulk(userId, productIds, isActive)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý trạng thái sản phẩm hàng loạt: ${error.message}` })
  }
}

const deleteProductsBulk = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { productIds } = req.body

    const result = await vendorProductService.deleteProductsBulk(userId, productIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xóa hàng loạt sản phẩm: ${error.message}` })
  }
}

const toggleProductActiveSingle = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const { id } = req.params
    const { isActive } = req.body

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
  updateVariant,
  deleteVariant,
  getVendorProducts,
  getProductDetail,
  toggleProductsActiveBulk,
  deleteProductsBulk,
  toggleProductActiveSingle,
  requestProductsReapprovalBulk
}