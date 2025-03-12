const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text, html = null) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com', // Padrão Gmail
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para SSL (465), false para STARTTLS (587)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Para evitar erros de certificado em alguns provedores
        }
    });

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER, // Define o remetente corretamente
        to,
        subject,
        text,
        html: html || `<p>${text}</p>`, // Se HTML não for passado, usa o texto como fallback
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw new Error('Falha ao enviar o e-mail');
    }
}

module.exports = sendEmail;
