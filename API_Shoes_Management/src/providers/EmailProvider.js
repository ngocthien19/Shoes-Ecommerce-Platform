import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

// Cấu hình transporter tối ưu cho production
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false, // Bỏ qua lỗi chứng chỉ SSL
    minVersion: 'TLSv1.2'
  },
  socketTimeout: 60000, // 60 giây timeout
  connectionTimeout: 60000, // 60 giây timeout kết nối
  family: 4 // Force IPv4
})

// Kiểm tra kết nối khi khởi động
const verifyConnection = async () => {
  try {
    await transporter.verify()
  } catch (error) {
    // console.error('❌ Kết nối Email Server thất bại:', error.message)
  }
}

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `Shoes Store <${env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (error) {
    throw new Error(`Lỗi gửi Email: ${error.message}`)
  }
}

export const EmailProvider = {
  sendEmail,
  verifyConnection
}