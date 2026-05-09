const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
        user: config.email.user,
        pass: config.email.password,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationCode = async (email, code) => {
    const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.user}>`,
        to: email,
        subject: 'Код подтверждения для входа',
        headers: {
            'X-Mailer': 'Node.js',
            'X-Priority': '3',
        },
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: #4631D1; padding: 30px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Подтверждение входа</h2>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">Здравствуйте!</p>
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">Для входа в систему используйте следующий код:</p>
                    <div style="font-size: 36px; font-weight: bold; padding: 20px; background: #f8f9fa; text-align: center; letter-spacing: 8px; border-radius: 8px; margin: 20px 0; font-family: monospace;">
                        ${code}
                    </div>
                    <p style="font-size: 14px; color: #666;">Код действителен в течение <strong>10 минут</strong>.</p>
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">Если вы не запрашивали вход, просто проигнорируйте это письмо.</p>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
                </div>
            </div>
        `,
        text: `
        Код подтверждения для входа: ${code}
        
        Код действителен в течение 10 минут.
        
        Если вы не запрашивали код, просто проигнорируйте это письмо.
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Письмо успешно отправлено', info.messageId);
        return info;
    } catch (error) {
        console.error('Ошибка отправления письма', error);
        throw new Error(`Не удалось отправить письмо: ${error.message}`);
    }
};

const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection verified');
        return true;
    } catch (error) {
        console.error('SMTP connection failed: ', error);
        return false;
    }
};

module.exports = {
    generateVerificationCode,
    sendVerificationCode,
    verifyConnection,
};