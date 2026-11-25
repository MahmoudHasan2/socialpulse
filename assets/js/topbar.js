/**
 * SocialPulse – Topbar: globale Suche, Benachrichtigungen, Kunden-Avatar
 * Pfad: /assets/js/topbar.js
 */
(function () {
    'use strict';
    const esc = SP.esc, $ = SP.$, T = k => SP.tr(k);

    SP.addTranslations({
        'top.pages':     { de: 'Seiten', en: 'Pages', fr: 'Pages', ar: 'الصفحات' },
        'top.noResults': { de: 'Keine Treffer', en: 'No results', fr: 'Aucun résultat', ar: 'لا نتائج' },
        'top.notif':     { de: 'Benachrichtigungen', en: 'Notifications', fr: 'Notifications', ar: 'الإشعارات' },
        'top.allDone':   { de: 'Keine offenen Aufgaben.', en: 'Nothing to do.', fr: 'Rien à faire.', ar: 'ما في مهام مفتوحة.' },
        'top.n.messages':{ de: 'Ungelesene Nachrichten', en: 'Unread messages', fr: 'Messages non lus', ar: 'رسائل غير مقروءة' },
        'top.n.inbox':   { de: 'Neue Kommentare & Erwähnungen', en: 'New comments & mentions', fr: 'Nouveaux commentaires & mentions', ar: 'تعليقات وإشارات جديدة' },
        'top.n.reviews': { de: 'Unbeantwortete Bewertungen', en: 'Unanswered reviews', fr: 'Avis sans réponse', ar: 'تقييمات بدون رد' },
        'top.n.posts':   { de: 'Fällige geplante Beiträge', en: 'Planned posts due', fr: 'Publications planifiées dues', ar: 'منشورات مجدولة مستحقة' },
        'top.logout':    { de: 'Abmelden', en: 'Log out', fr: 'Déconnexion', ar: 'تسجيل الخروج' },
        'top.settings':  { de: 'Einstellungen', en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' }
    });

    const SOURCES = [
        { col: 'posts', page: 'posts', icon: 'fas fa-newspaper', fields: ['title'] },
        { col: 'campaigns', page: 'campaigns', icon: 'fas fa-flag', fields: ['name'] },
        { col: 'templates', page: 'templates', icon: 'fas fa-layer-group', fields: ['title', 'text'] },
        { col: 'reviews', page: 'reviews', icon: 'fas fa-star', fields: ['author', 'text'] },
        { col: 'messages', page: 'messages', icon: 'fas fa-comment-dots', fields: ['sender', 'text'] },
        { col: 'inbox', page: 'inbox', icon: 'fas fa-inbox', fields: ['author', 'text'] }
    ];

    /* ---------- Suche ---------- */
    let panel, results = [], active = -1;
    function ensurePanel(input) {
        if (panel) return panel;
        panel = document.createElement('div');
        panel.className = 'sp-search-panel';
        panel.setAttribute('role', 'listbox');
        panel.hidden = true;
        input.closest('.search-box').appendChild(panel);
        panel.addEventListener('mousedown', e => {
            const it = e.target.closest('[data-idx]');
            if (it) { e.preventDefault(); choose(+it.dataset.idx); }
        });
        return panel;
    }

    function search(q) {
        q = q.trim().toLowerCase();
        results = [];
        if (q.length < 2) return;
        document.querySelectorAll('.nav-item[data-page]').forEach(n => {
            const label = n.textContent.trim();
            if (label.toLowerCase().includes(q)) results.push({ type: 'page', page: n.dataset.page, label, icon: n.querySelector('i').className });
        });
        SOURCES.forEach(src => {
            SP.data.items(src.col).forEach(it => {
                const hit = src.fields.map(f => String(it[f] || '')).find(v => v.toLowerCase().includes(q));
                if (hit) results.push({ type: 'item', page: src.page, label: String(it[src.fields[0]] || hit), sub: T('nav.' + src.page), icon: src.icon, query: String(it[src.fields[0]] || '') });
            });
        });
        results = results.slice(0, 12);
    }

    function renderPanel(input) {
        const p = ensurePanel(input);
        if (input.value.trim().length < 2) { p.hidden = true; return; }
        p.innerHTML = results.length
            ? results.map((r, i) => `<div class="sp-search-item${i === active ? ' active' : ''}" role="option" data-idx="${i}"><i class="${r.icon}"></i><span class="sp-si-label">${esc(r.label)}</span>${r.sub ? `<span class="sp-si-sub">${esc(r.sub)}</span>` : ''}</div>`).join('')
            : `<div class="sp-search-empty">${esc(T('top.noResults'))}</div>`;
        p.hidden = false;
    }

    function choose(i) {
        const r = results[i];
        if (!r) return;
        const input = $('searchInput');
        showPage(r.page);
        if (r.type === 'item') SP.crudSearch(r.page, r.query);
        input.value = '';
        input.blur();
        if (panel) panel.hidden = true;
    }

    /* ---------- Benachrichtigungen ---------- */
    let bell, badge, notifPanel;
    function notifications() {
        const today = SP.today();
        return [
            { key: 'top.n.messages', page: 'messages', icon: 'fas fa-envelope', n: SP.data.items('messages').filter(m => !m.read).length },
            { key: 'top.n.inbox', page: 'inbox', icon: 'fas fa-comment-dots', n: SP.data.items('inbox').filter(x => x.status === 'new').length },
            { key: 'top.n.reviews', page: 'reviews', icon: 'fas fa-star', n: SP.data.items('reviews').filter(r => !r.replied).length },
            { key: 'top.n.posts', page: 'posts', icon: 'fas fa-calendar-times', n: SP.data.items('posts').filter(p => p.status === 'planned' && p.date <= today).length }
        ].filter(x => x.n > 0);
    }

    function renderNotif() {
        if (!bell) return;
        const list = notifications();
        const total = list.reduce((s, x) => s + x.n, 0);
        badge.textContent = total > 99 ? '99+' : String(total);
        badge.hidden = !total;
        bell.setAttribute('aria-label', T('top.notif') + (total ? ' (' + total + ')' : ''));
        bell.title = T('top.notif');
        notifPanel.innerHTML = `<div class="sp-notif-head">${esc(T('top.notif'))}</div>` + (list.length
            ? list.map(x => `<button type="button" class="sp-notif-item" data-go="${x.page}"><i class="${x.icon}"></i><span>${esc(T(x.key))}</span><strong>${x.n}</strong></button>`).join('')
            : `<div class="sp-search-empty">${esc(T('top.allDone'))}</div>`);
    }

    /* ---------- Avatar ---------- */
    async function avatar() {
        const img = document.querySelector('.topbar-right .user-avatar');
        if (!img) return;
        const res = await SP.api('settings.get');
        const name = res.ok ? (res.client.name || '') : '';
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'SP';
        const div = document.createElement('button');
        div.type = 'button';
        div.className = 'sp-avatar';
        div.textContent = initials;
        div.title = name;
        div.setAttribute('aria-label', T('top.settings'));
        div.addEventListener('click', () => showPage('settings'));
        img.replaceWith(div);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const input = $('searchInput');
        if (input) {
            let timer;
            input.setAttribute('autocomplete', 'off');
            input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { active = -1; search(input.value); renderPanel(input); }, 120); });
            input.addEventListener('focus', () => { if (input.value.trim().length >= 2) { search(input.value); renderPanel(input); } });
            input.addEventListener('blur', () => setTimeout(() => { if (panel) panel.hidden = true; }, 150));
            input.addEventListener('keydown', e => {
                if (!results.length) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % results.length; renderPanel(input); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % results.length; renderPanel(input); }
                else if (e.key === 'Enter') { e.preventDefault(); choose(active >= 0 ? active : 0); }
                else if (e.key === 'Escape') { panel.hidden = true; input.blur(); }
            });
        }

        const icon = document.querySelector('.topbar-right .fa-bell');
        if (icon) {
            bell = icon.closest('.topbar-icon');
            badge = bell.querySelector('.notif-badge');
            bell.setAttribute('role', 'button');
            bell.tabIndex = 0;
            notifPanel = document.createElement('div');
            notifPanel.className = 'sp-notif-panel';
            notifPanel.hidden = true;
            bell.appendChild(notifPanel);
            const toggle = e => { if (e.target.closest('.sp-notif-panel')) return; notifPanel.hidden = !notifPanel.hidden; };
            bell.addEventListener('click', toggle);
            bell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); notifPanel.hidden = !notifPanel.hidden; } });
            notifPanel.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { showPage(b.dataset.go); notifPanel.hidden = true; } });
            document.addEventListener('click', e => { if (!bell.contains(e.target)) notifPanel.hidden = true; });
            ['messages', 'inbox', 'reviews', 'posts'].forEach(c => { SP.data.subscribe(c, renderNotif); SP.data.load(c); });
            SP.onLangChange(renderNotif);
            renderNotif();
        }

        const logout = document.querySelector('.topbar-right a[href="logout.php"]');
        if (logout) logout.setAttribute('aria-label', T('top.logout'));
        avatar();
    });
})();
