const fs = require('fs');
const path = require('path');

async function readRequestBody(req) {
	return await new Promise((resolve, reject) => {
		let data = '';
		req.on('data', (chunk) => { data += chunk; });
		req.on('end', () => resolve(data));
		req.on('error', reject);
	});
}

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		res.statusCode = 405;
		res.setHeader('Allow', 'POST');
		res.end('Method Not Allowed');
		return;
	}

	try {
		const raw = await readRequestBody(req);
		const body = raw ? JSON.parse(raw) : {};
		const { login, password } = body;

		const usersPath = path.join(process.cwd(), 'users.json');
		const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
		const user = users.find((u) => u.login === login && u.password === password);

		res.setHeader('Content-Type', 'application/json; charset=utf-8');

		if (user) {
			const session = Buffer.from(`${login}:${password}`).toString('base64');
			res.setHeader(
				'Set-Cookie',
				`session=${session}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`
			);
			res.statusCode = 200;
			res.end(JSON.stringify({ success: true }));
			return;
		}

		res.statusCode = 401;
		res.end(JSON.stringify({ success: false, message: 'Неверный логин или пароль' }));
	} catch (error) {
		res.statusCode = 500;
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.end(JSON.stringify({ success: false, message: 'Ошибка сервера' }));
	}
};

