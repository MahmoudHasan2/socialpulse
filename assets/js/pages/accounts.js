/**
 * SocialPulse – Verknüpfte Konten, Basiskonten, Erweiterte Analysen, Plattformvergleich
 * Pfad: /assets/js/pages/accounts.js
 */
(function () {
    'use strict';
    const esc = SP.esc, $ = SP.$, T = k => SP.tr(k);

    const OWN = ['chart_advanced', 'chart_charts'];
    for (let i = CHART_CONFIGS.length - 1; i >= 0; i--) {
        if (OWN.includes(CHART_CONFIGS[i].canvas)) CHART_CONFIGS.splice(i, 1);
    }

    SP.addTranslations({
        'acc.linked':      { de: 'Link hinterlegt', en: 'Link set', fr: 'Lien défini', ar: 'الرابط محفوظ' },
        'acc.missing':     { de: 'Kein Link', en: 'No link', fr: 'Aucun lien', ar: 'بدون رابط' },
        'acc.api':         { de: 'Automatischer Import folgt', en: 'Auto import coming', fr: 'Import auto à venir', ar: 'الاستيراد التلقائي قريباً' },
        'acc.openLink':    { de: 'Profil öffnen', en: 'Open profile', fr: 'Ouvrir le profil', ar: 'فتح الحساب' },
        'acc.edit':        { de: 'Links bearbeiten', en: 'Edit links', fr: 'Modifier les liens', ar: 'تعديل الروابط' },
        'acc.withLink':    { de: 'Plattformen mit Link', en: 'Platforms with link', fr: 'Plateformes avec lien', ar: 'منصات برابط' },
        'acc.lastData':    { de: 'Letzte Datenänderung', en: 'Last data change', fr: 'Dernière modification', ar: 'آخر تعديل للبيانات' },
        'acc.tracking':    { de: 'Webseiten-Tracking', en: 'Website tracking', fr: 'Suivi du site', ar: 'تتبع الموقع' },
        'acc.active':      { de: 'Aktiv', en: 'Active', fr: 'Actif', ar: 'نشط' },
        'acc.inactive':    { de: 'Keine Daten', en: 'No data', fr: 'Aucune donnée', ar: 'لا بيانات' },
        'acc.freshness':   { de: 'Datenstand', en: 'Data status', fr: 'État des données', ar: 'حالة البيانات' },
        'acc.fresh':       { de: 'Aktuell', en: 'Up to date', fr: 'À jour', ar: 'محدّثة' },
        'acc.stale':       { de: 'Veraltet', en: 'Outdated', fr: 'Obsolète', ar: 'قديمة' },
        'acc.none':        { de: 'Keine Daten', en: 'No data', fr: 'Aucune donnée', ar: 'لا بيانات' },
        'acc.lastEntry':   { de: 'Letzter Eintrag', en: 'Last entry', fr: 'Dernière entrée', ar: 'آخر إدخال' },
        'acc.profiles':    { de: 'Unternehmensprofile', en: 'Business profiles', fr: "Profils d'entreprise", ar: 'الحسابات التجارية' },
        'acc.upToDate':    { de: 'Daten aktuell (≤ 14 Tage)', en: 'Data up to date (≤ 14 days)', fr: 'Données à jour (≤ 14 j)', ar: 'بيانات محدّثة (≤ 14 يوم)' },
        'acc.dataSource':  { de: 'Datenquelle', en: 'Data source', fr: 'Source', ar: 'مصدر البيانات' },
        'acc.src.web':     { de: 'Tracking-Code', en: 'Tracking code', fr: 'Code de suivi', ar: 'كود التتبع' },
        'acc.src.reviews': { de: 'Bewertungen', en: 'Reviews', fr: 'Avis', ar: 'التقييمات' },
        'acc.src.social':  { de: 'Follower & Beiträge', en: 'Followers & posts', fr: 'Abonnés & publications', ar: 'المتابعون والمنشورات' },
        'adv.engRate':     { de: 'Interaktionsrate (90 Tage)', en: 'Engagement rate (90 days)', fr: "Taux d'interaction (90 j)", ar: 'معدل التفاعل (90 يوم)' },
        'adv.forecast':    { de: 'Follower-Prognose in 30 Tagen', en: 'Follower forecast in 30 days', fr: 'Prévision abonnés à 30 j', ar: 'توقع المتابعين بعد 30 يوم' },
        'adv.conv':        { de: 'Webseiten-Conversion-Rate', en: 'Website conversion rate', fr: 'Taux de conversion du site', ar: 'معدل التحويل بالموقع' },
        'adv.chart':       { de: 'Reichweite vs. Interaktionen (12 Monate)', en: 'Reach vs. engagement (12 months)', fr: 'Portée vs interactions (12 mois)', ar: 'الوصول مقابل التفاعل (12 شهر)' },
        'adv.needData':    { de: 'zu wenig Daten', en: 'not enough data', fr: 'données insuffisantes', ar: 'بيانات غير كافية' },
        'cmp.platforms':   { de: 'Plattformen mit Daten', en: 'Platforms with data', fr: 'Plateformes avec données', ar: 'منصات فيها بيانات' },
        'cmp.largest':     { de: 'Größte Community', en: 'Largest community', fr: 'Plus grande communauté', ar: 'أكبر جمهور' },
        'cmp.engaging':    { de: 'Stärkste Interaktion pro Beitrag', en: 'Best engagement per post', fr: 'Meilleure interaction/publication', ar: 'أعلى تفاعل لكل منشور' },
        'cmp.chart':       { de: 'Follower & Interaktionen (90 Tage) je Plattform', en: 'Followers & engagement (90 days) per platform', fr: 'Abonnés & interactions (90 j) par plateforme', ar: 'المتابعون والتفاعل (90 يوم) لكل منصة' }
    });

    const state = { settings: null, web: null };
    const FRESH_DAYS = 14;
    const maxDate = list => list.reduce((m, x) => (x > m ? x : m), '');

    function statCards(id, list) {
        $(id).innerHTML = list.map(([i, k, v, sub]) =>
            `<div class="stat-card"><div class="stat-icon"><i class="${i}"></i></div><div class="stat-info"><div class="stat-label">${esc(T(k))}</div>` +
            `<div class="stat-value">${esc(v)}</div>${sub ? `<span class="stat-change neutral">${esc(sub)}</span>` : ''}</div></div>`).join('');
    }

    /* ================= Verknüpfte Konten ================= */
    function renderLinked() {
        if (!$('linked-stats') || !state.settings) return;
        const s = state.settings;
        const all = [{ key: 'website', label: T('settings.f.website'), icon: 'fas fa-globe' }]
            .concat(s.platforms.map(p => ({ key: p.key, label: p.labelKey ? T(p.labelKey) : p.label, icon: p.icon })));
        const set = all.filter(p => s.links[p.key]);
        const lastChange = maxDate(['posts', 'campaigns', 'reviews', 'messages', 'inbox', 'followers', 'templates']
            .map(c => maxDate(SP.data.items(c).map(x => x.updated_at || ''))));
        const tracking = state.web && state.web.last_hit;
        statCards('linked-stats', [
            ['fas fa-link', 'acc.withLink', `${set.length}/${all.length}`],
            ['fas fa-sync', 'acc.lastData', lastChange ? SP.fmtDate(lastChange) : '—'],
            ['fas fa-shield-alt', 'acc.tracking', T(tracking ? 'acc.active' : 'acc.inactive'), tracking ? SP.fmtDate(tracking) : '']
        ]);
        $('linked-list').innerHTML = '<div class="sp-acc-grid">' + all.map(p => {
            const url = s.links[p.key];
            return `<div class="sp-acc ${url ? '' : 'sp-acc-off'}"><div class="sp-acc-icon"><i class="${p.icon}"></i></div>` +
                `<div class="sp-acc-body"><div class="sp-acc-name">${esc(p.label)}</div>` +
                `<div class="sp-acc-url">${url ? esc(url.replace(/^https?:\/\//, '')) : '—'}</div>` +
                `<div class="sp-acc-badges">${url ? SP.badge('acc.linked', 'badge-active') : SP.badge('acc.missing', 'badge-neutral')}` +
                (p.key !== 'website' && url ? ' ' + SP.badge('acc.api', 'badge-info') : '') + `</div></div>` +
                (url ? `<a class="sp-icon-btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer" title="${esc(T('acc.openLink'))}" aria-label="${esc(T('acc.openLink'))}"><i class="fas fa-external-link-alt"></i></a>` : '') +
                `</div>`;
        }).join('') + '</div>' +
            `<div class="sp-actions"><button type="button" class="balance-btn send" onclick="showPage('settings')"><i class="fas fa-pen"></i> ${esc(T('acc.edit'))}</button></div>`;
    }

    /* ================= Basiskonten ================= */
    function renderBase() {
        if (!$('baseaccounts-stats') || !state.settings) return;
        const s = state.settings, M = SP.metrics;
        const limit = M.daysAgo(FRESH_DAYS);
        const lastOf = (col, pl) => maxDate(SP.data.items(col).filter(x => !pl || x.platform === pl).map(x => x.date || ''));
        const profiles = [
            { key: 'website', label: T('settings.f.website'), icon: 'fas fa-globe', src: 'acc.src.web', last: state.web && state.web.last_hit ? state.web.last_hit.slice(0, 10) : '' },
            { key: 'google', label: T('settings.p.google'), icon: 'fab fa-google', src: 'acc.src.reviews', last: lastOf('reviews') },
            { key: 'instagram', label: 'Instagram Business', icon: 'fab fa-instagram', src: 'acc.src.social', last: maxDate([lastOf('followers', 'instagram'), lastOf('posts', 'instagram')]) },
            { key: 'facebook', label: 'Facebook Business', icon: 'fab fa-facebook', src: 'acc.src.social', last: maxDate([lastOf('followers', 'facebook'), lastOf('posts', 'facebook')]) }
        ];
        const reviews = SP.data.items('reviews');
        const avg = reviews.length ? reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length : 0;
        statCards('baseaccounts-stats', [
            ['fas fa-building', 'acc.profiles', `${profiles.filter(p => s.links[p.key]).length}/${profiles.length}`],
            ['fas fa-check-circle', 'acc.upToDate', `${profiles.filter(p => p.last && p.last >= limit).length}/${profiles.length}`],
            ['fas fa-star', 'baseaccounts.stat2.label', reviews.length ? SP.fmtNum(avg, 1) + ' ★' : '—']
        ]);
        $('baseaccounts-list').innerHTML = '<div class="sp-table-wrap"><table class="data-table sp-mini"><thead><tr>' +
            ['acc.profiles', 'acc.dataSource', 'acc.lastEntry', 'acc.freshness'].map(k => `<th>${esc(T(k))}</th>`).join('') + '</tr></thead><tbody>' +
            profiles.map(p => {
                const status = !p.last ? SP.badge('acc.none', 'badge-neutral') : (p.last >= limit ? SP.badge('acc.fresh', 'badge-active') : SP.badge('acc.stale', 'badge-planned'));
                const name = s.links[p.key]
                    ? `<a class="sp-link" href="${esc(s.links[p.key])}" target="_blank" rel="noopener noreferrer"><i class="${p.icon}"></i> ${esc(p.label)}</a>`
                    : `<span class="sp-plat"><i class="${p.icon}"></i>${esc(p.label)}</span>`;
                return `<tr><td>${name}</td><td>${esc(T(p.src))}</td><td>${esc(p.last ? SP.fmtDate(p.last) : '—')}</td><td>${status}</td></tr>`;
            }).join('') + '</tbody></table></div>';
    }

    /* ================= Erweiterte Analysen ================= */
    function forecastFollowers() {
        const M = SP.metrics;
        const points = [];
        for (let i = 90; i >= 0; i -= 7) {
            const total = M.totalFollowers(M.daysAgo(i));
            if (total) points.push([-i, total]);
        }
        if (points.length < 3) return null;
        const n = points.length;
        const sx = points.reduce((a, p) => a + p[0], 0), sy = points.reduce((a, p) => a + p[1], 0);
        const sxx = points.reduce((a, p) => a + p[0] * p[0], 0), sxy = points.reduce((a, p) => a + p[0] * p[1], 0);
        const den = n * sxx - sx * sx;
        if (!den) return null;
        const slope = (n * sxy - sx * sy) / den;
        return Math.max(0, Math.round(SP.metrics.totalFollowers() + slope * 30));
    }

    function renderAdvanced() {
        if (!$('advanced-stats')) return;
        const M = SP.metrics;
        const posts90 = M.published().filter(p => p.date >= M.daysAgo(90));
        const reach = posts90.reduce((a, p) => a + (p.reach || 0), 0);
        const eng = posts90.reduce((a, p) => a + M.eng(p), 0);
        const fc = forecastFollowers();
        const now = M.totalFollowers();
        const w = state.web;
        statCards('advanced-stats', [
            ['fas fa-bullseye', 'adv.engRate', reach ? SP.fmtPct(eng / reach * 100) : '—', reach ? '' : T('adv.needData')],
            ['fas fa-chart-line', 'adv.forecast', fc === null ? '—' : SP.fmtNum(fc), fc === null ? T('adv.needData') : (fc - now >= 0 ? '+' : '') + SP.fmtNum(fc - now)],
            ['fas fa-check-double', 'adv.conv', w && w.totals.sessions ? SP.fmtPct(w.totals.conv_sessions / w.totals.sessions * 100) : '—']
        ]);
        const months = M.lastMonths(12);
        const inM = mk => M.published().filter(p => (p.date || '').slice(0, 7) === mk);
        const b = SP.chartBase();
        const o = b.options();
        o.scales.y1 = { position: 'right', beginAtZero: true, grid: { display: false }, ticks: { color: b.text, font: { size: 11 }, precision: 0 } };
        SP.drawChart('chart_advanced', {
            type: 'line',
            data: {
                labels: months.map(M.monthLabel),
                datasets: [
                    { label: T('advanced.d1'), data: months.map(mk => inM(mk).reduce((a, p) => a + (p.reach || 0), 0)), borderColor: '#6366f1', backgroundColor: '#6366f114', fill: true, tension: .35, borderWidth: 2, pointRadius: 0, yAxisID: 'y' },
                    { label: T('advanced.d2'), data: months.map(mk => inM(mk).reduce((a, p) => a + M.eng(p), 0)), borderColor: '#10b981', backgroundColor: '#10b98114', fill: false, tension: .35, borderWidth: 2, pointRadius: 0, yAxisID: 'y1' }
                ]
            },
            options: o
        });
    }

    /* ================= Plattformvergleich ================= */
    function renderCompare() {
        if (!$('charts-stats')) return;
        const M = SP.metrics;
        const latest = M.latestByPlatform();
        const posts = M.published().filter(p => p.date >= M.daysAgo(90));
        const by = {};
        Object.values(latest).forEach(s => { by[s.platform] = { f: s.followers, e: 0, n: 0 }; });
        posts.forEach(p => { const o = by[p.platform] = by[p.platform] || { f: 0, e: 0, n: 0 }; o.e += M.eng(p); o.n++; });
        const keys = Object.keys(by).sort((a, c) => by[c].f - by[a].f || by[c].e - by[a].e);
        const largest = keys.slice().sort((a, c) => by[c].f - by[a].f)[0];
        const engaging = keys.filter(k => by[k].n).sort((a, c) => by[c].e / by[c].n - by[a].e / by[a].n)[0];
        statCards('charts-stats', [
            ['fas fa-layer-group', 'cmp.platforms', SP.fmtNum(keys.length)],
            ['fas fa-users', 'cmp.largest', largest && by[largest].f ? SP.platformLabel(largest) : '—', largest && by[largest].f ? SP.fmtNum(by[largest].f) : ''],
            ['fas fa-fire', 'cmp.engaging', engaging ? SP.platformLabel(engaging) : '—', engaging ? 'Ø ' + SP.fmtNum(by[engaging].e / by[engaging].n) : '']
        ]);
        const b = SP.chartBase();
        SP.drawChart('chart_charts', {
            type: 'bar',
            data: {
                labels: keys.map(SP.platformLabel),
                datasets: [
                    { label: T('soc.followers'), data: keys.map(k => by[k].f), backgroundColor: keys.map(k => SP.platColor(k)), borderRadius: 4 },
                    { label: T('eng.total'), data: keys.map(k => by[k].e), backgroundColor: '#10b981', borderRadius: 4 }
                ]
            },
            options: b.options()
        });
    }

    function renderAll() { renderLinked(); renderBase(); renderAdvanced(); renderCompare(); }

    const origRebuild = window.rebuildAllCharts;
    window.rebuildAllCharts = function (lang) { origRebuild(lang); renderAll(); };

    document.addEventListener('DOMContentLoaded', async () => {
        ['posts', 'campaigns', 'reviews', 'messages', 'inbox', 'followers', 'templates'].forEach(c => { SP.data.subscribe(c, renderAll); SP.data.load(c); });
        SP.onLangChange(renderAll);
        renderAll();
        const [st, web] = await Promise.all([SP.api('settings.get'), SP.api('web.stats', undefined, { days: 30 })]);
        if (st.ok) state.settings = st;
        if (web.ok) state.web = web;
        renderAll();
    });
})();
