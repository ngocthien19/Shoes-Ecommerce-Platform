import { managerProductService } from '~/services/manager/managerProductService'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// 1. GET: Lấy danh sách sản phẩm toàn sàn kèm đa bộ lọc và thông số Widgets
const getProductsList = async (req, res) => {
  try {
    const { page, limit, search, categoryId, storeId, status, sortBy, sortOrder } = req.query

    // Khóa validate trạng thái lọc an toàn từ hằng số
    if (status && !Object.values(PRODUCT_MODERATION_STATUS).includes(status)) {
      return res.status(400).json({ message: 'Trạng thái status bộ lọc tìm kiếm không hợp lệ.' })
    }

    const result = await managerProductService.getProductsList({
      page, limit, search, categoryId, storeId, status, sortBy, sortOrder
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách sản phẩm kiểm duyệt: ${error.message}` })
  }
}

// 2. PUT: Thực hiện đóng băng hoặc mở khóa sản phẩm ĐƠN LẺ (Nhận ID từ params)
const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params
    const { currentStatus, reason } = req.body

    if (!id) return res.status(400).json({ message: 'Mã số sản phẩm vi phạm là bắt buộc.' })
    if (!currentStatus) return res.status(400).json({ message: 'Trạng thái hiện tại của sản phẩm là bắt buộc.' })

    const result = await managerProductService.toggleProductActive(id, currentStatus, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý trạng thái sản phẩm: ${error.message}` })
  }
}

// 3. GET: Xem chi tiết thông tin 1 sản phẩm theo Slug
const getProductDetail = async (req, res) => {
  try {
    const { slug } = req.params

    const result = await managerProductService.getProductDetail(slug)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết sản phẩm theo slug: ${error.message}` })
  }
}

// 4. PATCH: Xử lý Checkbox cập nhật trạng thái HÀNG LOẠT (Duyệt giải trình hoặc Ban loạt)
const toggleProductsActiveBulk = async (req, res) => {
  try {
    const { productIds, targetStatus, reason } = req.body

    if (!targetStatus || !Object.values(PRODUCT_MODERATION_STATUS).includes(targetStatus)) {
      return res.status(400).json({ message: 'Trạng thái mục tiêu kiểm duyệt loạt không hợp lệ.' })
    }

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