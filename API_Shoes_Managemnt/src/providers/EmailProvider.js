import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
})

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `Shoes Store <${env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    }
    return await transporter.sendMail(mailOptions)
  } catch (error) {
    throw new Error(`Lỗi gửi Email: ${error.message}`)
  }
}

export const EmailProvider = {
  sendEmail
}