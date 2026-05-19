import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import multer from 'multer'

const uploadAvatar = (req, res, next) => {
  CloudinaryProvider.streamUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.' })
      }
      return res.status(400).json({ message: `Lỗi tải tập tin: ${err.message}` })
    } else if (err) {
      return res.status(500).json({ message: `Lỗi hệ thống khi xử lý ảnh: ${err.message}` })
    }

    // Nếu không có lỗi, file ảnh sau khi up lên Cloudinary thành công sẽ có thông tin trong req.file
    next()
  })
}

const validateUpdateProfile = (req, res, next) => {
  const { fullname, phone, address, password } = req.body

  // 1. Kiểm tra không được để trống các trường bắt buộc
  if (!fullname || !phone || !address) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin: fullname, phone, address' })
  }

  // 2. Validate số điện thoại chuẩn Việt Nam (10 số, bắt đầu bằng số 0)
  const phoneRegex = /^0[0-9]{9}$/
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và có đúng 10 chữ số' })
  }

  // 3. Nếu người dùng có truyền password lên (muốn đổi mật khẩu)
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' })
    }
    if (password.trim().length === 0) {
      return res.status(400).json({ message: 'Mật khẩu mới không được chỉ chứa khoảng trắng' })
    }
  }

  next()
}

export const userMiddleware = {
  uploadAvatar,
  validateUpdateProfile
}