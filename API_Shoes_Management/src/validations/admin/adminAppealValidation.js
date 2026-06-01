import Joi from 'joi'
import { APPEAL_STATUS } from '~/utils/constants'

const createAppeal = async (req, res, next) => {
  const correctCondition = Joi.object({
    appealReason: Joi.string().required().min(10).max(1000).trim().messages({
      'string.empty': 'Nội dung giải trình khiếu nại không được để trống!',
      'string.min': 'Nội dung giải trình quá ngắn! Vui lòng nhập chi tiết ít nhất từ 10 ký tự để ban quản trị đối soát.'
    })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

const handleAppeal = async (req, res, next) => {
  const correctCondition = Joi.object({
    status: Joi.string().required().valid(APPEAL_STATUS.APPROVED, APPEAL_STATUS.REJECTED).messages({
      'any.only': 'Trạng thái phê duyệt đơn không hợp lệ trên hệ thống!'
    }),
    managerNote: Joi.string().required().min(5).max(500).trim().messages({
      'string.empty': 'Vui lòng nhập ghi chú / lý do phản hồi đơn cứu xét này!',
      'string.min': 'Ghi chú phản hồi phải có ít nhất 5 ký tự!'
    })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
}

export const adminAppealValidation = {
  createAppeal,
  handleAppeal
}