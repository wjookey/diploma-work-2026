const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAdminData = () => ({
    email: process.env.ADMIN_EMAIL || 'alena.myacheva@yandex.ru',
    firstName: process.env.ADMIN_FIRST_NAME || 'Алена',
    lastName: process.env.ADMIN_LAST_NAME || 'Мячева',
    phone: process.env.ADMIN_PHONE || '89524442055',
    role: 'ADMIN',
});

const getDevAdminData = () => ({
    email: process.env.DEV_ADMIN_EMAIL || 'wjookey@gmail.com',
    firstName: process.env.DEV_ADMIN_FIRST_NAME || 'Елена',
    lastName: process.env.DEV_ADMIN_LAST_NAME || 'Мячева',
    phone: process.env.DEV_ADMIN_PHONE || '89001234567',
    role: 'ADMIN',
});

async function main() {
    const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
    });

    if (adminCount > 0) {
        console.log(`Seed skipped: ${adminCount} administrator(s) already in database`);
        return;
    }

    const adminData = getAdminData();
    await prisma.user.create({ data: adminData });
    console.log(`Default administrator created (${adminData.email})`);

    const devAdminData = getDevAdminData();
    await prisma.user.create({ data: devAdminData });
    console.log(`Developer administrator created (${devAdminData.email})`);
}

main()
    .catch((e) => {
        console.error('Seed failed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
