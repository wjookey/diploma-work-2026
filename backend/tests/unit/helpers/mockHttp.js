const createRes = () => {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return res;
};

const createNext = () => vi.fn();

const createReq = (overrides = {}) => ({
    query: {},
    params: {},
    body: {},
    user: { role: 'ADMIN', parent: { familyId: 1 } },
    ...overrides,
});

module.exports = { createRes, createNext, createReq };
