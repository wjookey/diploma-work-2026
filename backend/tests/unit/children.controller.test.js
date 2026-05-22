const { AppError } = require('../../src/middleware/errorHandler');
const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const childrenControllerPath = require.resolve('../../src/controllers/children.controller');
const childModelPath = require.resolve('../../src/model/child');

let controller;

const loadController = () => {
    delete require.cache[childModelPath];
    delete require.cache[childrenControllerPath];
    return require('../../src/controllers/children.controller');
};

describe('children.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sampleChildren = [{ id: 1, firstName: 'Иван' }];

        it('returns paginated list for admin without family filter', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue(sampleChildren);
            vi.spyOn(prisma.child, 'count').mockResolvedValue(1);

            const req = createReq({ user: { role: 'ADMIN' }, query: {} });

            await controller.getAll(req, res, next);

            expect(prisma.child.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                    skip: 0,
                    take: 20,
                })
            );
            expect(res.body).toEqual({
                success: true,
                data: sampleChildren,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('restricts list to parent family', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.child, 'count').mockResolvedValue(0);

            const req = createReq({
                user: { role: 'PARENT', parent: { familyId: 42 } },
            });

            await controller.getAll(req, res, next);

            expect(prisma.child.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { familyId: 42 } })
            );
        });

        it('filters by familyId for admin', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.child, 'count').mockResolvedValue(0);

            const req = createReq({
                user: { role: 'ADMIN' },
                query: { familyId: '7' },
            });

            await controller.getAll(req, res, next);

            expect(prisma.child.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { familyId: 7 } })
            );
        });

        it('ignores familyId query for parent', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.child, 'count').mockResolvedValue(0);

            const req = createReq({
                user: { role: 'PARENT', parent: { familyId: 42 } },
                query: { familyId: '99' },
            });

            await controller.getAll(req, res, next);

            expect(prisma.child.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { familyId: 42 } })
            );
        });

        it('adds case-insensitive search filter', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.child, 'count').mockResolvedValue(0);

            const req = createReq({
                user: { role: 'ADMIN' },
                query: { search: 'иван' },
            });

            await controller.getAll(req, res, next);

            expect(prisma.child.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { firstName: { contains: 'иван', mode: 'insensitive' } },
                            { lastName: { contains: 'иван', mode: 'insensitive' } },
                        ],
                    },
                })
            );
        });

        it('applies pagination from query', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.child, 'count').mockResolvedValue(50);

            const req = createReq({
                user: { role: 'ADMIN' },
                query: { page: '3', limit: '10' },
            });

            await controller.getAll(req, res, next);

            expect(prisma.child.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 20, take: 10 })
            );
            expect(res.body.pagination).toMatchObject({
                total: 50,
                page: 3,
                limit: 10,
                totalPages: 5,
            });
        });

        it('forwards errors to next', async () => {
            const dbError = new Error('DB failure');
            vi.spyOn(prisma.child, 'findMany').mockRejectedValue(dbError);
            vi.spyOn(prisma.child, 'count').mockResolvedValue(0);

            await controller.getAll(createReq({ user: { role: 'ADMIN' } }), res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    describe('getById', () => {
        const child = { id: 5, firstName: 'Иван', familyId: 10 };

        it('returns child when found', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue(child);

            const req = createReq({
                user: { role: 'ADMIN' },
                params: { id: '5' },
            });

            await controller.getById(req, res, next);

            expect(prisma.child.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 5 } })
            );
            expect(res.body).toEqual({ success: true, data: child });
        });

        it('calls next with 404 when child is missing', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ user: { role: 'ADMIN' }, params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('Ребёнок не найден');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        it('returns 403 when parent requests another family child', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue({ id: 5, familyId: 99 });

            await controller.getById(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '5' },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Forbidden', statusCode: 403 })
            );
        });

        it('allows parent to read own family child', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue({ id: 5, familyId: 10 });

            await controller.getById(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '5' },
                }),
                res,
                next
            );

            expect(res.body.success).toBe(true);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('create', () => {
        const created = { id: 1, firstName: 'Алиса', lastName: 'Новая', familyId: 2 };

        it('creates child for admin with familyId from body', async () => {
            vi.spyOn(prisma.child, 'create').mockResolvedValue(created);

            const req = createReq({
                user: { role: 'ADMIN' },
                body: {
                    firstName: 'Алиса',
                    lastName: 'Новая',
                    familyId: 2,
                    note: 'заметка',
                },
            });

            await controller.create(req, res, next);

            expect(prisma.child.create).toHaveBeenCalledWith({
                data: {
                    firstName: 'Алиса',
                    lastName: 'Новая',
                    birthDate: null,
                    familyId: 2,
                    note: 'заметка',
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ success: true, data: created });
        });

        it('uses parent familyId regardless of body.familyId', async () => {
            vi.spyOn(prisma.child, 'create').mockResolvedValue({ ...created, familyId: 42 });

            await controller.create(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 42 } },
                    body: {
                        firstName: 'Маша',
                        lastName: 'Родная',
                        familyId: 999,
                    },
                }),
                res,
                next
            );

            expect(prisma.child.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ familyId: 42 }),
                })
            );
        });

        it('parses birthDate when provided', async () => {
            vi.spyOn(prisma.child, 'create').mockResolvedValue(created);
            const birthDate = '2015-06-15';

            await controller.create(
                createReq({
                    user: { role: 'ADMIN' },
                    body: { firstName: 'A', lastName: 'B', familyId: 1, birthDate },
                }),
                res,
                next
            );

            expect(prisma.child.create.mock.calls[0][0].data.birthDate).toEqual(
                new Date(birthDate)
            );
        });
    });

    describe('update', () => {
        it('skips family check for admin', async () => {
            const findUniqueSpy = vi.spyOn(prisma.child, 'findUnique');
            vi.spyOn(prisma.child, 'update').mockResolvedValue({ id: 3, note: 'ok' });

            await controller.update(
                createReq({
                    user: { role: 'ADMIN' },
                    params: { id: '3' },
                    body: { note: 'ok' },
                }),
                res,
                next
            );

            expect(findUniqueSpy).not.toHaveBeenCalled();
            expect(prisma.child.update).toHaveBeenCalledWith({
                where: { id: 3 },
                data: { note: 'ok' },
            });
            expect(res.body.data.note).toBe('ok');
        });

        it('returns 403 when parent updates another family child', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue({ id: 3, familyId: 99 });
            const updateSpy = vi.spyOn(prisma.child, 'update');

            await controller.update(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '3' },
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

        it('updates own family child for parent', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue({ id: 3, familyId: 10 });
            vi.spyOn(prisma.child, 'update').mockResolvedValue({ id: 3, firstName: 'Новое' });

            await controller.update(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '3' },
                    body: { firstName: 'Новое' },
                }),
                res,
                next
            );

            expect(prisma.child.update).toHaveBeenCalledWith({
                where: { id: 3 },
                data: { firstName: 'Новое' },
            });
        });

        it('clears birthDate when birthDate is null in body', async () => {
            vi.spyOn(prisma.child, 'update').mockResolvedValue({ id: 3, birthDate: null });

            await controller.update(
                createReq({
                    user: { role: 'ADMIN' },
                    params: { id: '3' },
                    body: { birthDate: null },
                }),
                res,
                next
            );

            expect(prisma.child.update.mock.calls[0][0].data).toEqual({ birthDate: null });
        });

        it('updates familyId when provided', async () => {
            vi.spyOn(prisma.child, 'update').mockResolvedValue({ id: 3, familyId: 7 });

            await controller.update(
                createReq({
                    user: { role: 'ADMIN' },
                    params: { id: '3' },
                    body: { familyId: 7 },
                }),
                res,
                next
            );

            expect(prisma.child.update.mock.calls[0][0].data).toEqual({ familyId: 7 });
        });
    });

    describe('remove', () => {
        it('deletes child (related records cascade in DB)', async () => {
            vi.spyOn(prisma.child, 'delete').mockResolvedValue({ id: 8 });

            await controller.remove(
                createReq({ user: { role: 'ADMIN' }, params: { id: '8' } }),
                res,
                next
            );

            expect(prisma.child.delete).toHaveBeenCalledWith({ where: { id: 8 } });
            expect(res.body).toEqual({ success: true, message: 'Record is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.child, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '8' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
