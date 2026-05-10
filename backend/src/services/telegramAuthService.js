const crypto = require('crypto');

function hmacSHA256Raw(key, message) {
    return crypto.createHmac('sha256', key)
        .update(message)
        .digest();
}

function hmacSHA256Hex(key, message) {
    return crypto.createHmac('sha256', key)
        .update(message)
        .digest('hex');
}

function parseInitDataRaw(initDataRaw) {
    const params = new URLSearchParams(initDataRaw);
    const data = {};
    for (const [key, value] of params) {
        if (value) data[key] = value;
    }
    return data;
}

function buildDataCheckString(data, excludeKeys = []) {
    return Object.keys(data)
        .filter(key => !excludeKeys.includes(key))
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('\n');
}

function timingSafeEqHex(a, b) {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

function assertFresh(authDate, maxAgeSeconds = 86400) {
    const now = Math.floor(Date.now() / 1000);
    const age = now - parseInt(authDate);
    if (age > maxAgeSeconds) {
        throw new Error('Auth date is too old');
    }
}

exports.verifyByHash = (initDataRaw, botToken, opts = { maxAgeSeconds: 86400 }) => {
    const data = parseInitDataRaw(initDataRaw);
    const receivedHash = data.hash;
    if (!receivedHash) throw new Error('Missing "hash"');

    const dataCheckString = buildDataCheckString(data, ['hash']);
    const k1 = hmacSHA256Raw('WebAppData', botToken);
    const calc = hmacSHA256Hex(k1, dataCheckString);

    if (!timingSafeEqHex(calc, receivedHash)) {
        throw new Error('BAD_SIGNATURE');
    }

    assertFresh(data.auth_date, opts.maxAgeSeconds);

    const { hash, ...rest } = data;
    return rest;
};