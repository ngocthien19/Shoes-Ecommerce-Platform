import bcrypt from 'bcrypt'
import { userModel } from '~/models/user/userModel'

const updateProfile = async (userId, bodyData) => {
  const { fullname, phone, address, password, avatarData } = bodyData
  let hashedPassword = null

  // 1. Nếu người dùng yêu cầu đổi mật khẩu, tiến hành mã hóa
  if (password) {
    const salt = await bcrypt.genSalt(8)
    hashedPassword = await bcrypt.hash(password, salt)
  }

  // 2. Gọi Model cập nhật dữ liệu vào MySQL
  await userModel.updateProfile(userId, { fullname, phone, address, hashedPassword, avatarData })

  // 3. Lấy lại dữ liệu mới nhất (đã lọc các trường nhạy cảm) để gửi về cho Redux lưu trữ
  const updatedUser = await userModel.getUpdatedUserFields(userId)

  let successMessage = 'Cập nhật thông tin tài khoản thành công! 👟'
  if (hashedPassword) {
    successMessage = 'Thay đổi mật khẩu và cập nhật thông tin thành công!'
  } else if (avatarData) {
    successMessage = 'Cập nhật ảnh đại diện thành công! 📸'
  }

  return {
    message: successMessage,
    isPasswordChanged: !!hashedPassword,
    user: updatedUser
  }
}

const getUserProfile = async (userId) => {
  const user = await userModel.getUserProfileById(userId)

  if (!user) {
    throw new Error('Tài khoản người dùng không tồn tại hoặc đã bị khóa.')
  }

  return user
}

export const userService = {
  updateProfile,
  getUserProfile
}