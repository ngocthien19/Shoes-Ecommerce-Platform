import { Resend } from 'resend'
import { env } from '~/config/environment'

const resend = new Resend(env.RESEND_API_KEY)

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Shoes Store <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlContent
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    throw new Error(`Lỗi gửi Email: ${error.message}`)
  }
}

export const EmailProvider = {
  sendEmail
}