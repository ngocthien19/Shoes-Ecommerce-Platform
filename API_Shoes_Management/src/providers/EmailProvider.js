import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  },
  family: 4,
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  socketTimeout: 60000,
  connectionTimeout: 60000
})

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
  sendEmail
}