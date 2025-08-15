const auth_login = document.getElementById("auth_login");
const auth_password = document.getElementById("auth_password");
const show_hide_password_button = document.getElementById("show_hide_password_button");
const eye_icon = document.getElementById("eye_icon");
const check_auth_data = document.getElementById("check_auth_data");
const auth_error = document.getElementById("auth_error");

let password_visible = false;

show_hide_password_button.addEventListener("click", (e) => {
    password_visible = !password_visible;
    auth_password.type = password_visible ? "text" : "password";
    show_hide_password_button.classList.toggle("active", password_visible);
    
    if (eye_icon) {
        eye_icon.src = password_visible ? "./images/eye_image.png" : "./images/eye_image.png";
        eye_icon.style.filter = password_visible ? "grayscale(0) brightness(1.5) sepia(1) hue-rotate(180deg)" : "";
    }
});

check_auth_data.addEventListener("click", async function(e) {
    e.preventDefault();
    let error = "";
    if (!auth_login.value.trim() && !auth_password.value.trim()) {
        error = "Пожалуйста, введите логин и пароль.";
    } else if (!auth_login.value.trim()) {
        error = "Пожалуйста, введите логин.";
    } else if (!auth_password.value.trim()) {
        error = "Пожалуйста, введите пароль.";
    }
    if (error) {
        auth_error.textContent = error;
        auth_error.style.opacity = 1;
        auth_error.style.animation = "shake 0.3s";
        setTimeout(() => {
            auth_error.style.animation = "";
        }, 350);
        return;
    }
    auth_error.textContent = "";
    check_auth_data.disabled = true;
    check_auth_data.textContent = "Проверка...";
    try {
        // Клиентская проверка по статическому users.json (демо-режим)
        const usersResp = await fetch('./users.json', { cache: 'no-store' });
        if (!usersResp.ok) throw new Error('users.json not found');
        const users = await usersResp.json();
        const found = (users || []).find(u => u.login === auth_login.value && u.password === auth_password.value);
        if (found) {
            // Установим простую сессию (демо)
            try { document.cookie = `session=${btoa(`${auth_login.value}:${auth_password.value}`)}; Path=/; SameSite=Lax`; } catch (_e) {}
            window.location.href = 'main_page.html';
        } else {
            auth_error.textContent = 'Неверный логин или пароль';
            auth_error.style.opacity = 1;
            auth_error.style.animation = "shake 0.3s";
            setTimeout(() => { auth_error.style.animation = ""; }, 350);
        }
    } catch (err) {
        auth_error.textContent = 'Ошибка соединения с сервером';
        auth_error.style.opacity = 1;
    }
    check_auth_data.disabled = false;
    check_auth_data.textContent = "Проверить и войти";
});

const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
  100% { transform: translateX(0); }
}`;
document.head.appendChild(style);

if (auth_login) auth_login.placeholder = " ";
if (auth_password) auth_password.placeholder = " ";

document.addEventListener('DOMContentLoaded', function() {
    document.onselectstart = () => false;
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
});
