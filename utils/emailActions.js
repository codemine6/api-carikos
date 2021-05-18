import nodemailer from 'nodemailer'
import config from './config.js'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.user_email,
        pass: config.user_password
    }
})

export function sendVerification({_id, email, username, token}) {
    const options = {
        from: 'Carikos <->',
        to: email,
        subject: 'Verifikasi Akun',
        html: `
            <p>Hai ${username},</p>
            <p>Kamu sudah memasukan <b>${email}</b> sebagai alamat email untuk akun <a href="https://app-kosku.netlify.com">Kosku</a></p>
            <p>Silahkan lakukan verifikasi untuk melanjutkan proses pendaftaran</p>
            <div style="text-align:center; margin: 2rem 0">
                <a href="${config.origin}/verification?id=${_id}&token=${token}" style="color:#fff; font-weight: bold; text-decoration: none; background:#6490fa; border-radius: 2rem; padding:.7rem 2rem;">
                    Verifikasi
                </a>
            </div>
            <p>Salam,</p>
            <p>Tim Carikos</p>
        `
    }

    return transporter.sendMail(options)
}

export function sendResetPassword({_id, email, username, token}) {
    const options = {
        from: 'Carikos <->',
        to: email,
        subject: 'Reset Password',
        html: `
            <p>Hai ${username},</p>
            <div style="text-align:center; margin: 2rem 0">
                <a href="${config.origin}/reset-password?id=${_id}&token=${token}" style="color:#fff; font-weight: bold; text-decoration: none; background:#6490fa; border-radius: 2rem; padding:.7rem 2rem;">
                    Reset Password
                </a>
            </div>
            <p>Salam,</p>
            <p>Tim Carikos</p>
        `
    }

    return transporter.sendMail(options)
}