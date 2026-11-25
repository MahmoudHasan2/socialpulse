/**
 * SocialPulse – CRUD-Engine (Tabellen, Karten, Formulare, Statistiken)
 * Pfad: /assets/js/crud.js
 */
(function () {
    'use strict';

    SP.addTranslations({
        'crud.add':          { de: 'Neu anlegen', en: 'Add new', fr: 'Ajouter', ar: 'إضافة جديد' },
        'crud.edit':         { de: 'Bearbeiten', en: 'Edit', fr: 'Modifier', ar: 'تعديل' },
        'crud.delete':       { de: 'Löschen', en: 'Delete', fr: 'Supprimer', ar: 'حذف' },
        'crud.cancel':       { de: 'Abbrechen', en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' },
        'crud.save':         { de: 'Speichern', en: 'Save', fr: 'Enregistrer', ar: 'حفظ' },
        'crud.search':       { de: 'Suchen...', en: 'Search...', fr: 'Rechercher...', ar: 'بحث...' },
        'crud.allPlatforms': { de: 'Alle Plattformen', en: 'All platforms', fr: 'Toutes les plateformes', ar: 'كل المنصات' },
        'crud.allStatus':    { de: 'Alle Status', en: 'All statuses', fr: 'Tous les statuts', ar: 'كل الحالات' },
        'crud.empty':        { de: 'Noch keine Einträge. Lege den ersten an.', en: 'No entries yet. Add the first one.', fr: 'Aucune entrée. Ajoutez la première.', ar: 'لا توجد إدخالات بعد. أضف أول إدخال.' },
        'crud.noMatch':      { de: 'Keine Treffer für diesen Filter.', en: 'No results for this filter.', fr: 'Aucun résultat pour ce filtre.', ar: 'لا نتائج لهذا الفلتر.' },
        'crud.loading':      { de: 'Wird geladen...', en: 'Loading...', fr: 'Chargement...', ar: 'جارٍ التحميل...' },
        'crud.confirmTitle': { de: 'Eintrag löschen?', en: 'Delete entry?', fr: "Supprimer l'entrée ?", ar: 'حذف الإدخال؟' },
        'crud.confirmText':  { de: 'Dieser Eintrag wird endgültig gelöscht.', en: 'This entry will be permanently deleted.', fr: 'Cette entrée sera supprimée définitivement.', ar: 'سيتم حذف هذا الإدخال نهائياً.' },
        'crud.saved':        { de: 'Gespeichert.', en: 'Saved.', fr: 'Enregistré.', ar: 'تم الحفظ.' },
        'crud.deleted':      { de: 'Gelöscht.', en: 'Deleted.', fr: 'Supprimé.', ar: 'تم الحذف.' },
        'crud.required':     { de: 'ist ein Pflichtfeld.', en: 'is required.', fr: 'est obligatoire.', ar: 'حقل مطلوب.' },
        'crud.invalid':      { de: 'ist ungültig.', en: 'is invalid.', fr: 'est invalide.', ar: 'قيمة غير صالحة.' },
        'crud.range':        { de: 'liegt außerhalb des erlaubten Bereichs.', en: 'is out of range.', fr: 'est hors limites.', ar: 'خارج النطاق المسموح.' },
        'crud.error':        { de: 'Aktion fehlgeschlagen.', en: 'Action failed.', fr: "L'action a échoué.", ar: 'فشلت العملية.' },
        'crud.network':      { de: 'Verbindungsfehler.', en: 'Connection error.', fr: 'Erreur de connexion.', ar: 'خطأ في الاتصال.' },
        'crud.limit':        { de: 'Maximale Anzahl an Einträgen erreicht.', en: 'Maximum number of entries reached.', fr: "Nombre maximal d'entrées atteint.", ar: 'تم الوصول للحد الأقصى من الإدخالات.' },
        'crud.actions':      { de: 'Aktionen', en: 'Actions', fr: 'Actions', ar: 'إجراءات' },
        'crud.manualNote':   { de: 'Manuelle Erfassung – der automatische Import folgt mit der Plattform-Verknüpfung.', en: 'Manual entry – automatic import follows once the platform is connected.', fr: "Saisie manuelle – l'import automatique suivra avec la connexion de la plateforme.", ar: 'إدخال يدوي – الاستيراد التلقائي يأتي بعد ربط المنصة.' },
        'common.status':     { de: 'Status', en: 'Status', fr: 'Statut', ar: 'الحالة' },
        'common.date':       { de: 'Datum', en: 'Date', fr: 'Date', ar: 'التاريخ' },
        'common.time':       { de: 'Uhrzeit', en: 'Time', fr: 'Heure', ar: 'الوقت' },
        'common.platform':   { de: 'Plattform', en: 'Platform', fr: 'Plateforme', ar: 'المنصة' },
        'plat.website':      { de: 'Webseite', en: 'Website', fr: 'Site web', ar: 'الموقع' },
        'plat.other':        { de: 'Sonstige', en: 'Other', fr: 'Autre', ar: 'أخرى' },
        'plat.all':          { de: 'Alle Plattformen', en: 'All platforms', fr: 'Toutes', ar: 'كل المنصات' }
    });

    /* ---------- Helfer ---------- */
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    SP.esc = esc;

    const LOCALES = { de: 'de-DE', en: 'en-GB', fr: 'fr-FR', ar: 'ar-u-nu-latn' };
    SP.locale   = () => LOCALES[currentLang] || 'de-DE';
    SP.fmtNum   = (n, d = 0) => Number(n || 0).toLocaleString(SP.locale(), { minimumFractionDigits: d, maximumFractionDigits: d });
    SP.fmtMoney = n => Number(n || 0).toLocaleString(SP.locale(), { style: 'currency', currency: 'EUR' });
    SP.fmtPct   = n => SP.fmtNum(n, 1) + '%';
    SP.fmtDate  = iso => {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
        if (!m) return '—';
        return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString(SP.locale(), { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    SP.today = () => {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };
    SP.isThisMonth = iso => (iso || '').slice(0, 7) === SP.today().slice(0, 7);
    SP.ratio = (a, b) => (b > 0 ? a / b : 0);

    const PLATFORM_META = {
        instagram: { label: 'Instagram', icon: 'fab fa-instagram' },
        facebook:  { label: 'Facebook',  icon: 'fab fa-facebook' },
        google:    { label: 'Google',    icon: 'fab fa-google' },
        tiktok:    { label: 'TikTok',    icon: 'fab fa-tiktok' },
        youtube:   { label: 'YouTube',   icon: 'fab fa-youtube' },
        linkedin:  { label: 'LinkedIn',  icon: 'fab fa-linkedin' },
        x:         { label: 'X',         icon: 'fab fa-twitter' },
        whatsapp:  { label: 'WhatsApp',  icon: 'fab fa-whatsapp' },
        website:   { labelKey: 'plat.website', icon: 'fas fa-globe' },
        other:     { labelKey: 'plat.other',   icon: 'fas fa-ellipsis-h' },
        all:       { labelKey: 'plat.all',     icon: 'fas fa-layer-group' }
    };
    const PLATFORM_KEYS = ['instagram', 'facebook', 'google', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp', 'website', 'other'];

    SP.platformLabel = k => { const m = PLATFORM_META[k]; if (!m) return k || '—'; return m.labelKey ? SP.tr(m.labelKey) : m.label; };
    SP.platformOptions = withAll => (withAll ? ['all'] : []).concat(PLATFORM_KEYS).map(v => ({ value: v, label: () => SP.platformLabel(v) }));
    SP.platCell = k => `<span class="sp-plat"><i class="${(PLATFORM_META[k] || {}).icon || 'fas fa-circle'}"></i>${esc(SP.platformLabel(k))}</span>`;
    SP.badge = (key, cls) => `<span class="badge ${cls || 'badge-neutral'}">${esc(SP.tr(key))}</span>`;
    SP.stars = n => {
        n = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
        return `<span class="sp-stars" aria-label="${n}/5">${'★'.repeat(n)}<span class="off">${'★'.repeat(5 - n)}</span></span>`;
    };
    const optLabel = o => (o.labelKey ? SP.tr(o.labelKey) : (typeof o.label === 'function' ? o.label() : o.label));
    const optionsOf = f => (typeof f.options === 'function' ? f.options() : f.options) || [];

    /* ---------- Sprachwechsel ---------- */
    const langHandlers = [];
    SP.onLangChange = fn => langHandlers.push(fn);
    document.addEventListener('DOMContentLoaded', () => {
        const sel = SP.$('langSelect');
        if (sel) sel.addEventListener('change', () => langHandlers.forEach(fn => fn()));
    });

    /* ---------- Fehlertexte ---------- */
    function errText(res, fields) {
        if (res && res.error === 'field') {
            const f = (fields || []).find(x => x.key === res.field);
            const label = f ? SP.tr(f.labelKey) : res.field;
            return label + ' ' + SP.tr('crud.' + (res.reason || 'invalid'));
        }
        const map = { network: 'crud.network', limit: 'crud.limit' };
        return SP.tr(map[res && res.error] || 'crud.error');
    }
    SP.errText = errText;

    /* ---------- Datenspeicher (pro Sammlung, geteilt) ---------- */
    const stores = {};
    const store = col => (stores[col] = stores[col] || { items: [], loaded: false, loading: null, subs: [] });
    const notify = col => store(col).subs.forEach(fn => fn());

    SP.data = {
        items: col => store(col).items,
        isLoaded: col => store(col).loaded,
        subscribe: (col, fn) => store(col).subs.push(fn),
        load(col) {
            const s = store(col);
            if (s.loaded) return Promise.resolve(s.items);
            if (!s.loading) {
                s.loading = SP.api('col.list', undefined, { col }).then(res => {
                    s.loading = null;
                    if (!res.ok) { SP.toast(errText(res), 'err'); return s.items; }
                    s.items = res.items || [];
                    s.loaded = true;
                    notify(col);
                    return s.items;
                });
            }
            return s.loading;
        },
        async save(col, item) {
            const res = await SP.api('col.save', { col, item });
            if (res.ok) {
                const s = store(col);
                const i = s.items.findIndex(x => x.id === res.item.id);
                if (i >= 0) s.items[i] = res.item; else s.items.push(res.item);
                notify(col);
            }
            return res;
        },
        async remove(col, id) {
            const res = await SP.api('col.delete', { col, id });
            if (res.ok) {
                const s = store(col);
                s.items = s.items.filter(x => x.id !== id);
                notify(col);
            }
            return res;
        }
    };

    /* ---------- Modal ---------- */
    let modal, lastFocus;
    function ensureModal() {
        if (modal) return modal;
        modal = document.createElement('div');
        modal.className = 'sp-modal';
        modal.hidden = true;
        modal.innerHTML =
            '<div class="sp-modal-backdrop" data-close></div>' +
            '<div class="sp-modal-box" role="dialog" aria-modal="true" aria-labelledby="spModalTitle">' +
            '<div class="sp-modal-head"><h3 id="spModalTitle"></h3>' +
            '<button type="button" class="sp-icon-btn" data-close aria-label="Close"><i class="fas fa-times"></i></button></div>' +
            '<div class="sp-modal-body"></div><div class="sp-modal-foot"></div></div>';
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
        return modal;
    }

    function openModal(title, bodyNode, buttons) {
        ensureModal();
        lastFocus = document.activeElement;
        modal.querySelector('#spModalTitle').textContent = title;
        const body = modal.querySelector('.sp-modal-body');
        body.innerHTML = '';
        body.appendChild(bodyNode);
        const foot = modal.querySelector('.sp-modal-foot');
        foot.innerHTML = '';
        const nodes = buttons.map(b => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = b.cls;
            btn.textContent = SP.tr(b.labelKey);
            btn.addEventListener('click', b.onClick);
            foot.appendChild(btn);
            return btn;
        });
        modal.hidden = false;
        document.body.classList.add('sp-modal-open');
        return nodes;
    }

    function closeModal() {
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove('sp-modal-open');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    SP.closeModal = closeModal;
    SP.openModal = openModal;

    SP.confirm = (titleKey, textKey) => new Promise(resolve => {
        const p = document.createElement('p');
        p.className = 'sp-confirm-text';
        p.textContent = SP.tr(textKey);
        const btns = openModal(SP.tr(titleKey), p, [
            { labelKey: 'crud.cancel', cls: 'sp-btn-ghost', onClick: () => { closeModal(); resolve(false); } },
            { labelKey: 'crud.delete', cls: 'sp-btn-danger', onClick: () => { closeModal(); resolve(true); } }
        ]);
        btns[0].focus();
    });

    /* ---------- Formular ---------- */
    function buildForm(fields, item) {
        const form = document.createElement('form');
        form.className = 'sp-form';
        form.noValidate = true;

        fields.filter(f => f.form !== false).forEach(f => {
            const wrap = document.createElement('div');
            wrap.className = 'form-group' + (f.full || f.type === 'textarea' || f.type === 'bool' ? ' sp-full' : '');
            const id = 'spf_' + f.key;
            const val = item[f.key] == null ? '' : item[f.key];

            if (f.type === 'bool') {
                const lab = document.createElement('label');
                lab.className = 'sp-toggle';
                const span = document.createElement('span');
                span.textContent = SP.tr(f.labelKey);
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.name = f.key;
                cb.checked = !!val;
                lab.append(span, cb);
                wrap.appendChild(lab);
                form.appendChild(wrap);
                return;
            }

            const label = document.createElement('label');
            label.htmlFor = id;
            label.textContent = SP.tr(f.labelKey) + (f.required ? ' *' : '');

            let control;
            if (f.options) {
                control = document.createElement('select');
                const opts = optionsOf(f);
                if (!f.required) {
                    const empty = document.createElement('option');
                    empty.value = '';
                    empty.textContent = '—';
                    control.appendChild(empty);
                }
                opts.forEach(o => {
                    const op = document.createElement('option');
                    op.value = o.value;
                    op.textContent = optLabel(o);
                    control.appendChild(op);
                });
                control.value = String(val !== '' ? val : (f.required && opts[0] ? opts[0].value : ''));
            } else if (f.type === 'textarea') {
                control = document.createElement('textarea');
                control.rows = f.rows || 4;
                control.value = val;
                if (f.max) control.maxLength = f.max;
            } else {
                control = document.createElement('input');
                control.type = { int: 'number', money: 'number', date: 'date', time: 'time', url: 'url' }[f.type] || 'text';
                if (f.type === 'int') { control.step = '1'; control.min = f.min != null ? f.min : 0; if (f.max != null) control.max = f.max; control.inputMode = 'numeric'; }
                if (f.type === 'money') { control.step = '0.01'; control.min = '0'; control.inputMode = 'decimal'; }
                if (f.max && (f.type === 'text' || f.type === 'url')) control.maxLength = f.max;
                if (f.type === 'url') control.placeholder = 'https://';
                control.value = val;
            }
            control.id = id;
            control.name = f.key;
            control.className = 'sp-input';
            wrap.append(label, control);
            form.appendChild(wrap);
        });

        const hiddenSubmit = document.createElement('button');
        hiddenSubmit.type = 'submit';
        hiddenSubmit.className = 'sp-sr';
        hiddenSubmit.tabIndex = -1;
        hiddenSubmit.textContent = 'OK';
        form.appendChild(hiddenSubmit);
        return form;
    }

    function readForm(form, fields) {
        const out = {};
        fields.filter(f => f.form !== false).forEach(f => {
            const el = form.elements[f.key];
            if (!el) return;
            out[f.key] = f.type === 'bool' ? el.checked : String(el.value).trim();
        });
        return out;
    }

    /* ---------- CRUD-Instanz ---------- */
    const registry = {};

    SP.openAdd = (name, preset) => {
        const inst = registry[name];
        if (!inst) return;
        showPage(inst.cfg.page || name);
        inst.openAdd(preset);
    };

    SP.crudSearch = (name, q) => { const inst = registry[name]; if (inst) inst.setQuery(q); };

    SP.crud = function (cfg) {
        const mount = SP.$(cfg.mount);
        if (!mount) return null;
        const statsMount = cfg.statsMount ? SP.$(cfg.statsMount) : null;
        const ui = { q: '', platform: '', status: '' };
        const field = k => cfg.fields.find(f => f.key === k);

        mount.innerHTML = '';
        mount.classList.add('sp-crud');

        const bar = document.createElement('div');
        bar.className = 'sp-toolbar';

        const search = document.createElement('input');
        search.type = 'search';
        search.className = 'sp-input sp-search';
        search.addEventListener('input', () => { ui.q = search.value.trim().toLowerCase(); render(); });
        bar.appendChild(search);

        let platSel = null, statusSel = null;
        if (cfg.filterPlatform) {
            platSel = document.createElement('select');
            platSel.className = 'sp-input sp-filter';
            platSel.addEventListener('change', () => { ui.platform = platSel.value; render(); });
            bar.appendChild(platSel);
        }
        if (cfg.statusField) {
            statusSel = document.createElement('select');
            statusSel.className = 'sp-input sp-filter';
            statusSel.addEventListener('change', () => { ui.status = statusSel.value; render(); });
            bar.appendChild(statusSel);
        }

        const spacer = document.createElement('div');
        spacer.className = 'sp-spacer';
        bar.appendChild(spacer);

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'balance-btn send sp-add';
        addBtn.addEventListener('click', () => openForm(null));
        bar.appendChild(addBtn);

        const note = cfg.noteKey ? document.createElement('p') : null;
        if (note) note.className = 'sp-note';

        const list = document.createElement('div');
        list.className = 'sp-list';

        mount.appendChild(bar);
        if (note) mount.appendChild(note);
        mount.appendChild(list);

        function fillToolbar() {
            search.placeholder = SP.tr('crud.search');
            search.setAttribute('aria-label', SP.tr('crud.search'));
            addBtn.innerHTML = '<i class="fas fa-plus"></i> ' + esc(SP.tr(cfg.addKey || 'crud.add'));
            if (platSel) {
                const v = platSel.value;
                platSel.innerHTML = `<option value="">${esc(SP.tr('crud.allPlatforms'))}</option>` +
                    SP.platformOptions(false).map(o => `<option value="${esc(o.value)}">${esc(optLabel(o))}</option>`).join('');
                platSel.value = v;
            }
            if (statusSel) {
                const v = statusSel.value;
                statusSel.innerHTML = `<option value="">${esc(SP.tr(cfg.statusAllKey || 'crud.allStatus'))}</option>` +
                    optionsOf(field(cfg.statusField)).map(o => `<option value="${esc(o.value)}">${esc(optLabel(o))}</option>`).join('');
                statusSel.value = v;
            }
            if (note) note.textContent = SP.tr(cfg.noteKey);
        }

        const scoped = () => {
            const items = SP.data.items(cfg.col).slice();
            return cfg.filter ? items.filter(cfg.filter) : items;
        };

        const matches = it =>
            (!ui.platform || it.platform === ui.platform) &&
            (!ui.status || String(it[cfg.statusField]) === ui.status) &&
            (!ui.q || (cfg.searchKeys || []).some(k => String(it[k] || '').toLowerCase().includes(ui.q)));

        function renderStats(items) {
            if (!statsMount || !cfg.stats) return;
            statsMount.innerHTML = cfg.stats(items).map(s =>
                `<div class="stat-card"><div class="stat-icon"><i class="${s.icon}"></i></div><div class="stat-info">` +
                `<div class="stat-label">${esc(SP.tr(s.labelKey))}</div>` +
                `<div class="stat-value">${esc(s.value)}</div>` +
                (s.sub ? `<span class="stat-change ${s.subCls || 'neutral'}">${esc(s.sub)}</span>` : '') +
                `</div></div>`).join('');
        }

        function actionsHtml(it) {
            const extra = (cfg.actions || []).map((a, i) => (a.show && !a.show(it)) ? '' :
                `<button type="button" class="sp-icon-btn" data-act="x${i}" title="${esc(SP.tr(a.titleKey))}" aria-label="${esc(SP.tr(a.titleKey))}"><i class="${a.icon}"></i></button>`).join('');
            return extra +
                `<button type="button" class="sp-icon-btn" data-act="edit" title="${esc(SP.tr('crud.edit'))}" aria-label="${esc(SP.tr('crud.edit'))}"><i class="fas fa-pen"></i></button>` +
                `<button type="button" class="sp-icon-btn sp-danger" data-act="del" title="${esc(SP.tr('crud.delete'))}" aria-label="${esc(SP.tr('crud.delete'))}"><i class="fas fa-trash"></i></button>`;
        }

        function render() {
            fillToolbar();
            if (!SP.data.isLoaded(cfg.col)) {
                list.innerHTML = `<div class="sp-loading"><i class="fas fa-circle-notch fa-spin"></i> ${esc(SP.tr('crud.loading'))}</div>`;
                return;
            }
            const all = scoped();
            renderStats(all);
            const items = all.filter(matches);
            if (cfg.sort) items.sort(cfg.sort);

            if (!all.length) {
                list.innerHTML = `<div class="sp-empty"><i class="${cfg.emptyIcon || 'fas fa-inbox'}"></i><p>${esc(SP.tr(cfg.emptyKey || 'crud.empty'))}</p></div>`;
                return;
            }
            if (!items.length) {
                list.innerHTML = `<div class="sp-empty"><p>${esc(SP.tr('crud.noMatch'))}</p></div>`;
                return;
            }

            if (cfg.renderCard) {
                list.innerHTML = '<div class="sp-cards">' + items.map(it =>
                    `<div class="sp-card-item" data-id="${esc(it.id)}">${cfg.renderCard(it)}<div class="sp-card-actions">${actionsHtml(it)}</div></div>`
                ).join('') + '</div>';
                return;
            }

            list.innerHTML =
                '<div class="sp-table-wrap"><table class="data-table sp-table"><thead><tr>' +
                cfg.columns.map(c => `<th class="${c.cls || ''}">${esc(SP.tr(c.labelKey))}</th>`).join('') +
                `<th class="sp-col-actions">${esc(SP.tr('crud.actions'))}</th></tr></thead><tbody>` +
                items.map(it =>
                    `<tr data-id="${esc(it.id)}" class="${cfg.rowClass ? cfg.rowClass(it) : ''}">` +
                    cfg.columns.map(c => `<td class="${c.cls || ''}">${c.render(it)}</td>`).join('') +
                    `<td class="sp-col-actions">${actionsHtml(it)}</td></tr>`
                ).join('') +
                '</tbody></table></div>';
        }

        list.addEventListener('click', async e => {
            const btn = e.target.closest('[data-act]');
            if (!btn) return;
            const holder = btn.closest('[data-id]');
            const it = holder && SP.data.items(cfg.col).find(x => x.id === holder.dataset.id);
            if (!it) return;
            const act = btn.dataset.act;

            if (act === 'edit') { openForm(it); return; }
            if (act === 'del') {
                if (!(await SP.confirm('crud.confirmTitle', 'crud.confirmText'))) return;
                const r = await SP.data.remove(cfg.col, it.id);
                SP.toast(r.ok ? SP.tr('crud.deleted') : errText(r), r.ok ? 'ok' : 'err');
                return;
            }
            if (act[0] === 'x') {
                btn.disabled = true;
                try { await cfg.actions[+act.slice(1)].run(it); }
                finally { btn.disabled = false; }
            }
        });

        function defaults() {
            const out = {};
            cfg.fields.forEach(f => {
                if (f.default !== undefined) out[f.key] = typeof f.default === 'function' ? f.default() : f.default;
            });
            return Object.assign(out, cfg.defaults || {});
        }

        function openForm(item, preset) {
            const isNew = !item;
            const base = isNew ? Object.assign(defaults(), preset || {}) : item;
            const form = buildForm(cfg.fields, base);
            let saveBtn;

            const submit = async () => {
                const data = Object.assign({}, base, readForm(form, cfg.fields));
                if (isNew) delete data.id; else data.id = item.id;
                saveBtn.disabled = true;
                const res = await SP.data.save(cfg.col, data);
                saveBtn.disabled = false;
                if (!res.ok) {
                    SP.toast(errText(res, cfg.fields), 'err');
                    const bad = res.field && form.elements[res.field];
                    if (bad && bad.focus) bad.focus();
                    return;
                }
                closeModal();
                SP.toast(SP.tr('crud.saved'), 'ok');
            };

            form.addEventListener('submit', e => { e.preventDefault(); submit(); });
            const btns = openModal(SP.tr(isNew ? (cfg.addKey || 'crud.add') : 'crud.edit'), form, [
                { labelKey: 'crud.cancel', cls: 'sp-btn-ghost', onClick: closeModal },
                { labelKey: 'crud.save', cls: 'balance-btn send', onClick: submit }
            ]);
            saveBtn = btns[1];
            const first = form.querySelector('input:not([type=checkbox]):not([type=submit]), select, textarea');
            if (first) first.focus();
        }

        const inst = {
            cfg,
            render,
            setQuery: q => { search.value = q; ui.q = String(q).trim().toLowerCase(); ui.platform = ''; ui.status = ''; if (platSel) platSel.value = ''; if (statusSel) statusSel.value = ''; render(); },
            openAdd: preset => openForm(null, preset),
            patch: async (item, changes) => {
                const res = await SP.data.save(cfg.col, Object.assign({}, item, changes));
                if (!res.ok) SP.toast(errText(res, cfg.fields), 'err');
                return res;
            }
        };
        if (cfg.name) registry[cfg.name] = inst;

        SP.data.subscribe(cfg.col, render);
        SP.onLangChange(render);
        render();
        SP.data.load(cfg.col);
        return inst;
    };
})();
