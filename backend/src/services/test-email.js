const { verifyConnection, sendVerificationCode } = require('../services/emailService');

async function testEmail() {
    console.log('Testing email configuration...');
    
    const isConnected = await verifyConnection();
    if (!isConnected) {
        console.error('Failed to connect to SMTP server');
        process.exit(1);
    }
    
    try {
        await sendVerificationCode('alena.myacheva@yandex.ru', '123456');
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Failed to send test email:', error);
    }
}

testEmail();