import Joi from 'joi'
import { PAYOUT_STATUS } from '~/utils/constants'

// 1. Validate query truyền lên khi lấy danh sách lệnh rút tiền
const getPayoutList = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid(...Object.values(PAYOUT_STATUS)).optional()
  })

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu bộ lọc tìm kiếm yêu cầu rút tiền không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 2. VALIDATE XEM CHI TIẾT: Kiểm tra tham số ID từ req.params
const getPayoutDetail = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'Mã định danh lệnh rút tiền (ID) phải là một chữ số.',
      'any.required': 'Mã định danh lệnh rút tiền (ID) là bắt buộc.'
    })
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Mã định danh lệnh rút tiền trên URL không hợp lệ.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

// 3. Validate body truyền lên khi Admin duyệt hoặc từ chối đơn rút tiền
const processPayout = async (req, res, next) => {
  const correctCondition = Joi.object({
    targetStatus: Joi.string().valid(PAYOUT_STATUS.APPROVED, PAYOUT_STATUS.REJECTED).required().messages({
      'any.only': 'Trạng thái xử lý mục tiêu chỉ chấp nhận [approved] hoặc [rejected].',
      'any.required': 'Trạng thái xử lý mục tiêu (targetStatus) là bắt buộc.'
    }),
    adminNote: Joi.string().min(5).max(500).trim().allow(null, '').messages({
      'string.min': 'Ghi chú của Admin/Mã đối soát giao dịch phải có ít nhất 5 ký tự.',
      'string.max': 'Ghi chú của Admin không được vượt quá 500 ký tự.'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(422).json({
      message: 'Dữ liệu phê duyệt lệnh rút tiền không đúng định dạng.',
      errors: error.details ? error.details.map(err => err.message) : error.message
    })
  }
}

export const adminPayoutValidation = {
  getPayoutList,
  getPayoutDetail,
  processPayout
}