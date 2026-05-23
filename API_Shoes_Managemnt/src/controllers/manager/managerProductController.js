import { managerProductService } from '~/services/manager/managerProductService'

// 1. GET: Lấy danh sách sản phẩm kèm đa bộ lọc
const getProductsList = async (req, res) => {
  try {
    const { page, limit, search, categoryId, storeId, status, sortBy, sortOrder } = req.query

    const result = await managerProductService.getProductsList({
      page, limit, search, categoryId, storeId, status, sortBy, sortOrder
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách sản phẩm kiểm duyệt: ${error.message}` })
  }
}

// 2. PUT: Thực hiện đóng băng hoặc mở khóa sản phẩm (Nhận ID từ Params và lý do từ Body)
const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params
    const { currentStatus, reason } = req.body

    const result = await managerProductService.toggleProductActive(id, currentStatus, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý trạng thái sản phẩm: ${error.message}` })
  }
}

const getProductDetail = async (req, res) => {
  try {
    const { slug } = req.params

    const result = await managerProductService.getProductDetail(slug)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết sản phẩm theo slug: ${error.message}` })
  }
}

const toggleProductsActiveBulk = async (req, res) => {
  try {
    const { productIds, targetStatus, reason } = req.body
    const result = await managerProductService.toggleProductsActiveBulk(productIds, targetStatus, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý hàng loạt sản phẩm: ${error.message}` })
  }
}

export const managerProductController = {
  getProductsList,
  toggleProductActive,
  getProductDetail,
  toggleProductsActiveBulk
}