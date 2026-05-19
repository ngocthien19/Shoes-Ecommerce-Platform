import { userService } from '~/services/user/userService'

const updateProfile = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id

    let avatarData = null
    if (req.file) {
      avatarData = {
        public_id: req.file.filename,
        secure_url: req.file.path
      }
    }

    const result = await userService.updateProfile(userId, { ...req.body, avatarData })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi hệ thống cập nhật hồ sơ: ${error.message}` })
  }
}

export const userController = {
  updateProfile
}