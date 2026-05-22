const { AppError } = require('../../src/middleware/errorHandler');
const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const familiesControllerPath = require.resolve('../../src/controllers/families.controller');
const familyModelPath = require.resolve('../../src/model/family');

let controller;

const loadController = () => {
    delete require.cache[familyModelPath];
    delete require.cache[familiesControllerPath];
    return require('../../src/controllers/families.controller');
};

const buildTransactionMock = (overrides = {}) => {
    const createdFamily = { id: 1, familyName: 'Семья Тест' };
    const createdUser = { id: 10, email: 'parent@test.local', firstName: 'Иван', lastName: 'Родитель', phone: '79001111111' };
    const createdParent = { id: 20, userId: 10, familyId: 1 };
    const createdChild = { id: 30, firstName: 'Петя', lastName: 'Ребёнок', familyId: 1 };

    const tx = {
        family: {
            create: vi.fn().mockResolvedValue(createdFamily),
            findUnique: vi.fn(),
            delete: vi.fn().mockResolvedValue(createdFamily),
            ...overrides.family,
        },
        user: {
            create: vi.fn().mockResolvedValue(createdUser),
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
            ...overrides.user,
        },
        parent: {
            create: vi.fn().mockResolvedValue(createdParent),
            ...overrides.parent,
        },
        child: {
            create: vi.fn().mockResolvedValue(createdChild),
            ...overrides.child,
        },
    };

    return {
        tx,
        result: {
            family: createdFamily,
            parents: [{ user: createdUser, parent: createdParent }],
            children: [createdChild],
        },
    };
};

describe('families.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sampleFamilies = [{ id: 1, familyName: 'Семья А' }];

        it('returns paginated families without filters', async () => {
            vi.spyOn(prisma.family, 'findMany').mockResolvedValue(sampleFamilies);
            vi.spyOn(prisma.family, 'count').mockResolvedValue(1);

            await controller.getAll(createReq({ query: {} }), res, next);

            expect(prisma.family.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                    skip: 0,
                    take: 20,
                })
            );
            expect(res.body).toEqual({
                success: true,
                data: sampleFamilies,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('adds search filter across family name, parent phone and email', async () => {
            vi.spyOn(prisma.family, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.family, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ query: { search: 'иванов' } }),
                res,
                next
            );

            expect(prisma.family.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { familyName: { contains: 'иванов', mode: 'insensitive' } },
                            { parents: { some: { user: { phone: { contains: 'иванов', mode: 'insensitive' } } } } },
                            { parents: { some: { user: { email: { contains: 'иванов', mode: 'insensitive' } } } } },
                        ],
                    },
                })
            );
        });

        it('applies pagination from query', async () => {
            vi.spyOn(prisma.family, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.family, 'count').mockResolvedValue(40);

            await controller.getAll(
                createReq({ query: { page: '2', limit: '10' } }),
                res,
                next
            );

            expect(prisma.family.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 10, take: 10 })
            );
            expect(res.body.pagination).toMatchObject({
                total: 40,
                page: 2,
                limit: 10,
                totalPages: 4,
            });
        });

        it('forwards errors to next', async () => {
            const dbError = new Error('DB failure');
            vi.spyOn(prisma.family, 'findMany').mockRejectedValue(dbError);
            vi.spyOn(prisma.family, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    describe('getById', () => {
        const family = { id: 5, familyName: 'Семья Тест' };

        it('returns family when found', async () => {
            vi.spyOn(prisma.family, 'findUnique').mockResolvedValue(family);

            await controller.getById(
                createReq({ user: { role: 'ADMIN' }, params: { id: '5' } }),
                res,
                next
            );

            expect(prisma.family.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 5 } })
            );
            expect(res.body).toEqual({ success: true, data: family });
        });

        it('calls next with 404 when family is missing', async () => {
            vi.spyOn(prisma.family, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('Семья не найдена');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        it('returns 403 when parent requests another family', async () => {
            vi.spyOn(prisma.family, 'findUnique').mockResolvedValue({ id: 99, familyName: 'Чужая' });

            await controller.getById(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '99' },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Forbidden', statusCode: 403 })
            );
        });

        it('allows parent to read own family', async () => {
            vi.spyOn(prisma.family, 'findUnique').mockResolvedValue({ id: 10, familyName: 'Своя' });

            await controller.getById(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '10' },
                }),
                res,
                next
            );

            expect(res.body.success).toBe(true);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('create', () => {
        const createBody = {
            familyName: 'Новая семья',
            parents: [
                {
                    user: {
                        email: 'parent@test.local',
                        firstName: 'Иван',
                        lastName: 'Родитель',
                        phone: '79001111111',
                    },
                },
            ],
            children: [
                { firstName: 'Петя', lastName: 'Ребёнок', birthDate: '2018-03-10', note: 'заметка' },
            ],
        };

        it('creates family with parents and children in transaction', async () => {
            const { tx, result } = buildTransactionMock();
            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));
            vi.spyOn(prisma.family, 'findUnique').mockResolvedValue({
                id: 1,
                familyName: 'Семья Тест',
                parents: [],
                children: [],
            });

            await controller.create(createReq({ body: createBody }), res, next);

            expect(tx.family.create).toHaveBeenCalledWith({ data: { familyName: 'Новая семья' } });
            expect(tx.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'parent@test.local',
                    firstName: 'Иван',
                    lastName: 'Родитель',
                    phone: '79001111111',
                    role: 'PARENT',
                },
            });
            expect(tx.parent.create).toHaveBeenCalledWith({
                data: { userId: 10, familyId: 1 },
            });
            expect(tx.child.create).toHaveBeenCalledWith({
                data: {
                    firstName: 'Петя',
                    lastName: 'Ребёнок',
                    birthDate: new Date('2018-03-10'),
                    familyId: 1,
                    note: 'заметка',
                },
            });
            expect(prisma.family.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: result.family.id } })
            );
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('sets null birthDate and note when omitted', async () => {
            const { tx } = buildTransactionMock();
            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));
            vi.spyOn(prisma.family, 'findUnique').mockResolvedValue({ id: 1 });

            await controller.create(
                createReq({
                    body: {
                        familyName: 'Семья',
                        parents: createBody.parents,
                        children: [{ firstName: 'Аня', lastName: 'Ребёнок' }],
                    },
                }),
                res,
                next
            );

            expect(tx.child.create).toHaveBeenCalledWith({
                data: {
                    firstName: 'Аня',
                    lastName: 'Ребёнок',
                    birthDate: null,
                    familyId: 1,
                    note: null,
                },
            });
        });

        it('forwards transaction errors to next', async () => {
            const err = new Error('transaction failed');
            vi.spyOn(prisma, '$transaction').mockRejectedValue(err);

            await controller.create(createReq({ body: createBody }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('update', () => {
        it('updates familyName', async () => {
            const updated = { id: 3, familyName: 'Обновлённая' };
            vi.spyOn(prisma.family, 'update').mockResolvedValue(updated);

            await controller.update(
                createReq({ params: { id: '3' }, body: { familyName: 'Обновлённая' } }),
                res,
                next
            );

            expect(prisma.family.update).toHaveBeenCalledWith({
                where: { id: 3 },
                data: { familyName: 'Обновлённая' },
            });
            expect(res.body).toEqual({ success: true, data: updated });
        });

        it('sends empty data object when familyName is missing', async () => {
            vi.spyOn(prisma.family, 'update').mockResolvedValue({ id: 3, familyName: 'Старая' });

            await controller.update(
                createReq({ params: { id: '3' }, body: {} }),
                res,
                next
            );

            expect(prisma.family.update.mock.calls[0][0].data).toEqual({});
        });

        it('forwards update errors to next', async () => {
            const err = new Error('update failed');
            vi.spyOn(prisma.family, 'update').mockRejectedValue(err);

            await controller.update(
                createReq({ params: { id: '3' }, body: { familyName: 'X' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('remove', () => {
        it('deletes parents users and family in transaction', async () => {
            const family = {
                id: 7,
                parents: [{ userId: 10 }, { userId: 11 }],
                children: [{ id: 1 }],
            };
            const { tx } = buildTransactionMock();
            tx.family.findUnique.mockResolvedValue(family);

            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));

            await controller.remove(
                createReq({ params: { id: '7' } }),
                res,
                next
            );

            expect(tx.family.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 7 } })
            );
            expect(tx.user.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: [10, 11] } },
            });
            expect(tx.family.delete).toHaveBeenCalledWith({ where: { id: 7 } });
            expect(res.body).toEqual({ success: true, message: 'Family is deleted' });
        });

        it('skips user deletion when family has no parents', async () => {
            const { tx } = buildTransactionMock();
            tx.family.findUnique.mockResolvedValue({
                id: 7,
                parents: [],
                children: [],
            });

            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));

            await controller.remove(createReq({ params: { id: '7' } }), res, next);

            expect(tx.user.deleteMany).not.toHaveBeenCalled();
            expect(tx.family.delete).toHaveBeenCalledWith({ where: { id: 7 } });
        });

        it('forwards 404 from transaction when family is missing', async () => {
            const { tx } = buildTransactionMock();
            tx.family.findUnique.mockResolvedValue(null);

            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));

            await controller.remove(createReq({ params: { id: '999' } }), res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Семья не найдена', statusCode: 404 })
            );
        });

        it('forwards transaction errors to next', async () => {
            const err = new Error('delete transaction failed');
            vi.spyOn(prisma, '$transaction').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '7' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
