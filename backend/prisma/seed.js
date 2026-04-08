const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Data seeding process has started');

    await prisma.attendance.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.subscriptionRequest.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.clubService.deleteMany();
    await prisma.club.deleteMany();
    await prisma.clubCategory.deleteMany();
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.family.deleteMany();
    await prisma.user.deleteMany();

    const password = await bcrypt.hash('password123', 12);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@educrm.ru',
            password,
            firstName: 'Анна',
            lastName: 'Сидорова',
            phone: '89999999999',
            role: 'ADMIN',
        },
    });

    console.log('Admin: admin@educrm.ru - password123');

    const teacher1 = await prisma.user.create({
        data: {
            email: 'ivanova@educrm.ru',
            password,
            firstName: 'Елена',
            lastName: 'Иванова',
            phone: '89999999998',
            role: 'TEACHER',
            teacher: {
                create: {
                    specialty: 'Музыка',
                },
            },
        },
        include: {
            teacher: true,
        },
    });

    const teacher2 = await prisma.user.create({
        data: {
            email: 'petrov@educrm.ru',
            password,
            firstName: 'Дмитрий',
            lastName: 'Петров',
            phone: '89999999997',
            role: 'TEACHER',
            teacher: {
                create: {
                    specialty: 'Фотография',
                },
            },
        },
        include: {
            teacher: true,
        },
    });

    const teacher3 = await prisma.user.create({
        data: {
            email: 'sokolova@educrm.ru',
            password,
            firstName: 'Мария',
            lastName: 'Соколова',
            phone: '89999999996',
            role: 'TEACHER',
            teacher: {
                create: {
                    specialty: 'Психология',
                },
            },
        },
        include: {
            teacher: true,
        },
    });

    const teacher4 = await prisma.user.create({
        data: {
            email: 'danilova@educrm.ru',
            password,
            firstName: 'Анастасия',
            lastName: 'Данилова',
            phone: '89999999995',
            role: 'TEACHER',
            teacher: {
                create: {
                    specialty: 'Актерское мастерство',
                },
            },
        },
        include: {
            teacher: true,
        },
    });

    const family1 = await prisma.family.create({
        data: {
            familyName: 'Семья Давыдовых',
            parents: {
                create: [
                    {
                        user: {
                            create: {
                                email: 'davydova@educrm.ru',
                                password,
                                firstName: 'Александра',
                                lastName: 'Давыдова',
                                phone: '89999999994',
                            },
                        },
                    },
                    {
                        user: {
                            create: {
                                email: 'davydov@educrm.ru',
                                password,
                                firstName: 'Дмитрий',
                                lastName: 'Давыдова',
                                phone: '89999999993',
                            },
                        },
                    },
                ]
            },
            children: {
                create: [
                    { firstName: 'Артём', lastName: 'Давыдов', birthDate: new Date('2016-03-15') },
                    { firstName: 'Алиса', lastName: 'Давыдова', birthDate: new Date('2018-07-22') },
                ],
            },
        },
        include: {
            parents: true,
            children: true,
        },
    });

    const family2 = await prisma.family.create({
        data: {
            familyName: 'Семья Самсоновых',
            parents: {
                create: [
                    {
                        user: {
                            create: {
                                email: 'samsonova@educrm.ru',
                                password,
                                firstName: 'Анастасия',
                                lastName: 'Самсонова',
                                phone: '89999999992',
                            },
                        },
                    },
                ]
            },
            children: {
                create: [
                    { firstName: 'Владислав', lastName: 'Самсонов', birthDate: new Date('2017-04-15') },
                ],
            },
        },
        include: {
            parents: true,
            children: true,
        },
    });

    const family3 = await prisma.family.create({
        data: {
            familyName: 'Семья Смирновых',
            parents: {
                create: [
                    {
                        user: {
                            create: {
                                email: 'smirnova@educrm.ru',
                                password,
                                firstName: 'Ксения',
                                lastName: 'Смирнова',
                                phone: '89999999991',
                            },
                        },
                    },
                    {
                        user: {
                            create: {
                                email: 'smirnov@educrm.ru',
                                password,
                                firstName: 'Максим',
                                lastName: 'Смирнов',
                                phone: '89999999990',
                            },
                        },
                    },
                ]
            },
            children: {
                create: [
                    { firstName: 'Анастасия', lastName: 'Смирнова', birthDate: new Date('2018-03-25') },
                    { firstName: 'Мария', lastName: 'Смирнова', birthDate: new Date('2018-03-25') },
                ],
            },
        },
        include: {
            parents: true,
            children: true,
        },
    });

    const clubCategory1 = await prisma.clubCategory.create({
        data: {
            name: 'Музыкальные занятия',
        },
    });

    const clubCategory2 = await prisma.clubCategory.create({
        data: {
            name: 'Психологические занятия',
        },
    });

    const clubCategory3 = await prisma.clubCategory.create({
        data: {
            name: 'Развивающие занятия',
        },
    });

    const club1 = await prisma.club.create({
        data: {
            name: 'Музыкальная энциклопедия',
            classCategoryId: clubCategory1.id,
            defaultTeacherId: teacher1.teacher.id,
        },
    });

    const club2 = await prisma.club.create({
        data: {
            name: 'Музыкальные истории',
            classCategoryId: clubCategory1.id,
            defaultTeacherId: teacher1.teacher.id,
        },
    });

    const club3 = await prisma.club.create({
        data: {
            name: 'Калейдоскоп эмоций',
            classCategoryId: clubCategory2.id,
            defaultTeacherId: teacher3.teacher.id,
        },
    });

    const club4 = await prisma.club.create({
        data: {
            name: 'Кактус',
            classCategoryId: clubCategory2.id,
            defaultTeacherId: teacher3.teacher.id,
        },
    });

    const club5 = await prisma.club.create({
        data: {
            name: 'Театр Взлёт',
            classCategoryId: clubCategory3.id,
            defaultTeacherId: teacher4.teacher.id,
        },
    });

    const club6 = await prisma.club.create({
        data: {
            name: 'Фотокружок',
            classCategoryId: clubCategory3.id,
            defaultTeacherId: teacher2.teacher.id,
        },
    });

    const clubService1 = await prisma.clubService.create({
        data: {
            name: 'Пробное занятие',
            price: 600,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club1.id,
            type: 'TRIAL',
        },
        include: {
            club: true,
        }
    });

    const clubService2 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 12 занятий (+2 заморозки)',
            price: 8400,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: club1.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService3 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 6 занятий',
            price: 4500,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: club1.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService4 = await prisma.clubService.create({
        data: {
            name: 'Разовое занятие',
            price: 800,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club1.id,
            type: 'SINGLE',
        },
        include: {
            club: true,
        }
    });

    const clubService5 = await prisma.clubService.create({
        data: {
            name: 'Пробное занятие',
            price: 600,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club2.id,
            type: 'TRIAL',
        },
        include: {
            club: true,
        }
    });

    const clubService6 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 12 занятий (+2 заморозки)',
            price: 8400,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: club2.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService7 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 6 занятий',
            price: 4500,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: club2.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService8 = await prisma.clubService.create({
        data: {
            name: 'Разовое занятие',
            price: 800,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club2.id,
            type: 'SINGLE',
        },
        include: {
            club: true,
        }
    });

    const clubService9 = await prisma.clubService.create({
        data: {
            name: 'Пробное занятие',
            price: 650,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club3.id,
            type: 'TRIAL',
        },
        include: {
            club: true,
        }
    });

    const clubService10 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 12 занятий (+2 заморозки)',
            price: 8400,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: club3.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService11 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 6 занятий',
            price: 4800,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: club3.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService12 = await prisma.clubService.create({
        data: {
            name: 'Разовое занятие',
            price: 950,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club3.id,
            type: 'SINGLE',
        },
        include: {
            club: true,
        }
    });

    const clubService13 = await prisma.clubService.create({
        data: {
            name: 'Пробное занятие',
            price: 650,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club4.id,
            type: 'TRIAL',
        },
        include: {
            club: true,
        }
    });

    const clubService14 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 12 занятий (+2 заморозки)',
            price: 8400,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: club4.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService15 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 6 занятий',
            price: 4800,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: club4.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService16 = await prisma.clubService.create({
        data: {
            name: 'Разовое занятие',
            price: 950,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club4.id,
            type: 'SINGLE',
        },
        include: {
            club: true,
        }
    });

    const clubService17 = await prisma.clubService.create({
        data: {
            name: 'Пробное занятие',
            price: 800,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club5.id,
            type: 'TRIAL',
        },
        include: {
            club: true,
        }
    });

    const clubService18 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 12 занятий (+2 заморозки)',
            price: 10800,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: club5.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService19 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 6 занятий',
            price: 5400,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: club5.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService20 = await prisma.clubService.create({
        data: {
            name: 'Пробное занятие',
            price: 500,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club6.id,
            type: 'TRIAL',
        },
        include: {
            club: true,
        }
    });

    const clubService21 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 12 занятий (+2 заморозки)',
            price: 6000,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: club6.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService22 = await prisma.clubService.create({
        data: {
            name: 'Абонемент на 6 занятий',
            price: 3000,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: club6.id,
            type: 'SUBSCRIPTION',
        },
        include: {
            club: true,
        }
    });

    const clubService23 = await prisma.clubService.create({
        data: {
            name: 'Разовое занятие',
            price: 800,
            subscriptionLessons: 1,
            freezedLesson: 0,
            clubId: club6.id,
            type: 'SINGLE',
        },
        include: {
            club: true,
        }
    });

    const lessons1 = await prisma.lesson.createMany({
        data: [
            {
                clubId: club1.id,
                date: new Date('2026-04-05'),
                startTime: '17:00',
                endTime: '18:30',
                assignedTeacherId: club1.defaultTeacherId,
            },
            {
                clubId: club1.id,
                date: new Date('2026-04-12'),
                startTime: '17:00',
                endTime: '18:30',
                assignedTeacherId: club1.defaultTeacherId,
            },
            {
                clubId: club1.id,
                date: new Date('2026-04-19'),
                startTime: '17:00',
                endTime: '18:30',
                assignedTeacherId: club1.defaultTeacherId,
            },
        ],
    });

    const lessons2 = await prisma.lesson.createMany({
        data: [
            {
                clubId: club2.id,
                date: new Date('2026-04-07'),
                startTime: '16:00',
                endTime: '17:30',
                assignedTeacherId: club2.defaultTeacherId,
            },
            {
                clubId: club2.id,
                date: new Date('2026-04-14'),
                startTime: '16:00',
                endTime: '17:30',
                assignedTeacherId: club2.defaultTeacherId,
            },
            {
                clubId: club2.id,
                date: new Date('2026-04-21'),
                startTime: '16:00',
                endTime: '17:30',
                assignedTeacherId: club2.defaultTeacherId,
            },
        ],
    });

    const lessons3 = await prisma.lesson.createMany({
        data: [
            {
                clubId: club3.id,
                date: new Date('2026-04-07'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club3.defaultTeacherId,
            },
            {
                clubId: club3.id,
                date: new Date('2026-04-14'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club3.defaultTeacherId,
            },
            {
                clubId: club3.id,
                date: new Date('2026-04-21'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club3.defaultTeacherId,
            },
        ],
    });

    const lessons4 = await prisma.lesson.createMany({
        data: [
            {
                clubId: club4.id,
                date: new Date('2026-04-08'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club4.defaultTeacherId,
            },
            {
                clubId: club4.id,
                date: new Date('2026-04-15'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club4.defaultTeacherId,
            },
            {
                clubId: club4.id,
                date: new Date('2026-04-22'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club4.defaultTeacherId,
            },
        ],
    });

    const lessons5 = await prisma.lesson.createMany({
        data: [
            {
                clubId: club5.id,
                date: new Date('2026-04-09'),
                startTime: '16:00',
                endTime: '17:30',
                assignedTeacherId: club5.defaultTeacherId,
            },
            {
                clubId: club5.id,
                date: new Date('2026-04-16'),
                startTime: '16:00',
                endTime: '17:30',
                assignedTeacherId: club5.defaultTeacherId,
            },
            {
                clubId: club5.id,
                date: new Date('2026-04-23'),
                startTime: '16:00',
                endTime: '17:30',
                assignedTeacherId: club5.defaultTeacherId,
            },
        ],
    });

    const lessons6 = await prisma.lesson.createMany({
        data: [
            {
                clubId: club6.id,
                date: new Date('2026-04-09'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club6.defaultTeacherId,
            },
            {
                clubId: club6.id,
                date: new Date('2026-04-16'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club6.defaultTeacherId,
            },
            {
                clubId: club6.id,
                date: new Date('2026-04-23'),
                startTime: '18:00',
                endTime: '19:30',
                assignedTeacherId: club6.defaultTeacherId,
            },
        ],
    });

    const subscription1 = await prisma.subscription.create({
        data: {
            childId: family1.children[0].id,
            clubId: club4.id,
            clubServiceId: clubService14.id,
            remainingLessons: clubService14.subscriptionLessons,
            usedFreezes: 0,
            startDate: new Date('2026-04-06'),
            status: 'ACTIVE',
        },
        include: {
            clubService: true,
        },
    });

    const subscription2 = await prisma.subscription.create({
        data: {
            childId: family1.children[0].id,
            clubId: club6.id,
            clubServiceId: clubService23.id,
            remainingLessons: clubService23.subscriptionLessons,
            usedFreezes: 0,
            startDate: new Date('2026-04-06'),
            status: 'ACTIVE',
        },
        include: {
            clubService: true,
        },
    });

    const subscription3 = await prisma.subscription.create({
        data: {
            childId: family1.children[1].id,
            clubId: club1.id,
            clubServiceId: clubService2.id,
            remainingLessons: clubService2.subscriptionLessons,
            usedFreezes: 0,
            startDate: new Date('2026-04-05'),
            status: 'ACTIVE',
        },
        include: {
            clubService: true,
        },
    });

    const subscription4 = await prisma.subscription.create({
        data: {
            childId: family1.children[1].id,
            clubId: club5.id,
            clubServiceId: clubService19.id,
            remainingLessons: clubService19.subscriptionLessons,
            usedFreezes: 0,
            startDate: new Date('2026-04-06'),
            status: 'ACTIVE',
        },
        include: {
            clubService: true,
        },
    });

    const subscription5 = await prisma.subscription.create({
        data: {
            childId: family3.children[0].id,
            clubId: club1.id,
            clubServiceId: clubService3.id,
            remainingLessons: clubService3.subscriptionLessons,
            usedFreezes: 0,
            startDate: new Date('2026-04-05'),
            status: 'ACTIVE',
        },
        include: {
            clubService: true,
        },
    });

    const payments = await prisma.payment.createMany({
        data: [
            { subscriptionId: subscription1.id, amount: subscription1.clubService.price, paymentDate: new Date('2026-04-03'), paymentMethod: 'Наличные' },
            { subscriptionId: subscription3.id, amount: subscription3.clubService.price, paymentDate: new Date('2026-04-03'), paymentMethod: 'Карта' },
            { subscriptionId: subscription4.id, amount: subscription4.clubService.price, paymentDate: new Date('2026-04-03'), paymentMethod: 'Карта' },
        ],
    });

    const request1 = await prisma.subscriptionRequest.create({
        data: {
            familyId: family2.id,
            childId: family2.children[0].id,
            clubServiceId: clubService3.id,
            status: 'PENDING',
        },
    });

    const request2 = await prisma.subscriptionRequest.create({
        data: {
            familyId: family3.id,
            childId: family3.children[1].id,
            clubServiceId: clubService21.id,
            status: 'PENDING',
        },
    });

}

main().catch((e) => {
    console.error('Error occurred', e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});