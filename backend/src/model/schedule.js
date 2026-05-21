const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const clubWithTeacherInclude = {
    club: {
        include: {
            teacher: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                },
            },
        },
    },
};

const createUpdateInclude = {
    club: {
        include: { teacher: true },
    },
};

exports.getAll = async () => {
    return prisma.schedule.findMany({
        include: clubWithTeacherInclude,
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
};

exports.getById = async (id) => {
    return prisma.schedule.findUnique({
        where: { id },
        include: clubWithTeacherInclude,
    });
};

exports.create = async (body) => {
    const { clubId, dayOfWeek, startTime, endTime, room } = body;

    const club = await prisma.club.findUnique({
        where: { id: parseInt(clubId) },
        include: {
            teacher: true,
        },
    });

    if (!club) {
        throw new AppError('Кружок не найден', 404);
    }

    return prisma.schedule.create({
        data: {
            clubId: parseFloat(clubId),
            dayOfWeek: parseInt(dayOfWeek),
            startTime,
            endTime,
            room,
        },
        include: createUpdateInclude,
    });
};

exports.update = async (id, body) => {
    const { clubId, dayOfWeek, startTime, endTime, room } = body;

    return prisma.schedule.update({
        where: { id },
        data: {
            ...(clubId && { clubId: parseInt(clubId) }),
            ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(dayOfWeek) }),
            ...(startTime && { startTime }),
            ...(endTime && { endTime }),
            ...(room !== undefined && { room }),
        },
        include: createUpdateInclude,
    });
};

exports.remove = async (id) => {
    await prisma.schedule.delete({
        where: { id },
    });
};

exports.generateLessons = async ({ startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        throw new AppError('Дата начала должна быть раньше даты конца', 400);
    }

    const schedule = await prisma.schedule.findMany({
        include: {
            club: true,
        },
    });

    if (schedule.length === 0) {
        throw new AppError('Расписание отсутствует', 404);
    }

    const lessons = [];
    for (const record of schedule) {
        let current = new Date(start);
        while (current <= end) {
            const jsDay = current.getDay();
            const ourDay = jsDay === 0 ? 7 : jsDay;

            if (ourDay === record.dayOfWeek) {
                lessons.push({
                    clubId: record.clubId,
                    date: new Date(current),
                    startTime: record.startTime,
                    endTime: record.endTime,
                    room: record.room,
                    status: 'SCHEDULED',
                    assignedTeacherId: record.club.defaultTeacherId,
                });
            }

            current = new Date(current.setDate(current.getDate() + 1));
        }
    }

    if (lessons.length === 0) {
        throw new AppError('Нет уроков для генерации', 400);
    }

    const createdLessons = await prisma.lesson.createMany({
        data: lessons,
        skipDuplicates: true,
    });

    return createdLessons.count;
};
