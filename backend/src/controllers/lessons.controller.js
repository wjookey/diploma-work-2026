const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { clubId, dateFrom, dateTo, status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (req.user.role === 'PARENT') {
            const children = await prisma.child.findMany({
                where: { familyId: req.user.parent.familyId },
                select: { id: true },
            });
            const childIds = children.map(child => child.id);

            const subscriptions = await prisma.subscription.findMany({
                where: {
                    childId: { in: childIds },
                    status: 'ACTIVE',
                },
                select: { clubId: true, startDate: true, endDate: true },
            });

            if (subscriptions.length !== 0) {
                const clubIds = subscriptions.map(subscription => subscription.clubId);
                where.clubId = { in: clubIds };
            }
        }

        if (req.user.role === 'TEACHER') {
            where.OR = [
                { assignedTeacherId: req.user.teacher.id },
                { club: { dayClasses: true } },
            ];
        }

        if (clubId) where.clubId = parseInt(clubId);
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) where.date.gte = new Date(dateFrom);
            if (dateTo) where.date.lt = new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000);
        }
        if (status) where.status = status;

        const [lessons, total] = await Promise.all([
            prisma.lesson.findMany({
                where,
                include: {
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
                },
                orderBy: { date: 'asc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.lesson.count({ where }),
        ]);

        res.json({
            success: true,
            data: lessons,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                club: true,
                teacher: true,
            },
        });

        if (!lesson) throw new AppError('Урок не найден', 404);

        res.json({ success: true, data: lesson });
    } catch (error) {
        next(error);
    }
}

exports.create = async (req, res, next) => {
    try {
        const { clubId, date, startTime, endTime, assignedTeacherId, room, topic } = req.body;

        const club = await prisma.club.findUnique({
            where: { id: parseInt(clubId) },
        });

        if (!club) throw new AppError('Кружок не найден', 404);

        const lesson = await prisma.lesson.create({
            data: {
                clubId: parseInt(clubId),
                date: new Date(date),
                startTime,
                endTime,
                room,
                topic,
                status: "SCHEDULED",
                assignedTeacherId: assignedTeacherId ? parseInt(assignedTeacherId) : club.defaultTeacherId,
            },
            include: {
                club: { select: { id: true, name: true } },
                teacher: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        res.status(201).json({ success: true, data: lesson });
    } catch (error) {
        next(error);
    }
};

exports.createWeekLessons = async (req, res, next) => {
    try {
        const { weekSchedule } = req.body;

        const lessons = [];
        for (const weekDay of weekSchedule) {
            for (const lesson of weekDay) {
                const club = await prisma.club.findUnique({
                    where: { id: parseInt(lesson.clubId) },
                });

                if (!club) throw new AppError('Кружок не найден', 404);

                lessons.push({
                    clubId: parseInt(lesson.clubId),
                    date: new Date(lesson.date),
                    startTime: lesson.startTime,
                    endTime: lesson.endTime,
                    room: lesson.room,
                    topic: lesson.topic,
                    status: 'SCHEDULED',
                    assignedTeacherId: lesson.assignedTeacherId ? parseInt(lesson.assignedTeacherId) : club.defaultTeacherId,
                });
            }
        }

        // const lessons = await Promise.all(
        //     weekSchedule.map(weekDay => {
        //         const club = prisma.club.findUnique({
        //             where: { id: weekDay.clubId },
        //         });

        //         return {
        //             clubId: parseInt(weekDay.clubId),
        //             date: new Date(weekDay.date),
        //             startTime: weekDay.startTime,
        //             endTime: weekDay.endTime,
        //             room: weekDay.room,
        //             topic: weekDay.topic,
        //             status: 'SCHEDULED',
        //             assignedTeacherId: weekDay.assignedTeacherId ? parseInt(weekDay.assignedTeacherId) : club.defaultTeacherId,
        //         };
        //     })
        // );

        const createdLessons = await prisma.lesson.createMany({
            data: lessons,
        });

        res.status(201).json({
            success: true,
            message: `${createdLessons.count} is created`,
            data: createdLessons.count,
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { clubId, date, startTime, endTime, assignedTeacherId, room, topic } = req.body;

        const lesson = await prisma.lesson.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(clubId && { clubId: parseInt(clubId) }),
                ...(date && { date: new Date(date) }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(assignedTeacherId && { assignedTeacherId: parseInt(assignedTeacherId) }),
                ...(room !== undefined && { room }),
                ...(topic !== undefined && { topic }),
            },
            include: {
                club: { select: { id: true, name: true } },
                teacher: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        res.json({ success: true, data: lesson });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        await prisma.lesson.update({
            where: { id: parseInt(req.params.id) },
            data: { status },
        });

        res.json({ success: true, message: 'Status is updated' });
    } catch (error) {
        next(error);
    }
}

exports.remove = async (req, res, next) => {
    try {
        await prisma.lesson.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Lesson is deleted' });
    } catch (error) {
        next(error);
    }
};
