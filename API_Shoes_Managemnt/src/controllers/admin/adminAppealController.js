import { adminAppealService } from '~/services/admin/adminAppealService'

const submitStoreAppeal = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const { appealReason } = req.body
    const evidenceFiles = req.files || []

    const result = await adminAppealService.submitStoreAppeal({
      userId,
      appealReason,
      evidenceFiles
    })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const getAppealsList = async (req, res) => {
  try {
    const result = await adminAppealService.getAppealsList(req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh sách đơn cứu xét: ${error.message}` })
  }
}

const processStoreAppeal = async (req, res) => {
  try {
    const { id } = req.params
    const { status, managerNote } = req.body

    const result = await adminAppealService.processStoreAppeal(Number(id), { status, managerNote })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi thực thi duyệt đơn cứu xét: ${error.message}` })
  }
}

export const adminAppealController = {
  submitStoreAppeal,
  getAppealsList,
  processStoreAppeal
}