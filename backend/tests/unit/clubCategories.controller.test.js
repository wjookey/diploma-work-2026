const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const clubCategoriesControllerPath = require.resolve('../../src/controllers/clubCategories.controller');
const clubCategoryModelPath = require.resolve('../../src/model/clubCategory');

let controller;

const loadController = () => {
    delete require.cache[clubCategoryModelPath];
    delete require.cache[clubCategoriesControllerPath];
    return require('../../src/controllers/clubCategories.controller');
};

describe('clubCategories.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, name: 'Спорт', isActive: true }];

        it('returns paginated categories without filters', async () => {
            vi.spyOn(prisma.clubCategory, 'findMany').mockResolvedValue(sample);
            vi.spyOn(prisma.clubCategory, 'count').mockResolvedValue(1);

            await controller.getAll(createReq({ query: {} }), res, next);

            expect(prisma.clubCategory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sample,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('filters by isActive and search', async () => {
            vi.spyOn(prisma.clubCategory, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.clubCategory, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ query: { isActive: 'true', search: 'спорт' } }),
                res,
                next
            );

            expect(prisma.clubCategory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        isActive: true,
                        OR: [{ name: { contains: 'спорт', mode: 'insensitive' } }],
                    },
                })
            );
        });

        it('parses isActive=false from query string', async () => {
            vi.spyOn(prisma.clubCategory, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.clubCategory, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ query: { isActive: 'false' } }),
                res,
                next
            );

            expect(prisma.clubCategory.findMany.mock.calls[0][0].where.isActive).toBe(false);
        });

        it('applies pagination from query', async () => {
            vi.spyOn(prisma.clubCategory, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.clubCategory, 'count').mockResolvedValue(50);

            await controller.getAll(
                createReq({ query: { page: '3', limit: '10' } }),
                res,
                next
            );

            expect(prisma.clubCategory.findMany).toHaveBeenCalledWith(
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
            const err = new Error('DB failure');
            vi.spyOn(prisma.clubCategory, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.clubCategory, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const category = { id: 2, name: 'Творчество', clubs: [] };

        it('returns category when found', async () => {
            vi.spyOn(prisma.clubCategory, 'findUnique').mockResolvedValue(category);

            await controller.getById(
                createReq({ params: { id: '2' } }),
                res,
                next
            );

            expect(prisma.clubCategory.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 2 } })
            );
            expect(res.body).toEqual({ success: true, data: category });
        });

        it('returns 404 when category is missing', async () => {
            vi.spyOn(prisma.clubCategory, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Категория не найдена', statusCode: 404 })
            );
        });
    });

    describe('create', () => {
        it('creates club category', async () => {
            const created = { id: 5, name: 'Музыка', description: 'Описание' };
            vi.spyOn(prisma.clubCategory, 'create').mockResolvedValue(created);

            await controller.create(
                createReq({ body: { name: 'Музыка', description: 'Описание' } }),
                res,
                next
            );

            expect(prisma.clubCategory.create).toHaveBeenCalledWith({
                data: { name: 'Музыка', description: 'Описание' },
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ success: true, data: created });
        });
    });

    describe('update', () => {
        it('updates name and description', async () => {
            const updated = { id: 3, name: 'Новое имя', description: 'Новое описание' };
            vi.spyOn(prisma.clubCategory, 'update').mockResolvedValue(updated);

            await controller.update(
                createReq({
                    params: { id: '3' },
                    body: { name: 'Новое имя', description: 'Новое описание' },
                }),
                res,
                next
            );

            expect(prisma.clubCategory.update).toHaveBeenCalledWith({
                where: { id: 3 },
                data: { name: 'Новое имя', description: 'Новое описание' },
            });
            expect(res.body).toEqual({ success: true, data: updated });
        });

        it('allows clearing description with empty string', async () => {
            vi.spyOn(prisma.clubCategory, 'update').mockResolvedValue({ id: 3, description: '' });

            await controller.update(
                createReq({ params: { id: '3' }, body: { description: '' } }),
                res,
                next
            );

            expect(prisma.clubCategory.update.mock.calls[0][0].data).toEqual({ description: '' });
        });
    });

    describe('updateStatus', () => {
        it('updates isActive status', async () => {
            vi.spyOn(prisma.clubCategory, 'update').mockResolvedValue({ id: 4, isActive: false });

            await controller.updateStatus(
                createReq({ params: { id: '4' }, body: { isActive: false } }),
                res,
                next
            );

            expect(prisma.clubCategory.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: { isActive: false },
            });
            expect(res.body).toEqual({ success: true, message: 'Status is updated' });
        });
    });

    describe('remove', () => {
        it('returns 409 when category has active subscriptions', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(2);
            const requestsCountSpy = vi.spyOn(prisma.subscriptionRequest, 'count');
            const deleteSpy = vi.spyOn(prisma.clubCategory, 'delete');

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(requestsCountSpy).not.toHaveBeenCalled();
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Вы не можете совершить это действие, так как к данной категории привязаны абонементы',
                    statusCode: 409,
                })
            );
        });

        it('returns 409 when category has pending requests', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(1);
            const deleteSpy = vi.spyOn(prisma.clubCategory, 'delete');

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(deleteSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Вы не можете совершить это действие, так как к данной категории привязаны заявки',
                    statusCode: 409,
                })
            );
        });

        it('deletes category when no linked subscriptions or requests', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.clubCategory, 'delete').mockResolvedValue({ id: 5 });

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(prisma.subscription.count).toHaveBeenCalledWith({
                where: {
                    club: { classCategoryId: 5 },
                    status: 'ACTIVE',
                },
            });
            expect(prisma.clubCategory.delete).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(res.body).toEqual({ success: true, message: 'Record is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.clubCategory, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
