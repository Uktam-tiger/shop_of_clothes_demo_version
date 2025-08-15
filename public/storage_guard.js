(function () {
    'use strict';

    if (window.__STORAGE_GUARD_INSTALLED__) {
        return;
    }
    window.__STORAGE_GUARD_INSTALLED__ = true;

    function isQuotaExceededError(error) {
        if (!error) return false;
        var name = error.name || '';
        var code = typeof error.code === 'number' ? error.code : -1;
        return (
            name === 'QuotaExceededError' ||
            name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            code === 22 ||
            code === 1014
        );
    }

    function ensureModalExists() {
        if (document.getElementById('ls_quota_modal_overlay')) {
            return;
        }

        var overlay = document.createElement('div');
        overlay.id = 'ls_quota_modal_overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0, 0, 0, 0.55)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '2147483647';

        var modal = document.createElement('div');
        modal.style.background = '#ffffff';
        modal.style.borderRadius = '12px';
        modal.style.maxWidth = '560px';
        modal.style.width = 'calc(100% - 40px)';
        modal.style.padding = '24px 22px';
        modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        modal.style.textAlign = 'center';
        modal.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif";

        var title = document.createElement('div');
        title.style.fontSize = '22px';
        title.style.fontWeight = '800';
        title.style.marginBottom = '12px';
        title.style.color = '#111827';
        title.textContent = '⚠️ УВАЖАЕМЫЙ КЛИЕНТ! ⚠️';

        var message = document.createElement('div');
        message.style.fontSize = '16px';
        message.style.lineHeight = '1.6';
        message.style.color = '#111827';
        message.style.marginBottom = '20px';
        message.textContent = 'Для продолжения работы с приложением вы должны приобрести официальную версию этого приложения!';

        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Понятно!';
        button.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        button.style.color = '#ffffff';
        button.style.border = 'none';
        button.style.borderRadius = '10px';
        button.style.padding = '12px 18px';
        button.style.fontSize = '15px';
        button.style.fontWeight = '700';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.35)';
        button.style.transition = 'transform 0.12s ease';
        button.onmouseenter = function () { button.style.transform = 'translateY(-1px)'; };
        button.onmouseleave = function () { button.style.transform = 'translateY(0)'; };

        button.addEventListener('click', function () {
            try {
                lockActions();
                var node = document.getElementById('ls_quota_modal_overlay');
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            } catch (_) {}
        });

        modal.appendChild(title);
        modal.appendChild(message);
        modal.appendChild(button);
        overlay.appendChild(modal);

        (document.body || document.documentElement).appendChild(overlay);

        try { button.focus(); } catch (_) {}
    }

    function showQuotaModalOnce() {
        if (window.__LS_QUOTA_MODAL_SHOWN__) {
            return;
        }
        window.__LS_QUOTA_MODAL_SHOWN__ = true;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ensureModalExists, { once: true });
        } else {
            ensureModalExists();
        }
    }

    function readCookie(name) {
        var nameEq = name + '=';
        var parts = (document.cookie || '').split(';');
        for (var i = 0; i < parts.length; i++) {
            var c = parts[i].trim();
            if (c.indexOf(nameEq) === 0) {
                return c.substring(nameEq.length);
            }
        }
        return '';
    }

    function setCookie(name, value, days) {
        try {
            var expires = '';
            if (typeof days === 'number') {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
        } catch (_) {}
    }

    function deleteCookie(name) {
        try {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
        } catch (_) {}
    }

    function lockActions() {
        window.__LS_ACTIONS_LOCKED__ = true;
        try { localStorage.setItem('ls_actions_locked', '1'); } catch (_) {}
        setCookie('ls_actions_locked', '1', 365);
    }

    function unlockActions() {
        window.__LS_ACTIONS_LOCKED__ = false;
        try { localStorage.removeItem('ls_actions_locked'); } catch (_) {}
        deleteCookie('ls_actions_locked');
    }

    function isActionsLocked() {
        if (window.__LS_ACTIONS_LOCKED__) return true;
        try {
            if (localStorage.getItem('ls_actions_locked') === '1') return true;
        } catch (_) {}
        return readCookie('ls_actions_locked') === '1';
    }

    function showLicenseModal() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ensureModalExists, { once: true });
        } else {
            ensureModalExists();
        }
    }

    var originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItemGuarded(key, value) {
        try {
            return originalSetItem.apply(this, arguments);
        } catch (error) {
            if (isQuotaExceededError(error)) {
                showQuotaModalOnce();
                return undefined;
            }
            throw error;
        }
    };

    window.LicenseGuard = {
        showModal: showLicenseModal,
        isLocked: isActionsLocked,
        lock: lockActions,
        unlock: unlockActions
    };
})();

