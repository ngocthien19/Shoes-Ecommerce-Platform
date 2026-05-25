import { managerProductService } from '~/services/manager/managerProductService'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'

// 1. GET: Lấy danh sách sản phẩm toàn sàn kèm đa bộ lọc và thông số Widgets
const getProductsList = async (req, res) => {
  try {
    const { page, limit, search, categoryId, storeId, status, sortBy, sortOrder } = req.query

    // Chặn lọc bẩn trạng thái ngay tại cửa ngõ Controller
    if (status && !Object.values(PRODUCT_MODERATION_STATUS).includes(status)) {
      return res.status(400).json({ message: 'Trạng thái status bộ lọc tìm kiếm sản phẩm không hợp lệ.' })
    }

    const result = await managerProductService.getProductsList({
      page, limit, search, categoryId, storeId, status, sortBy, sortOrder
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách sản phẩm kiểm duyệt: ${error.message}` })
  }
}

// 2. Xử lý phê duyệt/khóa/từ chối sản phẩm ĐƠN LẺ bằng targetStatus chủ động
const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params
    const { targetStatus, reason } = req.body

    if (!id) return res.status(400).json({ message: 'Mã số ID sản phẩm là bắt buộc.' })

    // Validation kiểm tra trạng thái mục tiêu gửi lên từ Client
    if (!targetStatus || !Object.values(PRODUCT_MODERATION_STATUS).includes(targetStatus)) {
      return res.status(400).json({ message: 'Trạng thái mục tiêu kiểm duyệt (targetStatus) không hợp lệ hoặc để trống.' })
    }

    const result = await managerProductService.toggleProductActive(id, targetStatus, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý trạng thái đơn lẻ sản phẩm: ${error.message}` })
  }
}

// 3. GET: Xem chi tiết thông tin 1 sản phẩm theo cấu trúc đường dẫn Slug
const getProductDetail = async (req, res) => {
  try {
    const { slug } = req.params
    if (!slug) return res.status(400).json({ message: 'Slug đường dẫn sản phẩm là bắt buộc.' })

    const result = await managerProductService.getProductDetail(slug)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết sản phẩm theo slug: ${error.message}` })
  }
}

// 4. Xử lý mảng Checkbox cập nhật trạng thái HÀNG LOẠT
const toggleProductsActiveBulk = async (req, res) => {
  try {
    const { productIds, targetStatus, reason } = req.body

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách mảng mã số sản phẩm (productIds) là bắt buộc và phải là mảng.' })
    }

    if (!targetStatus || !Object.values(PRODUCT_MODERATION_STATUS).includes(targetStatus)) {
      return res.status(400).json({ message: 'Trạng thái mục tiêu kiểm duyệt loạt (targetStatus) không hợp lệ.' })
    }

    const result = await managerProductService.toggleProductsActiveBulk(productIds, targetStatus, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi cập nhật hàng loạt sản phẩm: ${error.message}` })
  }
}

export const managerProductController = {
  getProductsList,
  toggleProductActive,
  getProductDetail,
  toggleProductsActiveBulk
}