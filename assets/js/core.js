/**
 * SocialPulse – gemeinsame Helfer für alle Seiten
 * Pfad: /assets/js/core.js
 */
(function () {
    'use strict';
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    const CSRF = csrfMeta ? csrfMeta.content : '';
    const SP = window.SP = {};

    SP.$ = id => document.getElementById(id);

    SP.tr = function (key) {
        const t = TRANSLATIONS[key];
        return (t && (t[currentLang] || t.de)) || key;
    };

    SP.addTranslations = obj => Object.assign(TRANSLATIONS, obj);

    SP.api = async function (action, body, params) {
        let url = 'api.php?action=' + encodeURIComponent(action);
        if (params) Object.keys(params).forEach(k => { url += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); });
        const opts = { credentials: 'same-origin', headers: { 'Accept': 'application/json' } };
        if (body !== undefined) {
            opts.method = 'POST';
            opts.headers['Content-Type'] = 'application/json';
            opts.headers['X-CSRF-Token'] = CSRF;
            opts.body = JSON.stringify(body);
        }
        let res;
        try { res = await fetch(url, opts); }
        catch (e) { return { ok: false, error: 'network' }; }
        if (res.status === 401) { window.location.href = 'login.php'; return { ok: false, error: 'auth' }; }
        try { return await res.json(); } catch (e) { return { ok: false, error: 'save' }; }
    };

    let toastTimer;
    SP.toast = function (text, type) {
        let el = SP.$('spToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'spToast';
            el.setAttribute('role', 'status');
            document.body.appendChild(el);
        }
        el.textContent = text;
        el.className = 'sp-toast ' + (type || 'ok');
        void el.offsetWidth;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
    };

    SP.addTranslations({
        'common.active':   { de: 'Aktiv',   en: 'Active',   fr: 'Actif',   ar: 'نشط' },
        'common.inactive': { de: 'Inaktiv', en: 'Inactive', fr: 'Inactif', ar: 'غير نشط' }
    });
})();

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) { sidebar.classList.toggle('open'); return; }
    sidebar.classList.toggle('collapsed');
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        el.addEventListener('click', () => {
            if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
        });
    });
});
