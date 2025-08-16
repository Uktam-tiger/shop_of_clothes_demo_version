const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function parseJsonBody(req) {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(data || '{}'));
            } catch (_) {
                resolve({});
            }
        });
        req.on('error', () => resolve({}));
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Allow', 'POST');
        res.end('Method Not Allowed');
        return;
    }

    let body = req.body;
    if (!body || typeof body !== 'object') {
        body = await parseJsonBody(req);
    }

    const login = body && body.login ? String(body.login) : '';
    const password = body && body.password ? String(body.password) : '';

    if (!login || !password) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: false, message: 'Логин и пароль обязательны' }));
        return;
    }

    const usersPath = path.join(process.cwd(), 'users.json');
    let users = [];
    try {
        const file = await fs.readFile(usersPath, 'utf-8');
        users = JSON.parse(file);
    } catch (_) {
        // ignore, treat as no users
    }

    const user = Array.isArray(users) ? users.find((u) => u && u.login === login) : null;
    if (!user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: false, message: 'Пользователь не найден' }));
        return;
    }

    let isMatch = false;
    try {
        if (user.passwordHash) {
            isMatch = await bcrypt.compare(password, user.passwordHash);
        } else if (user.password) {
            isMatch = password === String(user.password);
        }
    } catch (_) {
        isMatch = false;
    }

    if (!isMatch) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: false, message: 'Неверный пароль' }));
        return;
    }

    const token = user.token || user.login;
    const isHttps = (req.headers && req.headers['x-forwarded-proto'] === 'https');
    const cookie = [
        `session=${encodeURIComponent(token)}`,
        'Path=/',
        'Max-Age=86400',
        'SameSite=Lax'
    ];
    if (isHttps) cookie.push('Secure');
    // Не ставим HttpOnly, чтобы клиент мог проверить наличие куки для client-side guard

    res.setHeader('Set-Cookie', cookie.join('; '));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, redirect: '/main_page.html' }));
};

