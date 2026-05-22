const { AppError } = require('../../src/middleware/errorHandler');
const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const usersControllerPath = require.resolve('../../src/controllers/users.controller');
const userModelPath = require.resolve('../../src/model/user');

let controller;

const loadController = () => {
    delete require.cache[userModelPath];
    delete require.cache[usersControllerPath];
    return require('../../src/controllers/users.controller');
};

describe('users.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sampleUsers = [{ id: 1, firstName: 'Иван', role: 'ADMIN' }];

        it('returns paginated users without filters', async () => {
            vi.spyOn(prisma.user, 'findMany').mockResolvedValue(sampleUsers);
            vi.spyOn(prisma.user, 'count').mockResolvedValue(1);

            await controller.getAll(createReq({ user: { role: 'ADMIN' }, query: {} }), res, next);

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                    skip: 0,
                    take: 20,
                })
            );
            expect(res.body).toEqual({
                success: true,
                data: sampleUsers,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('filters by role', async () => {
            vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.user, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ query: { role: 'TEACHER' } }),
                res,
                next
            );

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { role: 'TEACHER' } })
            );
        });

        it('adds case-insensitive search across name, email and phone', async () => {
            vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.user, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ query: { search: 'ivan@test' } }),
                res,
                next
            );

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { firstName: { contains: 'ivan@test', mode: 'insensitive' } },
                            { lastName: { contains: 'ivan@test', mode: 'insensitive' } },
                            { email: { contains: 'ivan@test', mode: 'insensitive' } },
                            { phone: { contains: 'ivan@test', mode: 'insensitive' } },
                        ],
                    },
                })
            );
        });

        it('applies pagination from query', async () => {
            vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.user, 'count').mockResolvedValue(100);

            await controller.getAll(
                createReq({ query: { page: '2', limit: '25' } }),
                res,
                next
            );

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 25, take: 25 })
            );
            expect(res.body.pagination).toMatchObject({
                total: 100,
                page: 2,
                limit: 25,
                totalPages: 4,
            });
        });

        it('forwards errors to next', async () => {
            const dbError = new Error('DB failure');
            vi.spyOn(prisma.user, 'findMany').mockRejectedValue(dbError);
            vi.spyOn(prisma.user, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    describe('getById', () => {
        const user = { id: 5, firstName: 'Иван', role: 'ADMIN' };

        it('returns user when found', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

            await controller.getById(
                createReq({ params: { id: '5' } }),
                res,
                next
            );

            expect(prisma.user.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 5 } })
            );
            expect(res.body).toEqual({ success: true, data: user });
        });

        it('calls next with 404 when user is missing', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('Пользователь не найден');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('create', () => {
        const createdUser = {
            id: 10,
            email: 'new@test.local',
            firstName: 'Новый',
            lastName: 'Пользователь',
            phone: '79001234567',
            role: 'ADMIN',
        };

        it('creates admin user without nested relations', async () => {
            vi.spyOn(prisma.user, 'create').mockResolvedValue(createdUser);

            await controller.create(
                createReq({
                    user: { role: 'ADMIN' },
                    body: {
                        email: 'new@test.local',
                        firstName: 'Новый',
                        lastName: 'Пользователь',
                        phone: '79001234567',
                        role: 'ADMIN',
                    },
                }),
                res,
                next
            );

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'new@test.local',
                    firstName: 'Новый',
                    lastName: 'Пользователь',
                    phone: '79001234567',
                    role: 'ADMIN',
                },
                select: expect.any(Object),
            });
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true, data: createdUser });
        });

        it('creates teacher with nested teacher profile', async () => {
            vi.spyOn(prisma.user, 'create').mockResolvedValue({
                ...createdUser,
                role: 'TEACHER',
                teacher: { id: 3 },
            });

            await controller.create(
                createReq({
                    body: {
                        email: 'teacher@test.local',
                        firstName: 'Учитель',
                        lastName: 'Тест',
                        phone: '79001111111',
                        role: 'TEACHER',
                        specialty: 'Плавание',
                        bio: 'Опыт 10 лет',
                    },
                }),
                res,
                next
            );

            expect(prisma.user.create.mock.calls[0][0].data).toMatchObject({
                role: 'TEACHER',
                teacher: { create: { specialty: 'Плавание', bio: 'Опыт 10 лет' } },
            });
        });

        it('creates parent with familyId from body for admin', async () => {
            vi.spyOn(prisma.user, 'create').mockResolvedValue({
                ...createdUser,
                role: 'PARENT',
                parent: { id: 7 },
            });

            await controller.create(
                createReq({
                    user: { role: 'ADMIN', parent: { familyId: 1 } },
                    body: {
                        email: 'parent@test.local',
                        firstName: 'Родитель',
                        lastName: 'Тест',
                        phone: '79002222222',
                        role: 'PARENT',
                        familyId: 15,
                    },
                }),
                res,
                next
            );

            expect(prisma.user.create.mock.calls[0][0].data.parent).toEqual({
                create: {
                    family: { connect: { id: 15 } },
                },
            });
        });

        it('creates parent using caller familyId when creator is parent', async () => {
            vi.spyOn(prisma.user, 'create').mockResolvedValue({
                ...createdUser,
                role: 'PARENT',
                parent: { id: 8 },
            });

            await controller.create(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 42 } },
                    body: {
                        email: 'parent2@test.local',
                        firstName: 'Родитель',
                        lastName: 'Два',
                        phone: '79003333333',
                        role: 'PARENT',
                        familyId: 99,
                    },
                }),
                res,
                next
            );

            expect(prisma.user.create.mock.calls[0][0].data.parent.create.family.connect).toEqual({
                id: 42,
            });
        });
    });

    describe('update', () => {
        const updatedUser = {
            id: 5,
            firstName: 'Обновлён',
            lastName: 'Тест',
            phone: '79004444444',
            email: 'upd@test.local',
            role: 'ADMIN',
        };

        it('updates user fields for admin', async () => {
            vi.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

            await controller.update(
                createReq({
                    user: { role: 'ADMIN', id: 1 },
                    params: { id: '5' },
                    body: {
                        firstName: 'Обновлён',
                        lastName: 'Тест',
                        phone: '79004444444',
                        email: 'upd@test.local',
                    },
                }),
                res,
                next
            );

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 5 },
                data: {
                    firstName: 'Обновлён',
                    lastName: 'Тест',
                    phone: '79004444444',
                    email: 'upd@test.local',
                },
                select: expect.any(Object),
            });
            expect(res.body).toEqual({ success: true, data: updatedUser });
        });

        it('returns 403 when parent updates user from another family', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
                id: 5,
                parent: { familyId: 99 },
            });
            const updateSpy = vi.spyOn(prisma.user, 'update');

            await controller.update(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '5' },
                    body: { firstName: 'Хак' },
                }),
                res,
                next
            );

            expect(updateSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Forbidden', statusCode: 403 })
            );
        });

        it('allows parent to update user from same family', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
                id: 5,
                parent: { familyId: 10 },
            });
            vi.spyOn(prisma.user, 'update').mockResolvedValue({
                ...updatedUser,
                role: 'PARENT',
                parent: { id: 3 },
            });
            vi.spyOn(prisma.parent, 'update').mockResolvedValue({ id: 3, familyId: 10 });

            await controller.update(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '5' },
                    body: { firstName: 'Свой' },
                }),
                res,
                next
            );

            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 5 },
                    data: { firstName: 'Свой' },
                })
            );
        });

        it('returns 403 when teacher updates another user', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 99 });
            const updateSpy = vi.spyOn(prisma.user, 'update');

            await controller.update(
                createReq({
                    user: { role: 'TEACHER', id: 7 },
                    params: { id: '99' },
                    body: { firstName: 'Хак' },
                }),
                res,
                next
            );

            expect(updateSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Forbidden', statusCode: 403 })
            );
        });

        it('allows teacher to update own profile', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 7 });
            vi.spyOn(prisma.user, 'update').mockResolvedValue({
                ...updatedUser,
                role: 'TEACHER',
                teacher: { id: 4 },
            });

            await controller.update(
                createReq({
                    user: { role: 'TEACHER', id: 7 },
                    params: { id: '7' },
                    body: { firstName: 'Учитель' },
                }),
                res,
                next
            );

            expect(prisma.user.update).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('updates teacher specialty and bio when provided', async () => {
            vi.spyOn(prisma.user, 'update').mockResolvedValue({
                id: 7,
                role: 'TEACHER',
                teacher: { id: 4 },
            });
            vi.spyOn(prisma.teacher, 'update').mockResolvedValue({ id: 4 });

            await controller.update(
                createReq({
                    user: { role: 'ADMIN', id: 1 },
                    params: { id: '7' },
                    body: { specialty: 'Йога', bio: 'Новое био' },
                }),
                res,
                next
            );

            expect(prisma.teacher.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: { specialty: 'Йога', bio: 'Новое био' },
            });
        });

        it('updates parent familyId when provided', async () => {
            vi.spyOn(prisma.user, 'update').mockResolvedValue({
                id: 5,
                role: 'PARENT',
                parent: { id: 3 },
            });
            vi.spyOn(prisma.parent, 'update').mockResolvedValue({ id: 3, familyId: 20 });

            await controller.update(
                createReq({
                    user: { role: 'ADMIN', id: 1 },
                    params: { id: '5' },
                    body: { familyId: 20 },
                }),
                res,
                next
            );

            expect(prisma.parent.update).toHaveBeenCalledWith({
                where: { id: 3 },
                data: { familyId: 20 },
            });
        });

        it('skips teacher profile update when user is not a teacher', async () => {
            vi.spyOn(prisma.user, 'update').mockResolvedValue({
                id: 5,
                role: 'ADMIN',
                teacher: null,
            });
            const teacherUpdateSpy = vi.spyOn(prisma.teacher, 'update');

            await controller.update(
                createReq({
                    user: { role: 'ADMIN' },
                    params: { id: '5' },
                    body: { specialty: 'Йога' },
                }),
                res,
                next
            );

            expect(teacherUpdateSpy).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('deletes user and returns success message', async () => {
            vi.spyOn(prisma.user, 'delete').mockResolvedValue({ id: 12 });

            await controller.remove(
                createReq({ params: { id: '12' } }),
                res,
                next
            );

            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 12 } });
            expect(res.body).toEqual({ success: true, message: 'User is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.user, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '12' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
