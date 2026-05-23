import { managerStoreService } from '~/services/manager/managerStoreService'

// 1. GET: Danh sách toàn bộ cửa hàng (Lọc trạng thái, tìm kiếm, khoảng ngày tạo)
const getStoresList = async (req, res) => {
  try {
    const { page, limit, search, is_active, startDate, endDate } = req.query

    const result = await managerStoreService.getStoresList({
      page,
      limit,
      search,
      isActive: is_active,
      startDate,
      endDate
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách cửa hàng: ${error.message}` })
  }
}

// 2. PATCH: Xử lý duyệt hàng loạt theo mảng ID gửi từ Checkbox Frontend
const approveStoresBulk = async (req, res) => {
  try {
    const { storeIds } = req.body

    const result = await managerStoreService.approveStoresBulk(storeIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi phê duyệt hàng loạt: ${error.message}` })
  }
}

// 3. PATCH: Xử lý khóa hàng loạt theo mảng ID gửi từ Checkbox Frontend
const banStoresBulk = async (req, res) => {
  try {
    const { storeIds } = req.body
    const result = await managerStoreService.banStoresBulk(storeIds)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi đóng băng gian hàng loạt: ${error.message}` })
  }
}

// 4. PATCH: Xử lý từ chối hàng loạt theo mảng ID gửi từ Checkbox Frontend kèm lý do
const rejectStoresBulk = async (req, res) => {
  try {
    const { storeIds, reason } = req.body

    const result = await managerStoreService.rejectStoresBulk(storeIds, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi từ chối phê duyệt hàng loạt: ${error.message}` })
  }
}

const getStoreDetail = async (req, res) => {
  try {
    const { id } = req.params

    const result = await managerStoreService.getStoreDetail(id)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi lấy chi tiết gian hàng: ${error.message}` })
  }
}

const approveStoreSingle = async (req, res) => {
  try {
    const { id } = req.params
    const result = await managerStoreService.approveStoreSingle(id)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi phê duyệt cửa hàng: ${error.message}` })
  }
}

const rejectStoreSingle = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body // Nhận lý do từ chối đăng ký
    const result = await managerStoreService.rejectStoreSingle(id, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi từ chối đơn đăng ký: ${error.message}` })
  }
}

const banStoreSingle = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body // Nhận lý do khóa shop
    const result = await managerStoreService.banStoreSingle(id, reason)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi khóa cửa hàng vi phạm: ${error.message}` })
  }
}

export const managerStoreController = {
  getStoresList,
  approveStoresBulk,
  banStoresBulk,
  rejectStoresBulk,
  getStoreDetail,
  approveStoreSingle,
  rejectStoreSingle,
  banStoreSingle
}