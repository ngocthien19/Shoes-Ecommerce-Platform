import Joi from 'joi'
import { APPEAL_STATUS } from '~/utils/constants'

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

export const managerAppealValidation = {
  handleAppeal
}