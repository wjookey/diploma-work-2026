const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listInclude = {
    club: true,
    teacher: {
        include: {
            user: { select: { id: true, firstName: true, lastName: true } },
        },
    },
    attendances: {
        include: {
            child: { select: { id: true, firstName: true, lastName: true, birthDate: true } },
        },
    },
};

const createUpdateInclude = {
    club: { select: { id: true, name: true } },
    teacher: {
        include: {
            user: { select: { firstName: true, lastName: true } },
        },
    },
};

const buildListWhere = async (user, query) => {
    const { clubId, dateFrom, dateTo, status } = query;
    const where = {};

    if (user.role === 'PARENT') {
        const children = await prisma.child.findMany({
            where: { familyId: user.parent.familyId },
            select: { id: true },
        });
        const childIds = children.map((child) => child.id);

        const subscriptions = await prisma.subscription.findMany({
            where: {
                childId: { in: childIds },
                status: 'ACTIVE',
            },
            select: { clubId: true, startDate: true, endDate: true },
        });

        if (subscriptions.length !== 0) {
            const clubIds = subscriptions.map((subscription) => subscription.clubId);
            where.clubId = { in: clubIds };
        }
    }

    if (user.role === 'TEACHER') {
        where.OR = [
            { assignedTeacherId: user.teacher.id },
            { club: { dayClasses: true } },
        ];
    }

    if (clubId) where.clubId = parseInt(clubId);
    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) {
            where.date.lt = new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000);
        }
    }
    if (status) where.status = status;

    return where;
};

exports.getAll = async (user, query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = await buildListWhere(user, query);

    const [lessons, total] = await Promise.all([
        prisma.lesson.findMany({
            where,
            include: listInclude,
            orderBy: { date: 'asc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.lesson.count({ where }),
    ]);

    return {
        data: lessons,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: {
            club: true,
            teacher: true,
        },
    });

    if (!lesson) {
        throw new AppError('Урок не найден', 404);
    }

    return lesson;
};

exports.create = async (body) => {
    const { clubId, date, startTime, endTime, assignedTeacherId, room, topic } = body;

    const club = await prisma.club.findUnique({
        where: { id: parseInt(clubId) },
    });

    if (!club) {
        throw new AppError('Кружок не найден', 404);
    }

    return prisma.lesson.create({
        data: {
            clubId: parseInt(clubId),
            date: new Date(date),
            startTime,
            endTime,
            room,
            topic,
            status: 'SCHEDULED',
            assignedTeacherId: assignedTeacherId ? parseInt(assignedTeacherId) : club.defaultTeacherId,
        },
        include: createUpdateInclude,
    });
};

exports.createWeekLessons = async ({ weekSchedule }) => {
    const lessons = [];

    for (const weekDay of weekSchedule) {
        for (const lesson of weekDay) {
            const club = await prisma.club.findUnique({
                where: { id: parseInt(lesson.clubId) },
            });

            if (!club) {
                throw new AppError('Кружок не найден', 404);
            }

            lessons.push({
                clubId: parseInt(lesson.clubId),
                date: new Date(lesson.date),
                startTime: lesson.startTime,
                endTime: lesson.endTime,
                room: lesson.room,
                topic: lesson.topic,
                status: 'SCHEDULED',
                assignedTeacherId: lesson.assignedTeacherId
                    ? parseInt(lesson.assignedTeacherId)
                    : club.defaultTeacherId,
            });
        }
    }

    const createdLessons = await prisma.lesson.createMany({
        data: lessons,
    });

    return createdLessons.count;
};

exports.update = async (id, body) => {
    const { clubId, date, startTime, endTime, assignedTeacherId, room, topic } = body;

    return prisma.lesson.update({
        where: { id },
        data: {
            ...(clubId && { clubId: parseInt(clubId) }),
            ...(date && { date: new Date(date) }),
            ...(startTime && { startTime }),
            ...(endTime && { endTime }),
            ...(room !== undefined && { room }),
            ...(topic !== undefined && { topic }),
            assignedTeacherId: assignedTeacherId ? parseInt(assignedTeacherId) : null,
        },
        include: createUpdateInclude,
    });
};

exports.updateStatus = async (id, { status }) => {
    await prisma.lesson.update({
        where: { id },
        data: { status },
    });
};

exports.remove = async (id) => {
    await prisma.lesson.delete({
        where: { id },
    });
};
