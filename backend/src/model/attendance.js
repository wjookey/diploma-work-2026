const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const attendanceListInclude = {
    lesson: {
        include: {
            club: { select: { id: true, name: true } },
        },
    },
    child: { select: { id: true, firstName: true, lastName: true } },
    teacher: {
        include: {
            user: { select: { firstName: true, lastName: true } },
        },
    },
};

const buildListWhere = ({ childId, familyId, dateFrom, dateTo }) => {
    const where = {};

    if (childId) where.childId = parseInt(childId);
    if (familyId) {
        where.child = {};
        where.child.familyId = parseInt(familyId);
    }
    if (dateFrom || dateTo) {
        where.lesson = { date: {} };
        if (dateFrom) where.lesson.date.gte = new Date(dateFrom);
        if (dateTo) {
            where.lesson.date.lt = new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000);
        }
    }

    return where;
};

const activatePendingSubscription = async (clubId, childId) => {
    const pendingSubscription = await prisma.subscription.findFirst({
        where: { clubId, childId, status: 'PENDING' },
    });

    const activeSubscriptionCount = await prisma.subscription.count({
        where: { clubId, childId, status: 'ACTIVE' },
    });

    if (pendingSubscription && activeSubscriptionCount === 0) {
        let date = new Date();
        date = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1,
            3, 0, 0, 0
        );

        await prisma.subscription.update({
            where: { id: pendingSubscription.id },
            data: {
                status: 'ACTIVE',
                startDate: date,
            },
        });
    }
};

const processScheduledLessonSubscription = async (lesson, record) => {
    const activeSubscription = await prisma.subscription.findUnique({
        where: {
            id: parseInt(record.subId),
        },
        include: {
            clubService: true,
        },
    });

    if (!record.isPresent && activeSubscription.clubService.freezedLesson !== 0 && activeSubscription.usedFreezes < activeSubscription.clubService.freezedLesson) {
        const updatedUsedFreezes = activeSubscription.usedFreezes + 1;

        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                usedFreezes: updatedUsedFreezes,
                stateUpdateDate: new Date(),
            },
        });
    } else {
        const updatedRemainingLessons = activeSubscription.remainingLessons - 1;
        const isExpired = updatedRemainingLessons === 0;

        await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
                remainingLessons: updatedRemainingLessons,
                stateUpdateDate: new Date(),
                ...(isExpired && { status: 'EXPIRED' }),
                ...(isExpired && { endDate: lesson.date }),
            },
        });

        if (isExpired) {
            await activatePendingSubscription(activeSubscription.clubId, activeSubscription.childId);
        }
    }
};

const processCompletedLessonSubscription = async (lesson, record, prevAttendance) => {
    const subscriptionWhere = {};
    const lessonDate = lesson.date;
    subscriptionWhere.stateUpdateDate = {
        gte: new Date(lessonDate.setHours(0, 0, 0, 0)),
        lte: new Date(lessonDate.setHours(23, 59, 59, 999)),
    };
    subscriptionWhere.childId = parseInt(record.childId);
    subscriptionWhere.clubId = parseInt(lesson.clubId);

    const subscription = await prisma.subscription.findFirst({
        where: subscriptionWhere,
        include: {
            clubService: true,
        },
    });

    if (!subscription) {
        return;
    }

    if (subscription.status === 'EXPIRED') {
        if (prevAttendance.isPresent && !record.isPresent) {
            if (subscription.clubService.freezedLesson !== 0 && subscription.usedFreezes < subscription.clubService.freezedLesson) {
                const updatedUsedFreezes = subscription.usedFreezes + 1;
                const updatedRemainingLessons = subscription.remainingLessons + 1;

                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        remainingLessons: updatedRemainingLessons,
                        usedFreezes: updatedUsedFreezes,
                        status: 'ACTIVE',
                    },
                });
            }
        }
    } else if (subscription.status === 'ACTIVE') {
        if (prevAttendance.isPresent && !record.isPresent) {
            if (subscription.clubService.freezedLesson !== 0 && subscription.usedFreezes < subscription.clubService.freezedLesson) {
                const updatedUsedFreezes = subscription.usedFreezes + 1;
                const updatedRemainingLessons = subscription.remainingLessons + 1;

                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        remainingLessons: updatedRemainingLessons,
                        usedFreezes: updatedUsedFreezes,
                    },
                });
            }
        } else if (!prevAttendance.isPresent && record.isPresent) {
            const absentWhere = {};
            absentWhere.lesson = {
                date: { gte: subscription.startDate, lte: new Date() },
                clubId: lesson.clubId,
            };
            absentWhere.childId = parseInt(record.childId);
            absentWhere.isPresent = false;

            const absentCount = await prisma.attendance.count({
                where: absentWhere,
            });

            if (subscription.clubService.freezedLesson !== 0 && absentCount <= subscription.clubService.freezedLesson) {
                const updatedUsedFreezes = subscription.usedFreezes - 1;
                const updatedRemainingLessons = subscription.remainingLessons - 1;
                const isExpired = updatedRemainingLessons === 0;

                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        remainingLessons: updatedRemainingLessons,
                        usedFreezes: updatedUsedFreezes,
                        ...(isExpired && { status: 'EXPIRED' }),
                    },
                });

                if (isExpired) {
                    await activatePendingSubscription(subscription.clubId, subscription.childId);
                }
            }
        }
    }
};

exports.getAll = async (query) => {
    const { childId, familyId, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere({ childId, familyId, dateFrom, dateTo });

    const [attendances, total] = await Promise.all([
        prisma.attendance.findMany({
            where,
            include: attendanceListInclude,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.attendance.count({ where }),
    ]);

    return {
        data: attendances,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getByLesson = async (lessonId) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            club: true,
            teacher: {
                include: { user: { select: { firstName: true, lastName: true } } },
            },
            attendances: {
                include: {
                    child: { select: { id: true, firstName: true, lastName: true } },
                },
            },
        },
    });

    if (!lesson) {
        throw new AppError('Урок не найден', 404);
    }

    return lesson;
};

exports.markAttendance = async ({ lessonId, attendances, user }) => {
    const teacherId = user.role === 'TEACHER' ? user.teacher.id : null;

    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) },
    });

    if (lesson.date.toDateString() !== new Date().toDateString()) {
        throw new AppError('Посещаемость может быть отмечена только в день проведения занятия', 403);
    }

    const results = [];

    for (const record of attendances) {
        const prevAttendance = await prisma.attendance.findUnique({
            where: {
                lessonId_childId: {
                    lessonId: parseInt(lessonId),
                    childId: parseInt(record.childId),
                },
            },
        });

        const teacherRelation = teacherId
            ? { teacher: { connect: { id: teacherId } } }
            : { teacher: { disconnect: true } };

        const result = await prisma.attendance.upsert({
            where: {
                lessonId_childId: {
                    lessonId: parseInt(lessonId),
                    childId: parseInt(record.childId),
                },
            },
            update: {
                isPresent: record.isPresent,
                note: record.note || null,
                ...teacherRelation,
            },
            create: {
                lesson: {
                    connect: { id: parseInt(lessonId) },
                },
                child: {
                    connect: { id: parseInt(record.childId) },
                },
                isPresent: record.isPresent,
                note: record.note || null,
                ...(teacherId ? { teacher: { connect: { id: teacherId } } } : {}),
            },
        });
        results.push(result);

        if (lesson && lesson.status === 'SCHEDULED') {
            await processScheduledLessonSubscription(lesson, record);
        } else if (lesson && lesson.status === 'COMPLETED') {
            await processCompletedLessonSubscription(lesson, record, prevAttendance);
        }
    }

    if (lesson.status === 'SCHEDULED') {
        await prisma.lesson.update({
            where: { id: lesson.id },
            data: { status: 'COMPLETED' },
        });
    }

    return results;
};
