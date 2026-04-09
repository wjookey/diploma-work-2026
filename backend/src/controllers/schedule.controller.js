const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const where = {};
        const schedule = await prisma.schedule.findMany({
            include: {
                club: {
                    include: { teacher: true },
                },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });

        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                club: {
                    include: { teacher: true },
                },
            },
        });

        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { clubId, dayOfWeek, startTime, endTime, room } = req.body;

        const club = await prisma.club.findUnique({
            where: { id: parseInt(clubId) },
            include: {
                teacher: true,
            },
        });
        
        if (!club) throw new AppError('Club is not found', 404);

        const schedule = await prisma.schedule.create({
            data: {
                clubId: parseFloat(clubId),
                dayOfWeek: parseInt(dayOfWeek),
                startTime,
                endTime,
                room,
            },
            include: {
                club: {
                    include: { teacher: true },
                },
            },
        });

        res.status(201).json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { clubId, dayOfWeek, startTime, endTime, room } = req.body;

        const schedule = await prisma.schedule.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(clubId && { clubId: parseInt(clubId) }),
                ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(dayOfWeek) }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(room !== undefined && { room }),
            },
            include: {
                club: {
                    include: { teacher: true },
                },
            },
        });

        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await prisma.schedule.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Schedule is deleted' });
    } catch (error) {
        next(error);
    }
};

exports.generateLessons = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            throw new AppError('startDate must be before or equal to endDate', 400);
        }

        const schedule = await prisma.schedule.findMany({
            include: {
                club: true,
            },
        });

        if (schedule.length === 0) throw new AppError('Schedule is empty', 404);

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

        if (lessons.length === 0) throw new AppError('Nothing to generate', 400);

        const createdLessons = await prisma.lesson.createMany({
            data: lessons,
            skipDuplicates: true,
        });

        res.status(201).json({
            success: true,
            message: `Created ${createdLessons.count} lessons`,
            data: { count: createdLessons.count }
        });
    } catch (error) {
        next(error);
    }
};