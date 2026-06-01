import pool from '~/config/db'

const findByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  return rows[0]
}

const createPendingUser = async (data) => {
  const { fullname, email, password, phone, address, otpCode, otpExpiry, roleId } = data

  const query = `
    INSERT INTO users (fullname, email, password, phone, address, otp_code, otp_expiry, role_id, is_active, is_verified) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0) 
    ON DUPLICATE KEY UPDATE 
      fullname = ?, password = ?, phone = ?, address = ?, otp_code = ?, otp_expiry = ?, role_id = ?
  `
  const values = [
    fullname, email, password, phone, address, otpCode, otpExpiry, roleId,
    fullname, password, phone, address, otpCode, otpExpiry, roleId
  ]

  const [result] = await pool.execute(query, values)
  return result
}

// Lấy thông tin OTP để đối chiếu
const getOtpInfo = async (email) => {
  const query = 'SELECT otp_code, otp_expiry, is_active FROM users WHERE email = ?'
  const [rows] = await pool.execute(query, [email])
  return rows[0]
}

// Kích hoạt tài khoản chính thức thành công và xóa trắng OTP đi
const activateUser = async (email) => {
  const query = `
    UPDATE users 
    SET is_active = 1, is_verified = 1, otp_code = NULL, otp_expiry = NULL 
    WHERE email = ?
  `
  const [result] = await pool.execute(query, [email])
  return result
}

// Tìm user đầy đủ thông tin để kiểm tra mật khẩu và quyền
const getLoginUser = async (email) => {
  const query = 'SELECT id, fullname, email, password, phone, address, role_id, is_active FROM users WHERE email = ?'
  const [rows] = await pool.execute(query, [email])
  return rows[0]
}

// Cập nhật lại refresh token vào DB phục vụ luồng xoay vòng token sau này
const updateRefreshToken = async (userId, refreshToken) => {
  const query = 'UPDATE users SET refresh_token = ? WHERE id = ?'
  await pool.execute(query, [refreshToken, userId])
}

const updateForgotPasswordOtp = async (email, otpCode, otpExpiry) => {
  const query = `
    UPDATE users 
    SET otp_code = ?, otp_expiry = ? 
    WHERE email = ?
  `
  const [result] = await pool.execute(query, [otpCode, otpExpiry, email])
  return result
}

const updateNewPassword = async (email, hashedPassword) => {
  const query = `
    UPDATE users 
    SET password = ?, otp_code = NULL, otp_expiry = NULL 
    WHERE email = ?
  `
  const [result] = await pool.execute(query, [hashedPassword, email])
  return result
}

const updateProfile = async (userId, cleanData) => {
  const { fullname, phone, address, hashedPassword, avatarData } = cleanData

  // Khởi tạo câu lệnh SQL gốc với các trường văn bản luôn luôn có
  let query = 'UPDATE users SET fullname = ?, phone = ?, address = ?'
  let params = [fullname, phone, address]

  // Kiểm tra nếu có mật khẩu mới đã mã hóa thì nối thêm vào SQL
  if (hashedPassword) {
    query += ', password = ?'
    params.push(hashedPassword)
  }

  // Kiểm tra nếu có đường link ảnh mới từ Cloudinary thì nối thêm vào SQL
  if (avatarData) {
    query += ', avatar = ?'
    // BẮT BUỘC dùng JSON.stringify để MySQL nhận diện đúng định dạng JSON
    params.push(JSON.stringify(avatarData))
  }

  // Cuối cùng găm điều kiện WHERE theo id của user
  query += ' WHERE id = ?'
  params.push(userId)

  // Thực thi câu lệnh query động xuống Database MySQL
  const [result] = await pool.execute(query, params)
  return result
}

const getUpdatedUserFields = async (userId) => {
  const query = 'SELECT id, fullname, email, phone, address, role_id, avatar FROM users WHERE id = ?'
  const [rows] = await pool.execute(query, [userId])
  return rows[0]
}

const removeRefreshToken = async (refreshToken) => {
  const query = 'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?'

  await pool.execute(query, [refreshToken])
}

const getUserProfileById = async (userId) => {
  const query = `
    SELECT id, role_id, fullname, email, phone, avatar, is_active, is_verified, created_at 
    FROM users 
    WHERE id = ?
  `
  const [rows] = await pool.execute(query, [userId])
  return rows[0] // Trả về object thông tin của user đó
}

// Cập nhật trạng thái đang online
const setOnline = async (userId) => {
  const query = 'UPDATE users SET is_online = TRUE WHERE id = ?'
  await pool.execute(query, [userId])
}

// Cập nhật trạng thái offline và lưu giờ hoạt động cuối
const setOffline = async (userId) => {
  const query = 'UPDATE users SET is_online = FALSE, last_active = NOW() WHERE id = ?'
  await pool.execute(query, [userId])
}

// Lấy toàn bộ ID của các tài khoản đang có quyền MANAGER
const getAllManagerIds = async () => {
  const query = `
    SELECT u.id 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE r.name = 'MANAGER'
  `
  const [rows] = await pool.execute(query)
  return rows.map(row => row.id)
}

// Lấy thông tin cơ bản của User (Để lấy tên người đăng ký gửi lên cho Manager xem)
const getUserById = async (userId) => {
  const query = 'SELECT id, fullname, email, phone FROM users WHERE id = ?'
  const [rows] = await pool.execute(query, [userId])
  return rows[0] || null
}

const getAllAdminIds = async () => {
  const query = `
    SELECT u.id 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE r.name = 'ADMIN'
  `
  const [rows] = await pool.execute(query)
  return rows.map(row => row.id)
}

export const userModel = {
  findByEmail,
  createPendingUser,
  getOtpInfo,
  activateUser,
  getLoginUser,
  updateRefreshToken,
  updateForgotPasswordOtp,
  updateNewPassword,
  updateProfile,
  getUpdatedUserFields,
  removeRefreshToken,
  getUserProfileById,
  setOnline,
  setOffline,
  getAllManagerIds,
  getUserById,
  getAllAdminIds
}