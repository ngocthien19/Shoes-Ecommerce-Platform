import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

// Cấu hình SMTP của Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: env.BREVO_SMTP_USER,
    pass: env.BREVO_SMTP_KEY
  },
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
      from: `Shoes Store <${env.BREVO_SMTP_USER}>`,
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