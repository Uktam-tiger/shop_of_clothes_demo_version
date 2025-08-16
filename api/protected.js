const fs = require('fs').promises;
const path = require('path');

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = decodeURIComponent(parts.shift().trim());
    const value = decodeURIComponent(parts.join('='));
    list[key] = value;
  });
  return list;
}

function getQueryParam(reqUrl, key) {
  try {
    const url = new URL(reqUrl, 'https://dummy');
    return url.searchParams.get(key) || '';
  } catch (_) {
    // Fallback: manual parse
    const idx = reqUrl.indexOf('?');
    if (idx === -1) return '';
    const qs = reqUrl.slice(idx + 1);
    for (const part of qs.split('&')) {
      const [k, v] = part.split('=');
      if (decodeURIComponent(k) === key) return decodeURIComponent(v || '');
    }
    return '';
  }
}

async function isAuthorized(req) {
  try {
    const cookies = parseCookies(req.headers && req.headers.cookie);
    const session = cookies.session;
    if (!session) return false;

    const usersPath = path.join(process.cwd(), 'users.json');
    const raw = await fs.readFile(usersPath, 'utf-8').catch(() => '[]');
    const users = JSON.parse(raw);
    if (!Array.isArray(users)) return false;

    // Считаем валидной сессию, если session совпадает с token пользователя ИЛИ с логином (для простого демо)
    return users.some((u) => u && (u.token === session || u.login === session));
  } catch (_) {
    return false;
  }
}

function contentTypeFor(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    default: return 'application/octet-stream';
  }
}

module.exports = async (req, res) => {
  // Whitelist защищённых HTML
  const allowed = new Set(['main_page.html', 'reports_menu.html', 'warehouse_menu.html']);
  const requested = getQueryParam(req.url || '', 'p');

  if (!allowed.has(requested)) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  if (!(await isAuthorized(req))) {
    res.statusCode = 302;
    res.setHeader('Location', '/auth_page.html');
    res.end();
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', requested);
    const file = await fs.readFile(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeFor(requested));
    res.end(file);
  } catch (err) {
    res.statusCode = 404;
    res.end('Not Found');
  }
};

