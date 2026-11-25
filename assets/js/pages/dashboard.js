/**
 * SocialPulse – Startseite (Analysen) mit echten Daten
 * Pfad: /assets/js/pages/dashboard.js
 */
(function () {
    'use strict';
    const esc = SP.esc, $ = SP.$, T = k => SP.tr(k);
    const M = SP.metrics;

    const OWN = ['salesChart', 'socialChart'];
    for (let i = CHART_CONFIGS.length - 1; i >= 0; i--) {
        if (OWN.includes(CHART_CONFIGS[i].canvas)) CHART_CONFIGS.splice(i, 1);
    }

    SP.addTranslations({
        'dash.visitors':    { de: 'Webseiten-Besucher', en: 'Website visitors', fr: 'Visiteurs du site', ar: 'زوار الموقع' },
        'dash.last30':      { de: 'Letzte 30 Tage', en: 'Last 30 days', fr: '30 derniers jours', ar: 'آخر 30 يوم' },
        'dash.last12':      { de: 'Letzte 12 Monate', en: 'Last 12 months', fr: '12 derniers mois', ar: 'آخر 12 شهر' },
        'dash.reviews':     { de: 'Bewertungen', en: 'reviews', fr: 'avis', ar: 'تقييم' },
        'dash.visitorsToday': { de: 'Besucher heute', en: 'Visitors today', fr: "Visiteurs aujourd'hui", ar: 'زوار اليوم' },
        'dash.toVisits':    { de: 'Quellen ansehen', en: 'View sources', fr: 'Voir les sources', ar: 'عرض المصادر' },
        'dash.toWebsite':   { de: 'Zur Webseite', en: 'Website details', fr: 'Détails du site', ar: 'تفاصيل الموقع' },
        'dash.tipTitle':    { de: 'Empfehlung aus deinen Daten', en: 'Recommendation from your data', fr: 'Recommandation basée sur vos données', ar: 'توصية من بياناتك' },
        'dash.bestDay':     { de: 'Bester Wochentag zum Posten', en: 'Best weekday to post', fr: 'Meilleur jour pour publier', ar: 'أفضل يوم للنشر' },
        'dash.bestDayText': { de: 'Basierend auf den Interaktionen deiner bisherigen Beiträge', en: 'Based on the engagement of your previous posts', fr: 'Basé sur les interactions de vos publications', ar: 'بناءً على تفاعل منشوراتك السابقة' },
        'dash.aboveAvg':    { de: 'über dem Durchschnitt', en: 'above average', fr: 'au-dessus de la moyenne', ar: 'فوق المتوسط' },
        'dash.analysed':    { de: 'Beiträge ausgewertet', en: 'posts analysed', fr: 'publications analysées', ar: 'منشور تم تحليله' },
        'dash.needPosts':   { de: 'Mindestens 5 Beiträge mit Zahlen nötig', en: 'At least 5 posts with numbers needed', fr: 'Au moins 5 publications nécessaires', ar: 'يلزم 5 منشورات على الأقل بأرقام' },
        'dash.ofGoal':      { de: 'des Monatsziels', en: 'of monthly goal', fr: "de l'objectif mensuel", ar: 'من الهدف الشهري' },
        'dash.reachMonth':  { de: 'Reichweite diesen Monat', en: 'Reach this month', fr: 'Portée ce mois', ar: 'الوصول هذا الشهر' },
        'dash.noGoal':      { de: 'Kein Ziel festgelegt', en: 'No goal set', fr: 'Aucun objectif', ar: 'لا يوجد هدف' },
        'dash.goals':       { de: 'Monatsziele', en: 'Monthly goals', fr: 'Objectifs mensuels', ar: 'الأهداف الشهرية' },
        'dash.goalPosts':   { de: 'Beiträge pro Monat', en: 'Posts per month', fr: 'Publications par mois', ar: 'منشورات بالشهر' },
        'dash.goalReach':   { de: 'Reichweite pro Monat', en: 'Reach per month', fr: 'Portée par mois', ar: 'الوصول بالشهر' },
        'dash.editGoals':   { de: 'Ziele bearbeiten', en: 'Edit goals', fr: 'Modifier les objectifs', ar: 'تعديل الأهداف' },
        'dash.scoreParts':  { de: 'Berechnet aus:', en: 'Calculated from:', fr: 'Calculé à partir de :', ar: 'محسوب من:' },
        'dash.sc.posting':  { de: 'Beitragsziel', en: 'Posting goal', fr: 'Objectif de publication', ar: 'هدف النشر' },
        'dash.sc.reviews':  { de: 'Antworten auf Bewertungen', en: 'Review replies', fr: 'Réponses aux avis', ar: 'الرد على التقييمات' },
        'dash.sc.messages': { de: 'Antworten auf Nachrichten', en: 'Message replies', fr: 'Réponses aux messages', ar: 'الرد على الرسائل' },
        'dash.sc.rating':   { de: 'Google-Bewertung', en: 'Google rating', fr: 'Note Google', ar: 'تقييم غوغل' },
        'dash.sc.growth':   { de: 'Follower-Wachstum', en: 'Follower growth', fr: 'Croissance des abonnés', ar: 'نمو المتابعين' },
        'dash.noCities':    { de: 'Noch keine Städte hinterlegt.', en: 'No cities yet.', fr: 'Aucune ville.', ar: 'لا توجد مدن بعد.' }
    });

    const state = { web: null };
    const today = () => M.iso(new Date());
    const monthStart = () => today().slice(0, 8) + '01';
    const ratio = (a, b) => (b > 0 ? a / b : 0);

    function trend(cur, prev) {
        if (!prev) return '';
        const ch = (cur - prev) / prev * 100;
        if (!isFinite(ch) || Math.abs(ch) < 0.05) return '';
        return `<span class="stat-change ${ch > 0 ? 'up' : 'down'}"><i class="fas fa-arrow-${ch > 0 ? 'up' : 'down'}"></i> ${esc(SP.fmtNum(Math.abs(ch), 1))}%</span>`;
    }

    function goals() {
        const g = SP.insights.data.goals || {};
        return { posts: g.posts_per_month || 12, reach: g.reach_per_month || 0 };
    }

    /* ---------- Kennzahlen-Karten ---------- */
    function renderStats() {
        const t = today(), a30 = M.daysAgo(30), a60 = M.daysAgo(60), a31 = M.daysAgo(31);
        const fNow = M.totalFollowers(), fThen = M.totalFollowers(a30);
        const eNow = M.engagementBetween(a30, t), ePrev = M.engagementBetween(a60, a31);
        const reviews = SP.data.items('reviews');
        const avg = reviews.length ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length : 0;
        const w = state.web;

        const cards = [
            { icon: 'fas fa-users', label: 'analytics.stat0.label', value: SP.fmtNum(fNow), trend: trend(fNow, fThen), spark: 'spark1' },
            { icon: 'fas fa-mouse-pointer', label: 'dash.visitors', value: w ? SP.fmtNum(w.totals.visitors) : '—', trend: w ? trend(w.totals.visitors, w.prev.visitors) : '', spark: 'spark2' },
            { icon: 'fas fa-heart', label: 'analytics.stat2.label', value: SP.fmtNum(eNow), trend: trend(eNow, ePrev), spark: 'spark3' },
            { icon: 'fas fa-star', label: 'analytics.stat3.label', value: reviews.length ? SP.fmtNum(avg, 1) + ' ★' : '—',
              trend: reviews.length ? `<span class="stat-change neutral">${esc(SP.fmtNum(reviews.length))} ${esc(T('dash.reviews'))}</span>` : '', spark: 'spark4' }
        ];
        $('dash-stats').innerHTML = cards.map(c =>
            `<div class="stat-card"><div class="stat-icon"><i class="${c.icon}"></i></div><div class="stat-info">` +
            `<div class="stat-label">${esc(T(c.label))}</div><div class="stat-value">${esc(c.value)}</div>${c.trend}</div>` +
            `<canvas class="stat-sparkline" id="${c.spark}"></canvas></div>`).join('');

        // Sparklines
        const months = M.lastMonths(7);
        const spark = (id, data, color) => SP.drawChart(id, {
            type: 'bar',
            data: { labels: data.map((_, i) => i), datasets: [{ data, backgroundColor: color, borderRadius: 2, barThickness: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, beginAtZero: true } } }
        });
        spark('spark1', months.map(mk => M.totalFollowers(mk + '-31')), '#6366f1');
        spark('spark2', w ? w.series.slice(-7).map(x => x.visitors) : [], '#6366f1');
        const weeks = [];
        for (let i = 6; i >= 0; i--) weeks.push(M.engagementBetween(M.daysAgo(i * 7 + 6), M.daysAgo(i * 7)));
        spark('spark3', weeks, eNow >= ePrev ? '#6366f1' : '#ef4444');
        spark('spark4', reviews.slice().sort((x, y) => (x.date || '').localeCompare(y.date || '')).slice(-7).map(r => Number(r.rating) || 0), '#f59e0b');
    }

    /* ---------- Großes Diagramm (12 Monate) ---------- */
    function renderMain() {
        const months = M.lastMonths(12);
        const from = months[0] + '-01', to = today();
        const gained = M.sumSnaps('gained', from, to), lost = M.sumSnaps('lost', from, to);
        const reach = M.published().filter(p => p.date >= from).reduce((s, p) => s + (p.reach || 0), 0);
        $('dash-reach').textContent = SP.fmtNum(reach);
        $('dash-summary').innerHTML = [
            ['analytics.sum0', SP.fmtNum(gained), 'up'],
            ['analytics.sum1', SP.fmtNum(lost), 'down'],
            ['analytics.sum2', (gained - lost > 0 ? '+' : '') + SP.fmtNum(gained - lost), gained >= lost ? 'up' : 'down']
        ].map(([k, v, cls]) => `<div class="summary-item"><div class="summary-label">${esc(T(k))}</div><div class="summary-value ${cls === 'down' && k !== 'analytics.sum1' ? 'sp-neg' : ''}">${esc(v)}</div></div>`).join('');

        const b = SP.chartBase();
        SP.drawChart('salesChart', {
            type: 'line',
            data: {
                labels: months.map(M.monthLabel),
                datasets: [
                    { label: T('analytics.d1'), data: months.map(mk => M.sumSnaps('gained', mk + '-01', mk + '-31')), borderColor: '#6366f1', backgroundColor: '#6366f114', fill: true, tension: .4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 6 },
                    { label: T('analytics.d2'), data: months.map(mk => M.engagementBetween(mk + '-01', mk + '-31')), borderColor: '#10b981', backgroundColor: '#10b98114', fill: true, tension: .4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 6 }
                ]
            },
            options: b.options()
        });
    }

    /* ---------- Performance-Score ---------- */
    function renderScore() {
        const parts = [];
        const now = new Date();
        const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const postsMonth = M.published().filter(p => p.date >= monthStart()).length;
        const expected = goals().posts * now.getDate() / dim;
        parts.push(['dash.sc.posting', Math.min(100, ratio(postsMonth, Math.max(expected, 1)) * 100)]);

        const reviews = SP.data.items('reviews');
        if (reviews.length) {
            parts.push(['dash.sc.reviews', ratio(reviews.filter(r => r.replied).length, reviews.length) * 100]);
            parts.push(['dash.sc.rating', reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length / 5 * 100]);
        }
        const msgs = SP.data.items('messages');
        if (msgs.length) parts.push(['dash.sc.messages', ratio(msgs.filter(m => m.answered).length, msgs.length) * 100]);
        const fNow = M.totalFollowers(), fThen = M.totalFollowers(M.daysAgo(30));
        if (fThen) parts.push(['dash.sc.growth', Math.max(0, Math.min(100, (fNow - fThen) / fThen * 100 / 5 * 100))]);

        const score = Math.round(parts.reduce((s, p) => s + p[1], 0) / parts.length);
        const el = $('dash-score');
        el.textContent = score + ' / 100';
        el.title = T('dash.scoreParts') + '\n' + parts.map(([k, v]) => '• ' + T(k) + ': ' + Math.round(v)).join('\n');

        const gained = M.sumSnaps('gained', monthStart(), today()), lost = M.sumSnaps('lost', monthStart(), today());
        $('dash-balance').innerHTML =
            `<div class="balance-stat"><div class="balance-stat-icon income"><i class="fas fa-arrow-down"></i></div><div class="balance-stat-info"><div>${esc(SP.fmtNum(gained))}</div><div>${esc(T('analytics.bs0'))}</div></div></div>` +
            `<div class="balance-stat"><div class="balance-stat-icon expense"><i class="fas fa-arrow-up"></i></div><div class="balance-stat-info"><div>${esc(SP.fmtNum(lost))}</div><div>${esc(T('analytics.bs1'))}</div></div></div>`;
    }

    /* ---------- Mini-Karten (Monatsziele) ---------- */
    function renderMinis() {
        const g = goals();
        const posts = M.published().filter(p => p.date >= monthStart());
        const reach = posts.reduce((s, p) => s + (p.reach || 0), 0);
        const pPct = Math.min(100, ratio(posts.length, g.posts) * 100);
        const rPct = g.reach ? Math.min(100, ratio(reach, g.reach) * 100) : 0;
        const edit = `<button type="button" class="sp-icon-btn sp-mini-edit" data-edit-goals title="${esc(T('dash.editGoals'))}" aria-label="${esc(T('dash.editGoals'))}"><i class="fas fa-pen"></i></button>`;
        $('dash-minis').innerHTML =
            `<div class="mini-card">${edit}<div class="mini-card-icon purple"><i class="fas fa-calendar-check"></i></div>` +
            `<div class="mini-card-value">${esc(SP.fmtNum(posts.length))} / ${esc(SP.fmtNum(g.posts))}</div>` +
            `<div class="mini-card-label">${esc(T('analytics.mc0'))}</div>` +
            `<div class="mini-card-target">${esc(SP.fmtNum(pPct))}% ${esc(T('dash.ofGoal'))}</div>` +
            `<div class="progress-bar"><div class="progress-fill purple" style="width:${pPct.toFixed(0)}%"></div></div></div>` +
            `<div class="mini-card">${edit}<div class="mini-card-icon green"><i class="fas fa-eye"></i></div>` +
            `<div class="mini-card-value">${esc(SP.fmtNum(reach))}</div>` +
            `<div class="mini-card-label">${esc(T('dash.reachMonth'))}</div>` +
            `<div class="mini-card-target">${g.reach ? esc(SP.fmtNum(rPct)) + '% ' + esc(T('dash.ofGoal')) : esc(T('dash.noGoal'))}</div>` +
            `<div class="progress-bar"><div class="progress-fill green" style="width:${rPct.toFixed(0)}%"></div></div></div>`;
    }

    function openGoals() {
        const g = goals();
        const form = document.createElement('form');
        form.className = 'sp-form';
        form.innerHTML =
            `<div class="form-group"><label for="goalPosts">${esc(T('dash.goalPosts'))}</label><input id="goalPosts" class="sp-input" type="number" min="1" max="500" step="1" value="${g.posts}"></div>` +
            `<div class="form-group"><label for="goalReach">${esc(T('dash.goalReach'))}</label><input id="goalReach" class="sp-input" type="number" min="0" step="1" value="${g.reach || ''}"></div>` +
            `<button type="submit" class="sp-sr" tabindex="-1">OK</button>`;
        let btns;
        const submit = async () => {
            btns[1].disabled = true;
            const res = await SP.insights.save({ goals: { posts_per_month: form.querySelector('#goalPosts').value, reach_per_month: form.querySelector('#goalReach').value || 0 } });
            btns[1].disabled = false;
            if (!res.ok) { SP.toast(SP.errText(res, [{ key: 'posts_per_month', labelKey: 'dash.goalPosts' }, { key: 'reach_per_month', labelKey: 'dash.goalReach' }]), 'err'); return; }
            SP.closeModal();
            SP.toast(T('crud.saved'), 'ok');
        };
        form.addEventListener('submit', e => { e.preventDefault(); submit(); });
        btns = SP.openModal(T('dash.goals'), form, [
            { labelKey: 'crud.cancel', cls: 'sp-btn-ghost', onClick: SP.closeModal },
            { labelKey: 'crud.save', cls: 'balance-btn send', onClick: submit }
        ]);
        form.querySelector('#goalPosts').focus();
    }

    /* ---------- Untere Reihe ---------- */
    function renderBottom() {
        const w = state.web;
        const src = w ? Object.entries(w.sources).sort((a, b) => b[1] - a[1]) : [];
        const COLORS = { direct: '#6366f1', google: '#f59e0b', instagram: '#ec4899', facebook: '#3b82f6', tiktok: '#14b8a6', youtube: '#ef4444', linkedin: '#0ea5e9', x: '#64748b', whatsapp: '#10b981', search: '#8b5cf6', email: '#a855f7', referral: '#94a3b8' };
        const PL = ['google', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp'];
        const label = k => PL.includes(k) ? SP.platformLabel(k) : T('web.src.' + (COLORS[k] ? k : 'other'));
        $('dash-donut-value').textContent = w ? SP.fmtNum(w.totals.sessions) : '—';
        $('dash-today').textContent = w && w.series.length ? SP.fmtNum(w.series[w.series.length - 1].visitors) : '—';
        const b = SP.chartBase();
        SP.drawChart('socialChart', {
            type: 'doughnut',
            data: { labels: src.map(([k]) => label(k)), datasets: [{ data: src.map(x => x[1]), backgroundColor: src.map(([k]) => COLORS[k] || '#cbd5e1'), borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: b.tooltip } }
        });

        const a = SP.insights.data.audience;
        const cities = a ? a.cities.slice().sort((x, y) => y.share - x.share).slice(0, 5) : [];
        $('dash-cities').innerHTML = cities.length ? SP.cityBars(cities) : `<div class="sp-empty"><p>${esc(T('dash.noCities'))}</p></div>`;

        // Bester Wochentag
        const posts = M.published().filter(p => M.eng(p) > 0);
        if (posts.length >= 5) {
            const by = Array.from({ length: 7 }, () => ({ n: 0, e: 0 }));
            posts.forEach(p => { const [y, m, d] = p.date.split('-').map(Number); const wd = new Date(y, m - 1, d).getDay(); by[wd].n++; by[wd].e += M.eng(p); });
            const overall = posts.reduce((s, p) => s + M.eng(p), 0) / posts.length;
            let best = -1, bestAvg = 0;
            by.forEach((o, i) => { if (o.n && o.e / o.n > bestAvg) { bestAvg = o.e / o.n; best = i; } });
            const ref = new Date(2024, 0, 7 + best); // 7.1.2024 = Sonntag
            $('dash-bestday').textContent = ref.toLocaleDateString(SP.locale(), { weekday: 'long' });
            const plus = overall ? (bestAvg - overall) / overall * 100 : 0;
            $('dash-bestday-meta').innerHTML =
                `<span><i class="fas fa-chart-line"></i> +${esc(SP.fmtNum(plus))}% ${esc(T('dash.aboveAvg'))}</span>` +
                `<span><i class="fas fa-newspaper"></i> ${esc(SP.fmtNum(posts.length))} ${esc(T('dash.analysed'))}</span>`;
        } else {
            $('dash-bestday').textContent = '—';
            $('dash-bestday-meta').innerHTML = `<span><i class="fas fa-info-circle"></i> ${esc(T('dash.needPosts'))}</span>`;
        }
    }

    function renderAll() {
        if (!$('dash-stats')) return;
        renderStats();
        renderMain();
        renderScore();
        renderMinis();
        renderBottom();
    }

    const origRebuild = window.rebuildAllCharts;
    window.rebuildAllCharts = function (lang) { origRebuild(lang); renderAll(); };

    document.addEventListener('DOMContentLoaded', async () => {
        if (!$('dash-stats')) return;
        ['posts', 'followers', 'reviews', 'messages'].forEach(col => { SP.data.subscribe(col, renderAll); SP.data.load(col); });
        SP.insights.subscribe(renderAll);
        SP.onLangChange(renderAll);
        document.addEventListener('click', e => { if (e.target.closest('[data-edit-goals]')) openGoals(); });
        renderAll();
        const res = await SP.api('web.stats', undefined, { days: 30 });
        if (res.ok) { state.web = res; renderAll(); }
    });
})();
