const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (_) { resolve({}); }
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
  if (!body || typeof body !== 'object') body = await readBody(req);
  const login = String(body.login || '');
  const password = String(body.password || '');
  if (!login || !password) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, message: 'Логин и пароль обязательны' }));
    return;
  }

  const usersPath = path.join(process.cwd(), 'users.json');
  let users = [];
  try {
    const raw = await fs.readFile(usersPath, 'utf-8');
    users = JSON.parse(raw);
  } catch (_) {}

  const user = Array.isArray(users) ? users.find(u => u && u.login === login) : null;
  if (!user) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, message: 'Пользователь не найден' }));
    return;
  }

  let ok = false;
  try {
    if (user.passwordHash) ok = await bcrypt.compare(password, user.passwordHash);
    else if (user.password) ok = (String(user.password) === password);
  } catch (_) { ok = false; }

  if (!ok) {
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
  res.setHeader('Set-Cookie', cookie.join('; '));
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  res.end(JSON.stringify({ success: true, redirect: '/main_page.html' }));
};

