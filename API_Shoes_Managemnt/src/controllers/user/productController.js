import { productService } from '~/services/user/productService'

const getHomepageProducts = async (req, res) => {
  try {
    const result = await productService.getHomepageProducts()
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy sản phẩm trang chủ: ${error.message}` })
  }
}

const getProductDetail = async (req, res) => {
  try {
    const { slug } = req.params
    const result = await productService.getProductDetail(slug)
    return res.status(200).json(result)
  } catch (error) {
    const statusCode = error.message.includes('không tồn tại') ? 404 : 500
    return res.status(statusCode).json({ message: error.message })
  }
}

const searchAndFilterProducts = async (req, res) => {
  try {
    const result = await productService.searchAndFilterProducts(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi bộ lọc tìm kiếm sản phẩm: ${error.message}` })
  }
}

export const productController = {
  getHomepageProducts,
  getProductDetail,
  searchAndFilterProducts
}