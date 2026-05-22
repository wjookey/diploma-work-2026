const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const prisma = require('../../src/config/prisma');
const emailService = require('../../src/services/emailService');
const telegramAuthService = require('../../src/services/telegramAuthService');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const hashCode = (code) =>
    crypto.createHash('sha256').update(code).digest('hex');

const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

const telegramInitData = (telegramId = 999888) =>
    `user=${encodeURIComponent(JSON.stringify({ id: telegramId }))}`;

const baseUser = (overrides = {}) => ({
    id: 1,
    email: 'parent@test.local',
    firstName: 'Иван',
    lastName: 'Родитель',
    phone: '79001111111',
    role: 'PARENT',
    password: null,
    verificationCode: null,
    codeExpiresAt: null,
    refreshToken: null,
    teacher: null,
    parent: { family: { children: [] } },
    ...overrides,
});

const authControllerPath = require.resolve('../../src/controllers/auth.controller');
const authModelPath = require.resolve('../../src/model/auth');

let controller;

const loadController = () => {
    vi.spyOn(emailService, 'generateVerificationCode').mockReturnValue('123456');
    vi.spyOn(emailService, 'sendVerificationCode').mockResolvedValue(undefined);
    vi.spyOn(telegramAuthService, 'verifyByHash').mockImplementation(() => {});

    delete require.cache[authModelPath];
    delete require.cache[authControllerPath];
    return require('../../src/controllers/auth.controller');
};

describe('auth.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('telegramAuthAuto', () => {
        it('returns tokens for existing telegram user', async () => {
            const user = baseUser({ telegramId: '999888' });
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
            vi.spyOn(prisma.user, 'update').mockResolvedValue({
                ...user,
                refreshToken: 'hashed',
            });

            await controller.telegramAuthAuto(
                createReq({ body: { initData: telegramInitData() } }),
                res,
                next
            );

            expect(telegramAuthService.verifyByHash).toHaveBeenCalledWith(
                telegramInitData(),
                config.botToken
            );
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
            expect(res.body.data.user.password).toBeUndefined();
        });

        it('returns 404 when telegram user is not found', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await controller.telegramAuthAuto(
                createReq({ body: { initData: telegramInitData() } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Пользователь не найден', statusCode: 404 })
            );
        });
    });

    describe('requestCode', () => {
        it('updates verification code for existing user', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(baseUser());
            vi.spyOn(prisma.user, 'update').mockResolvedValue(baseUser());

            await controller.requestCode(
                createReq({ body: { email: 'parent@test.local' } }),
                res,
                next
            );

            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        verificationCode: hashCode('123456'),
                    }),
                })
            );
            expect(emailService.sendVerificationCode).toHaveBeenCalledWith(
                'parent@test.local',
                '123456'
            );
            expect(res.body.success).toBe(true);
        });

        it('creates new parent user when registration data is provided', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.user, 'create').mockResolvedValue(baseUser());

            await controller.requestCode(
                createReq({
                    body: {
                        email: 'new@test.local',
                        firstName: 'Новый',
                        lastName: 'Родитель',
                        phone: '79002222222',
                        familyName: 'Семья',
                    },
                }),
                res,
                next
            );

            expect(prisma.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        email: 'new@test.local',
                        role: 'PARENT',
                        parent: expect.any(Object),
                    }),
                })
            );
        });

        it('returns 404 when user does not exist and registration data is incomplete', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await controller.requestCode(
                createReq({ body: { email: 'unknown@test.local', firstName: '' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Пользователь не найден', statusCode: 404 })
            );
        });
    });

    describe('verifyCode', () => {
        const validUser = (overrides = {}) =>
            baseUser({
                verificationCode: hashCode('123456'),
                codeExpiresAt: new Date('2025-05-21T15:00:00'),
                ...overrides,
            });

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2025-05-21T14:00:00'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('returns tokens when code is valid', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(validUser());
            vi.spyOn(prisma.user, 'update')
                .mockResolvedValueOnce(validUser())
                .mockResolvedValueOnce(validUser());

            await controller.verifyCode(
                createReq({ body: { email: 'parent@test.local', code: '123456' } }),
                res,
                next
            );

            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
        });

        it('returns 404 when user is missing', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await controller.verifyCode(
                createReq({ body: { email: 'missing@test.local', code: '123456' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Пользователь не найден. Запросите код заново.',
                    statusCode: 404,
                })
            );
        });

        it('returns 422 for invalid code', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(validUser());

            await controller.verifyCode(
                createReq({ body: { email: 'parent@test.local', code: '000000' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Неверный код подтверждения', statusCode: 422 })
            );
        });

        it('returns 410 for expired code', async () => {
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(
                validUser({ codeExpiresAt: new Date('2025-05-21T13:00:00') })
            );
            const updateSpy = vi.spyOn(prisma.user, 'update');

            await controller.verifyCode(
                createReq({ body: { email: 'parent@test.local', code: '123456' } }),
                res,
                next
            );

            expect(updateSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Код подтверждения истек. Запросите новый код.',
                    statusCode: 410,
                })
            );
        });

        it('logs in without linking telegram when it belongs to another user', async () => {
            vi.spyOn(prisma.user, 'findUnique')
                .mockResolvedValueOnce(validUser())
                .mockResolvedValueOnce({ id: 99, telegramId: '999888' });
            vi.spyOn(prisma.user, 'update')
                .mockResolvedValueOnce(validUser())
                .mockResolvedValueOnce(validUser());

            await controller.verifyCode(
                createReq({
                    body: {
                        email: 'parent@test.local',
                        code: '123456',
                        initData: telegramInitData(),
                    },
                }),
                res,
                next
            );

            expect(prisma.user.update.mock.calls[0][0].data.telegramId).toBeUndefined();
            expect(res.body.success).toBe(true);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('getMe', () => {
        it('returns current user profile', async () => {
            const user = { id: 1, email: 'parent@test.local', role: 'PARENT' };
            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

            await controller.getMe(
                createReq({ user: { id: 1 } }),
                res,
                next
            );

            expect(prisma.user.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 1 } })
            );
            expect(res.body).toEqual({ success: true, data: user });
        });
    });

    describe('refreshToken', () => {
        it('returns 401 when refresh token is missing', async () => {
            await controller.refreshToken(
                createReq({ body: {} }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Необходим токен обновления', statusCode: 401 })
            );
        });

        it('returns new tokens when refresh token is valid', async () => {
            const refreshToken = jwt.sign({ userId: 1 }, config.jwtRefreshSecret, {
                expiresIn: '7d',
            });

            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
                id: 1,
                refreshToken: hashToken(refreshToken),
            });
            vi.spyOn(prisma.user, 'update').mockResolvedValue({ id: 1 });

            await controller.refreshToken(
                createReq({ body: { refreshToken } }),
                res,
                next
            );

            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
        });

        it('returns 401 when refresh token hash does not match', async () => {
            const refreshToken = jwt.sign({ userId: 1 }, config.jwtRefreshSecret, {
                expiresIn: '7d',
            });

            vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
                id: 1,
                refreshToken: 'wrong-hash',
            });

            await controller.refreshToken(
                createReq({ body: { refreshToken } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Некорректный токен обновления', statusCode: 401 })
            );
        });
    });

    describe('logout', () => {
        it('clears refresh token and returns success', async () => {
            vi.spyOn(prisma.user, 'update').mockResolvedValue({ id: 1 });

            await controller.logout(
                createReq({ user: { id: 1 } }),
                res,
                next
            );

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { refreshToken: null },
            });
            expect(res.body).toEqual({ success: true, message: 'Logged out' });
        });
    });
});
