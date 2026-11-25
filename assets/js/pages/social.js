/**
 * SocialPulse – Social Media, Follower, Interaktionen, Zielgruppe, Verteilungskarte
 * Pfad: /assets/js/pages/social.js
 */
(function () {
    'use strict';
    const esc = SP.esc, $ = SP.$, T = k => SP.tr(k);

    /* Demo-Diagramme dieser Seiten ersetzen */
    const OWN = ['chart_social', 'chart_followers', 'chart_engagement', 'chart_audience'];
    for (let i = CHART_CONFIGS.length - 1; i >= 0; i--) {
        if (OWN.includes(CHART_CONFIGS[i].canvas)) CHART_CONFIGS.splice(i, 1);
    }

    SP.addTranslations({
        'soc.followers':     { de: 'Follower', en: 'Followers', fr: 'Abonnés', ar: 'المتابعون' },
        'soc.totalFollowers':{ de: 'Follower gesamt', en: 'Total followers', fr: 'Total abonnés', ar: 'إجمالي المتابعين' },
        'soc.net30':         { de: 'Netto-Wachstum (30 Tage)', en: 'Net growth (30 days)', fr: 'Croissance nette (30 j)', ar: 'صافي النمو (30 يوم)' },
        'soc.change30':      { de: 'Veränderung (30 Tage)', en: 'Change (30 days)', fr: 'Variation (30 j)', ar: 'التغيير (30 يوم)' },
        'soc.platforms':     { de: 'Plattformen im Überblick', en: 'Platforms at a glance', fr: 'Plateformes en bref', ar: 'المنصات بلمحة' },
        'soc.lastUpdate':    { de: 'Letzter Stand', en: 'Last update', fr: 'Dernière mise à jour', ar: 'آخر تحديث' },
        'soc.noSnap':        { de: 'Noch keine Follower-Stände erfasst. Trage sie unter „Follower“ ein.', en: 'No follower counts yet. Add them under "Followers".', fr: 'Aucun relevé. Ajoutez-les sous « Abonnés ».', ar: 'لا توجد أعداد متابعين بعد. أضفها من صفحة المتابعين.' },
        'soc.toFollowers':   { de: 'Follower erfassen', en: 'Add followers', fr: 'Saisir les abonnés', ar: 'إدخال المتابعين' },
        'fol.add':           { de: 'Follower-Stand erfassen', en: 'Add follower count', fr: 'Ajouter un relevé', ar: 'إضافة عدد المتابعين' },
        'fol.empty':         { de: 'Noch keine Follower-Stände. Trage den aktuellen Stand je Plattform ein (z. B. wöchentlich).', en: 'No counts yet. Add the current count per platform (e.g. weekly).', fr: 'Aucun relevé. Saisissez le nombre actuel par plateforme (ex. chaque semaine).', ar: 'لا توجد أعداد بعد. أدخل العدد الحالي لكل منصة (مثلاً أسبوعياً).' },
        'fol.f.followers':   { de: 'Follower (Stand)', en: 'Followers (count)', fr: 'Abonnés (total)', ar: 'عدد المتابعين' },
        'fol.f.gained':      { de: 'Neue Follower seit letztem Stand', en: 'New since last count', fr: 'Nouveaux depuis le dernier relevé', ar: 'متابعون جدد منذ آخر إدخال' },
        'fol.f.lost':        { de: 'Entfolgt seit letztem Stand', en: 'Unfollows since last count', fr: 'Désabonnements depuis le dernier relevé', ar: 'إلغاء متابعة منذ آخر إدخال' },
        'fol.new':           { de: 'Neu', en: 'New', fr: 'Nouveaux', ar: 'جدد' },
        'fol.lost':          { de: 'Entfolgt', en: 'Lost', fr: 'Perdus', ar: 'إلغاء' },
        'fol.chartTitle':    { de: 'Neue Follower vs. Entfolgt pro Monat', en: 'New vs. lost followers per month', fr: 'Nouveaux vs perdus par mois', ar: 'المتابعون الجدد مقابل الإلغاء شهرياً' },
        'fol.history':       { de: 'Erfasste Follower-Stände', en: 'Recorded follower counts', fr: 'Relevés enregistrés', ar: 'أعداد المتابعين المسجلة' },
        'fol.thisMonth':     { de: 'diesen Monat', en: 'this month', fr: 'ce mois', ar: 'هذا الشهر' },
        'eng.last30':        { de: 'letzte 30 Tage', en: 'last 30 days', fr: '30 derniers jours', ar: 'آخر 30 يوم' },
        'eng.topPosts':      { de: 'Stärkste Beiträge', en: 'Top posts', fr: 'Meilleures publications', ar: 'أقوى المنشورات' },
        'eng.byPlatform':    { de: 'Interaktionen nach Plattform', en: 'Engagement by platform', fr: 'Interactions par plateforme', ar: 'التفاعل حسب المنصة' },
        'eng.total':         { de: 'Interaktionen', en: 'Engagement', fr: 'Interactions', ar: 'التفاعلات' },
        'eng.posts':         { de: 'Beiträge', en: 'Posts', fr: 'Publications', ar: 'المنشورات' },
        'eng.perPost':       { de: 'Ø pro Beitrag', en: 'Avg. per post', fr: 'Moy. par publication', ar: 'المتوسط لكل منشور' },
        'eng.week':          { de: 'Woche ab', en: 'Week of', fr: 'Semaine du', ar: 'أسبوع' },
        'eng.noPosts':       { de: 'Noch keine veröffentlichten Beiträge mit Zahlen.', en: 'No published posts with numbers yet.', fr: 'Aucune publication avec chiffres.', ar: 'لا توجد منشورات منشورة بأرقام بعد.' },
        'aud.formTitle':     { de: 'Zielgruppendaten pflegen', en: 'Maintain audience data', fr: "Données d'audience", ar: 'تحديث بيانات الجمهور' },
        'aud.formHelp':      { de: 'Werte in Prozent aus den Statistiken von Instagram/Facebook übernehmen.', en: 'Enter percentages from Instagram/Facebook insights.', fr: 'Saisissez les pourcentages des statistiques Instagram/Facebook.', ar: 'أدخل النسب المئوية من إحصائيات انستغرام/فيسبوك.' },
        'aud.ages':          { de: 'Altersgruppen (%)', en: 'Age groups (%)', fr: "Tranches d'âge (%)", ar: 'الفئات العمرية (%)' },
        'aud.gender':        { de: 'Geschlecht (%)', en: 'Gender (%)', fr: 'Genre (%)', ar: 'الجنس (%)' },
        'aud.female':        { de: 'Weiblich', en: 'Female', fr: 'Femmes', ar: 'إناث' },
        'aud.male':          { de: 'Männlich', en: 'Male', fr: 'Hommes', ar: 'ذكور' },
        'aud.diverse':       { de: 'Divers', en: 'Diverse', fr: 'Divers', ar: 'آخر' },
        'aud.cities':        { de: 'Top-Städte (%)', en: 'Top cities (%)', fr: 'Villes principales (%)', ar: 'أهم المدن (%)' },
        'aud.city':          { de: 'Stadt', en: 'City', fr: 'Ville', ar: 'المدينة' },
        'aud.sumWarn':       { de: 'Hinweis: Summe ergibt nicht 100 %', en: 'Note: total is not 100%', fr: 'Attention : le total ne fait pas 100 %', ar: 'تنبيه: المجموع لا يساوي 100%' },
        'aud.noData':        { de: 'Noch keine Zielgruppendaten. Bitte unten eintragen.', en: 'No audience data yet. Please fill in below.', fr: "Aucune donnée d'audience. Veuillez compléter ci-dessous.", ar: 'لا توجد بيانات جمهور بعد. يرجى الإدخال بالأسفل.' },
        'aud.updated':       { de: 'Stand:', en: 'Updated:', fr: 'Mise à jour :', ar: 'آخر تحديث:' },
        'map.top3':          { de: 'Anteil Top-3-Städte', en: 'Share of top 3 cities', fr: 'Part des 3 premières villes', ar: 'نسبة أهم 3 مدن' },
        'map.source':        { de: 'Quelle: Zielgruppendaten aus den Plattform-Statistiken (Seite „Zielgruppe“).', en: 'Source: audience data from platform insights ("Audience" page).', fr: 'Source : données d’audience des plateformes (page « Audience »).', ar: 'المصدر: بيانات الجمهور من إحصائيات المنصات (صفحة الجمهور).' },
        'map.toAudience':    { de: 'Städte bearbeiten', en: 'Edit cities', fr: 'Modifier les villes', ar: 'تعديل المدن' }
    });

    /* ---------- Hilfen ---------- */
    const pad = n => String(n).padStart(2, '0');
    const iso = dt => dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
    const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
    const monthKey = s => (s || '').slice(0, 7);
    const lastMonths = n => {
        const out = [], d = new Date();
        d.setDate(1);
        for (let i = n - 1; i >= 0; i--) {
            const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
            out.push(x.getFullYear() + '-' + pad(x.getMonth() + 1));
        }
        return out;
    };
    const monthLabel = key => { const [y, m] = key.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString(SP.locale(), { month: 'short', year: '2-digit' }); };
    const eng = p => (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
    const published = () => SP.data.items('posts').filter(p => p.status !== 'planned');

    function trend(cur, prev) {
        if (!prev) return null;
        const ch = (cur - prev) / prev * 100;
        if (!isFinite(ch) || Math.abs(ch) < 0.05) return null;
        return { html: `<i class="fas fa-arrow-${ch > 0 ? 'up' : 'down'}"></i> ${esc(SP.fmtNum(Math.abs(ch), 1))}%`, cls: ch > 0 ? 'up' : 'down' };
    }
    function statsHtml(list) {
        return list.map(s =>
            `<div class="stat-card"><div class="stat-icon"><i class="${s.icon}"></i></div><div class="stat-info">` +
            `<div class="stat-label">${esc(T(s.labelKey))}</div><div class="stat-value">${esc(s.value)}</div>` +
            (s.trend ? `<span class="stat-change ${s.trend.cls}">${s.trend.html}</span>` : (s.sub ? `<span class="stat-change neutral">${esc(s.sub)}</span>` : '')) +
            `</div></div>`).join('');
    }
    function table(heads, rows, emptyKey) {
        if (!rows.length) return `<div class="sp-empty"><p>${esc(T(emptyKey || 'web.empty'))}</p></div>`;
        return '<div class="sp-table-wrap"><table class="data-table sp-mini"><thead><tr>' +
            heads.map(h => `<th class="${h.cls || ''}">${esc(T(h.key))}</th>`).join('') + '</tr></thead><tbody>' +
            rows.map(r => '<tr>' + r.map((c, i) => `<td class="${heads[i].cls || ''}">${c}</td>`).join('') + '</tr>').join('') +
            '</tbody></table></div>';
    }

    /* ---------- Kennzahlen (auch für die Startseite) ---------- */
    const M = SP.metrics = {
        snaps: () => SP.data.items('followers').slice().sort((a, b) => (a.date || '').localeCompare(b.date || '')),
        latestByPlatform(upTo) {
            const out = {};
            M.snaps().forEach(s => { if (!upTo || s.date <= upTo) out[s.platform] = s; });
            return out;
        },
        totalFollowers(upTo) {
            return Object.values(M.latestByPlatform(upTo)).reduce((a, s) => a + (s.followers || 0), 0);
        },
        sumSnaps(key, from, to) {
            return M.snaps().filter(s => s.date >= from && s.date <= to).reduce((a, s) => a + (s[key] || 0), 0);
        },
        engagementBetween(from, to) {
            return published().filter(p => p.date >= from && p.date <= to).reduce((a, p) => a + eng(p), 0);
        },
        eng,
        published,
        monthKey, lastMonths, monthLabel, iso, daysAgo
    };

    /* ---------- Zielgruppe (Konfiguration) ---------- */
    SP.insights = {
        data: { audience: null, goals: null }, loaded: false, subs: [],
        async load() {
            const res = await SP.api('insights.get');
            if (res.ok) { this.data = { audience: res.audience, goals: res.goals }; this.loaded = true; this.subs.forEach(f => f()); }
        },
        async save(payload) {
            const res = await SP.api('insights.save', payload);
            if (res.ok) { this.data = { audience: res.audience, goals: res.goals }; this.subs.forEach(f => f()); }
            return res;
        },
        subscribe(fn) { this.subs.push(fn); }
    };

    /* ---------- Diagramme ---------- */
    const charts = {};
    function chartBase() {
        const dark = document.body.classList.contains('dark-mode');
        const text = dark ? '#9ca3af' : '#6b7280';
        const grid = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        const tooltip = { backgroundColor: dark ? '#1a1d29' : '#fff', titleColor: dark ? '#fff' : '#1f2937', bodyColor: text, borderColor: dark ? '#2d3748' : '#e5e7eb', borderWidth: 1, padding: 12, usePointStyle: true };
        return {
            tooltip, text,
            options: () => ({
                responsive: true, maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: { legend: { display: true, position: 'bottom', labels: { color: text, usePointStyle: true, boxWidth: 8 } }, tooltip },
                scales: {
                    x: { grid: { display: false }, ticks: { color: text, font: { size: 11 }, maxRotation: 0, autoSkip: true } },
                    y: { beginAtZero: true, grid: { color: grid }, ticks: { color: text, font: { size: 11 }, precision: 0 } }
                }
            })
        };
    }
    SP.chartBase = chartBase;
    SP.drawChart = function (id, config) {
        const el = $(id);
        if (!el || typeof Chart === 'undefined') return;
        if (charts[id]) charts[id].destroy();
        charts[id] = new Chart(el.getContext('2d'), config);
    };
    const PLAT_COLOR = { instagram: '#ec4899', facebook: '#3b82f6', google: '#f59e0b', tiktok: '#14b8a6', youtube: '#ef4444', linkedin: '#0ea5e9', x: '#64748b', whatsapp: '#10b981', website: '#6366f1', other: '#94a3b8' };
    SP.platColor = k => PLAT_COLOR[k] || '#94a3b8';
    const AGE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const AGE_KEYS = ['18-24', '25-34', '35-44', '45-54', '55+'];

    /* ================= Social Media ================= */
    function renderSocial() {
        if (!$('social-stats')) return;
        const today = iso(new Date()), ago = daysAgo(30);
        const now = M.totalFollowers(), then = M.totalFollowers(ago);
        const net = M.sumSnaps('gained', ago, today) - M.sumSnaps('lost', ago, today);
        $('social-stats').innerHTML = statsHtml([
            { icon: 'fas fa-users', labelKey: 'soc.totalFollowers', value: SP.fmtNum(now), trend: trend(now, then) },
            { icon: 'fas fa-user-plus', labelKey: 'soc.net30', value: (net > 0 ? '+' : '') + SP.fmtNum(net) },
            { icon: 'fas fa-chart-line', labelKey: 'social.stat2.label', value: then ? SP.fmtPct((now - then) / then * 100) : '—' }
        ]);

        const latest = M.latestByPlatform();
        const rows = Object.values(latest).sort((a, b) => b.followers - a.followers).map(s => {
            const before = M.latestByPlatform(ago)[s.platform];
            const diff = before ? s.followers - before.followers : null;
            const diffHtml = diff === null ? '—' : `<span class="${diff >= 0 ? 'sp-pos' : 'sp-neg'}">${diff > 0 ? '+' : ''}${esc(SP.fmtNum(diff))}</span>`;
            return [SP.platCell(s.platform), SP.fmtNum(s.followers), diffHtml, esc(SP.fmtDate(s.date))];
        });
        $('social-platforms').innerHTML = rows.length
            ? table([{ key: 'common.platform' }, { key: 'soc.followers', cls: 'sp-num' }, { key: 'soc.change30', cls: 'sp-num' }, { key: 'soc.lastUpdate', cls: 'sp-num' }], rows)
            : `<div class="sp-empty"><i class="fas fa-users"></i><p>${esc(T('soc.noSnap'))}</p><button type="button" class="balance-btn send sp-inline-btn" onclick="showPage('followers')">${esc(T('soc.toFollowers'))}</button></div>`;

        const months = lastMonths(12);
        const platforms = Object.keys(latest);
        const b = chartBase();
        SP.drawChart('chart_social', {
            type: 'line',
            data: {
                labels: months.map(monthLabel),
                datasets: platforms.map(pl => ({
                    label: SP.platformLabel(pl),
                    data: months.map(mk => { const s = M.latestByPlatform(mk + '-31')[pl]; return s ? s.followers : null; }),
                    borderColor: SP.platColor(pl), backgroundColor: SP.platColor(pl) + '14', fill: false, tension: .35, borderWidth: 2, pointRadius: 2, spanGaps: true
                }))
            },
            options: (() => { const o = b.options(); o.scales.y.beginAtZero = false; return o; })()
        });
    }

    /* ================= Follower ================= */
    function renderFollowers() {
        if (!$('followers-stats')) return;
        const monthStart = iso(new Date()).slice(0, 8) + '01', today = iso(new Date());
        const gained = M.sumSnaps('gained', monthStart, today), lost = M.sumSnaps('lost', monthStart, today);
        const ago = daysAgo(30), now = M.totalFollowers(), then = M.totalFollowers(ago);
        $('followers-stats').innerHTML = statsHtml([
            { icon: 'fas fa-users', labelKey: 'followers.stat0.label', value: SP.fmtNum(gained), sub: T('fol.thisMonth') },
            { icon: 'fas fa-user-minus', labelKey: 'followers.stat1.label', value: SP.fmtNum(lost), sub: T('fol.thisMonth') },
            { icon: 'fas fa-chart-line', labelKey: 'followers.stat2.label', value: then ? SP.fmtPct((now - then) / then * 100) : '—', sub: T('eng.last30') }
        ]);
        const months = lastMonths(12);
        const b = chartBase();
        SP.drawChart('chart_followers', {
            type: 'bar',
            data: {
                labels: months.map(monthLabel),
                datasets: [
                    { label: T('fol.new'), data: months.map(mk => M.sumSnaps('gained', mk + '-01', mk + '-31')), backgroundColor: '#10b981', borderRadius: 4 },
                    { label: T('fol.lost'), data: months.map(mk => M.sumSnaps('lost', mk + '-01', mk + '-31')), backgroundColor: '#ef4444', borderRadius: 4 }
                ]
            },
            options: b.options()
        });
    }

    /* ================= Interaktionen ================= */
    function renderEngagement() {
        if (!$('engagement-stats')) return;
        const today = iso(new Date()), a30 = daysAgo(30), a60 = daysAgo(60), a31 = daysAgo(31);
        const cur = published().filter(p => p.date >= a30 && p.date <= today);
        const prev = published().filter(p => p.date >= a60 && p.date <= a31);
        const sum = (list, k) => list.reduce((a, p) => a + (p[k] || 0), 0);
        $('engagement-stats').innerHTML = statsHtml([
            { icon: 'fas fa-heart', labelKey: 'engagement.stat0.label', value: SP.fmtNum(sum(cur, 'likes')), trend: trend(sum(cur, 'likes'), sum(prev, 'likes')) },
            { icon: 'fas fa-comment', labelKey: 'engagement.stat1.label', value: SP.fmtNum(sum(cur, 'comments')), trend: trend(sum(cur, 'comments'), sum(prev, 'comments')) },
            { icon: 'fas fa-share', labelKey: 'engagement.stat2.label', value: SP.fmtNum(sum(cur, 'shares')), trend: trend(sum(cur, 'shares'), sum(prev, 'shares')) }
        ]);

        // 8 Wochen, Wochenbeginn Montag
        const weeks = [];
        const d = new Date(); d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        for (let i = 7; i >= 0; i--) {
            const s = new Date(d); s.setDate(d.getDate() - i * 7);
            const e = new Date(s); e.setDate(s.getDate() + 6);
            weeks.push([iso(s), iso(e)]);
        }
        const inWeek = ([s, e]) => published().filter(p => p.date >= s && p.date <= e);
        const b = chartBase();
        SP.drawChart('chart_engagement', {
            type: 'bar',
            data: {
                labels: weeks.map(([s]) => SP.fmtDate(s).slice(0, 6)),
                datasets: [
                    { label: T('engagement.d1'), data: weeks.map(w => sum(inWeek(w), 'likes')), backgroundColor: '#6366f1', borderRadius: 4 },
                    { label: T('engagement.d2'), data: weeks.map(w => sum(inWeek(w), 'comments')), backgroundColor: '#10b981', borderRadius: 4 },
                    { label: T('engagement.stat2.label'), data: weeks.map(w => sum(inWeek(w), 'shares')), backgroundColor: '#f59e0b', borderRadius: 4 }
                ]
            },
            options: b.options()
        });

        const top = published().slice().sort((x, y) => eng(y) - eng(x)).slice(0, 5);
        $('engagement-top').innerHTML = table(
            [{ key: 'common.date' }, { key: 'common.platform' }, { key: 'posts.f.title' }, { key: 'eng.total', cls: 'sp-num' }],
            top.map(p => [esc(SP.fmtDate(p.date)), SP.platCell(p.platform), `<span class="sp-path" title="${esc(p.title)}">${esc(p.title)}</span>`, SP.fmtNum(eng(p))]),
            'eng.noPosts'
        );

        const by = {};
        published().forEach(p => { const o = by[p.platform] = by[p.platform] || { n: 0, e: 0 }; o.n++; o.e += eng(p); });
        $('engagement-platforms').innerHTML = table(
            [{ key: 'common.platform' }, { key: 'eng.posts', cls: 'sp-num' }, { key: 'eng.total', cls: 'sp-num' }, { key: 'eng.perPost', cls: 'sp-num' }],
            Object.entries(by).sort((x, y) => y[1].e - x[1].e).map(([pl, o]) => [SP.platCell(pl), SP.fmtNum(o.n), SP.fmtNum(o.e), SP.fmtNum(o.e / o.n)]),
            'eng.noPosts'
        );
    }

    /* ================= Zielgruppe ================= */
    function cityBars(cities) {
        if (!cities || !cities.length) return '';
        const max = Math.max(...cities.map(c => c.share), 1);
        return '<div class="sp-bars">' + cities.map(c =>
            `<div class="sp-bar-row"><span class="sp-bar-label">${esc(c.name)}</span>` +
            `<span class="sp-bar-track"><span class="sp-bar-fill" style="width:${(c.share / max * 100).toFixed(1)}%"></span></span>` +
            `<span class="sp-bar-value">${esc(SP.fmtPct(c.share))}</span></div>`).join('') + '</div>';
    }
    SP.cityBars = cityBars;

    function renderAudience() {
        if (!$('audience-stats')) return;
        const a = SP.insights.data.audience;
        const ages = a ? a.ages : null;
        const topAge = ages ? AGE_KEYS.slice().sort((x, y) => ages[y] - ages[x])[0] : null;
        const g = a ? a.gender : null;
        const topCity = a && a.cities.length ? a.cities.slice().sort((x, y) => y.share - x.share)[0] : null;
        $('audience-stats').innerHTML = statsHtml([
            { icon: 'fas fa-user-friends', labelKey: 'audience.stat0.label', value: topAge && ages[topAge] ? topAge : '—', sub: topAge && ages[topAge] ? SP.fmtPct(ages[topAge]) : '' },
            { icon: 'fas fa-venus-mars', labelKey: 'audience.stat1.label', value: g && (g.female || g.male) ? SP.fmtNum(g.female) + '% / ' + SP.fmtNum(g.male) + '%' : '—',
              sub: g && (g.female || g.male) ? T('aud.female') + ' / ' + T('aud.male') : '' },
            { icon: 'fas fa-map-marker-alt', labelKey: 'audience.stat2.label', value: topCity ? topCity.name : '—', sub: topCity ? SP.fmtPct(topCity.share) : '' }
        ]);

        $('audience-legend').innerHTML = ages
            ? AGE_KEYS.map((k, i) => `<div class="legend-item"><span class="legend-dot" style="background:${AGE_COLORS[i]}"></span>${esc(k)} — ${esc(SP.fmtPct(ages[k]))}</div>`).join('')
            : `<p class="sp-help">${esc(T('aud.noData'))}</p>`;

        const b = chartBase();
        SP.drawChart('chart_audience', {
            type: 'doughnut',
            data: { labels: AGE_KEYS, datasets: [{ data: AGE_KEYS.map(k => ages ? ages[k] : 0), backgroundColor: AGE_COLORS, borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip: b.tooltip } }
        });

        renderAudienceForm(a);
    }

    function renderAudienceForm(a) {
        const box = $('audience-form');
        if (!box || box.dataset.dirty === '1') return;
        const ages = a ? a.ages : {}, g = a ? a.gender : {}, cities = a ? a.cities.slice() : [];
        while (cities.length < 5) cities.push({ name: '', share: '' });
        const num = (name, val, label) =>
            `<label class="sp-num-field"><span>${esc(label)}</span><input type="number" class="sp-input" name="${name}" min="0" max="100" step="0.1" inputmode="decimal" value="${val === '' || val == null ? '' : esc(val)}"></label>`;
        box.innerHTML =
            `<p class="sp-help">${esc(T('aud.formHelp'))}${a && a.updated_at ? ' ' + esc(T('aud.updated')) + ' ' + esc(SP.fmtDate(a.updated_at)) : ''}</p>` +
            `<h4 class="sp-subhead">${esc(T('aud.ages'))} <span class="sp-sum" data-sum="age"></span></h4>` +
            `<div class="sp-num-grid">${AGE_KEYS.map(k => num('age_' + k, ages[k], k)).join('')}</div>` +
            `<h4 class="sp-subhead">${esc(T('aud.gender'))} <span class="sp-sum" data-sum="gender"></span></h4>` +
            `<div class="sp-num-grid">${['female', 'male', 'diverse'].map(k => num('gender_' + k, g[k], T('aud.' + k))).join('')}</div>` +
            `<h4 class="sp-subhead">${esc(T('aud.cities'))}</h4>` +
            `<div class="sp-city-grid">${cities.slice(0, 8).map((c, i) =>
                `<input type="text" class="sp-input" name="city_${i}" maxlength="60" placeholder="${esc(T('aud.city'))} ${i + 1}" value="${esc(c.name)}">` +
                `<input type="number" class="sp-input" name="cityshare_${i}" min="0" max="100" step="0.1" inputmode="decimal" placeholder="%" value="${c.share === '' ? '' : esc(c.share)}">`).join('')}</div>` +
            `<div class="sp-actions"><button type="button" class="balance-btn send" data-save-audience>${esc(T('crud.save'))}</button></div>`;
        updateSums();
    }

    function updateSums() {
        const box = $('audience-form');
        if (!box) return;
        const sumOf = prefix => [...box.querySelectorAll(`input[name^="${prefix}"]`)].reduce((a, i) => a + (parseFloat(i.value) || 0), 0);
        [['age', 'age_'], ['gender', 'gender_']].forEach(([key, prefix]) => {
            const s = sumOf(prefix), el = box.querySelector(`[data-sum="${key}"]`);
            if (!el) return;
            el.textContent = s ? `Σ ${SP.fmtNum(s, 1)}%` : '';
            el.className = 'sp-sum' + (s && Math.abs(s - 100) > 0.5 ? ' sp-warn' : '');
            el.title = s && Math.abs(s - 100) > 0.5 ? T('aud.sumWarn') : '';
        });
    }

    async function saveAudience(btn) {
        const box = $('audience-form');
        const val = n => { const el = box.querySelector(`[name="${n}"]`); return el ? el.value.trim() : ''; };
        const audience = { ages: {}, gender: {}, cities: [] };
        AGE_KEYS.forEach(k => { audience.ages[k] = val('age_' + k); });
        ['female', 'male', 'diverse'].forEach(k => { audience.gender[k] = val('gender_' + k); });
        for (let i = 0; i < 8; i++) {
            const name = val('city_' + i);
            if (name) audience.cities.push({ name, share: val('cityshare_' + i) });
        }
        btn.disabled = true;
        const res = await SP.insights.save({ audience });
        btn.disabled = false;
        if (!res.ok) { SP.toast(T('crud.error') + (res.field ? ' (' + res.field.replace(/_/g, ' ') + ')' : ''), 'err'); return; }
        box.dataset.dirty = '';
        renderAudienceForm(SP.insights.data.audience);
        SP.toast(T('crud.saved'), 'ok');
    }

    /* ================= Verteilungskarte ================= */
    function renderMap() {
        if (!$('map-stats')) return;
        const a = SP.insights.data.audience;
        const cities = a ? a.cities.slice().sort((x, y) => y.share - x.share) : [];
        const top3 = cities.slice(0, 3).reduce((s, c) => s + c.share, 0);
        $('map-stats').innerHTML = statsHtml([
            { icon: 'fas fa-map-marker-alt', labelKey: 'map.stat0.label', value: SP.fmtNum(cities.length) },
            { icon: 'fas fa-crown', labelKey: 'map.stat1.label', value: cities[0] ? cities[0].name : '—', sub: cities[0] ? SP.fmtPct(cities[0].share) : '' },
            { icon: 'fas fa-percentage', labelKey: 'map.top3', value: cities.length ? SP.fmtPct(top3) : '—' }
        ]);
        $('map-cities').innerHTML = (cities.length ? cityBars(cities) : `<div class="sp-empty"><p>${esc(T('aud.noData'))}</p></div>`) +
            `<p class="sp-help" style="margin-top:14px;">${esc(T('map.source'))} <a href="#" class="sp-link" onclick="showPage('audience');return false;">${esc(T('map.toAudience'))}</a></p>`;
    }

    /* ---------- Start ---------- */
    function renderAll() {
        renderSocial();
        renderFollowers();
        renderEngagement();
        renderAudience();
        renderMap();
    }

    const origRebuild = window.rebuildAllCharts;
    window.rebuildAllCharts = function (lang) { origRebuild(lang); renderAll(); };

    document.addEventListener('DOMContentLoaded', () => {
        SP.crud({
            name: 'followers', page: 'followers', col: 'followers',
            mount: 'followers-crud', addKey: 'fol.add', emptyKey: 'fol.empty', emptyIcon: 'fas fa-users', noteKey: 'crud.manualNote',
            filterPlatform: true, searchKeys: ['platform'],
            fields: [
                { key: 'date', type: 'date', labelKey: 'common.date', required: true, default: SP.today },
                { key: 'platform', type: 'enum', labelKey: 'common.platform', required: true, options: () => SP.platformOptions(false) },
                { key: 'followers', type: 'int', labelKey: 'fol.f.followers', required: true, full: true },
                { key: 'gained', type: 'int', labelKey: 'fol.f.gained' },
                { key: 'lost', type: 'int', labelKey: 'fol.f.lost' }
            ],
            sort: (a, b) => (b.date || '').localeCompare(a.date || '') || (a.platform || '').localeCompare(b.platform || ''),
            columns: [
                { labelKey: 'common.date', cls: 'sp-nowrap', render: s => esc(SP.fmtDate(s.date)) },
                { labelKey: 'common.platform', render: s => SP.platCell(s.platform) },
                { labelKey: 'soc.followers', cls: 'sp-num', render: s => SP.fmtNum(s.followers) },
                { labelKey: 'fol.new', cls: 'sp-num', render: s => s.gained ? `<span class="sp-pos">+${esc(SP.fmtNum(s.gained))}</span>` : '—' },
                { labelKey: 'fol.lost', cls: 'sp-num', render: s => s.lost ? `<span class="sp-neg">−${esc(SP.fmtNum(s.lost))}</span>` : '—' }
            ]
        });

        ['followers', 'posts'].forEach(col => { SP.data.subscribe(col, renderAll); SP.data.load(col); });
        SP.insights.subscribe(renderAll);
        SP.insights.load();
        SP.onLangChange(() => { const f = $('audience-form'); if (f) f.dataset.dirty = ''; renderAll(); });

        const form = $('audience-form');
        if (form) {
            form.addEventListener('input', () => { form.dataset.dirty = '1'; updateSums(); });
            form.addEventListener('click', e => { const b = e.target.closest('[data-save-audience]'); if (b) saveAudience(b); });
        }
    });
})();
