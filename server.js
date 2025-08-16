const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.redirect('/auth_page.html');
});

// Простая авторизация
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'));
    const user = users.find(u => u.login === login && u.password === password);
    if (user) {
        res.cookie('session', Buffer.from(`${login}:${password}`).toString('base64'), { httpOnly: true });
        return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});