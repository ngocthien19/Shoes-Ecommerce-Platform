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

export const userModel = {
  findByEmail,
  createPendingUser,
  getOtpInfo,
  activateUser,
  getLoginUser,
  updateRefreshToken
}