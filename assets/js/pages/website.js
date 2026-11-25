/**
 * SocialPulse – Webseite, Besuche & Landingpage (eigenes Tracking)
 * Pfad: /assets/js/pages/website.js
 */
(function () {
    'use strict';
    const esc = SP.esc, $ = SP.$, T = key => SP.tr(key);

    /* Demo-Diagramme dieser Seiten durch echte Daten ersetzen */
    const OWN = ['chart_website', 'chart_visits', 'chart_landing'];
    for (let i = CHART_CONFIGS.length - 1; i >= 0; i--) {
        if (OWN.includes(CHART_CONFIGS[i].canvas)) CHART_CONFIGS.splice(i, 1);
    }

    SP.addTranslations({
        'web.chartTitle':  { de: 'Besucher & Seitenaufrufe', en: 'Visitors & page views', fr: 'Visiteurs & pages vues', ar: 'الزوار ومشاهدات الصفحات' },
        'web.topPages':    { de: 'Meistbesuchte Seiten', en: 'Top pages', fr: 'Pages les plus vues', ar: 'الصفحات الأكثر زيارة' },
        'web.page':        { de: 'Seite', en: 'Page', fr: 'Page', ar: 'الصفحة' },
        'web.views':       { de: 'Aufrufe', en: 'Views', fr: 'Vues', ar: 'المشاهدات' },
        'web.share':       { de: 'Anteil', en: 'Share', fr: 'Part', ar: 'النسبة' },
        'web.snippetTitle':{ de: 'Tracking-Code', en: 'Tracking code', fr: 'Code de suivi', ar: 'كود التتبع' },
        'web.snippetHelp': { de: 'Diese Zeile auf jeder Seite der Kunden-Webseite vor </head> einfügen. Es werden keine Cookies gesetzt und keine IP-Adressen gespeichert.', en: 'Add this line before </head> on every page of the client website. No cookies are set and no IP addresses are stored.', fr: 'Ajoutez cette ligne avant </head> sur chaque page du site. Aucun cookie, aucune adresse IP enregistrée.', ar: 'أضف هذا السطر قبل </head> في كل صفحات موقع العميل. لا يتم استخدام كوكيز ولا تخزين عناوين IP.' },
        'web.copy':        { de: 'Code kopieren', en: 'Copy code', fr: 'Copier le code', ar: 'نسخ الكود' },
        'web.copied':      { de: 'Kopiert.', en: 'Copied.', fr: 'Copié.', ar: 'تم النسخ.' },
        'web.siteOnly':    { de: 'Gezählt werden nur Aufrufe von:', en: 'Only visits from this domain are counted:', fr: 'Seules les visites de ce domaine sont comptées :', ar: 'يتم احتساب الزيارات من هذا النطاق فقط:' },
        'web.noSite':      { de: 'Keine Webseite hinterlegt – bitte in den Einstellungen eintragen.', en: 'No website set – please add it in Settings.', fr: 'Aucun site défini – ajoutez-le dans les paramètres.', ar: 'لا يوجد موقع محفوظ – أضفه من الإعدادات.' },
        'web.lastHit':     { de: 'Letzter Aufruf:', en: 'Last hit:', fr: 'Dernière visite :', ar: 'آخر زيارة:' },
        'web.noHit':       { de: 'Noch kein Aufruf empfangen.', en: 'No hits received yet.', fr: 'Aucune visite reçue.', ar: 'لم تصل أي زيارة بعد.' },
        'web.convHelp':    { de: "Formular-Absendungen zählen automatisch als Conversion. Eigene Ziele: spTrack('name').", en: "Form submissions count as conversions automatically. Custom goals: spTrack('name').", fr: "Les envois de formulaires comptent comme conversions. Objectifs personnalisés : spTrack('nom').", ar: "إرسال النماذج يُحسب كتحويل تلقائياً. أهداف مخصصة: spTrack('name')." },
        'web.last7':       { de: 'Letzte 7 Tage', en: 'Last 7 days', fr: '7 derniers jours', ar: 'آخر 7 أيام' },
        'web.last30':      { de: 'Letzte 30 Tage', en: 'Last 30 days', fr: '30 derniers jours', ar: 'آخر 30 يوم' },
        'web.last90':      { de: 'Letzte 90 Tage', en: 'Last 90 days', fr: '90 derniers jours', ar: 'آخر 90 يوم' },
        'web.period':      { de: 'Zeitraum', en: 'Period', fr: 'Période', ar: 'الفترة' },
        'web.noData':      { de: 'Noch keine Besucherdaten. Baue den Tracking-Code auf der Webseite ein.', en: 'No visitor data yet. Add the tracking code to the website.', fr: 'Pas encore de données. Ajoutez le code de suivi au site.', ar: 'لا توجد بيانات زوار بعد. أضف كود التتبع إلى الموقع.' },
        'web.toSnippet':   { de: 'Zum Tracking-Code', en: 'Go to tracking code', fr: 'Voir le code de suivi', ar: 'الذهاب لكود التتبع' },
        'web.empty':       { de: 'Keine Daten im Zeitraum.', en: 'No data in this period.', fr: 'Aucune donnée sur la période.', ar: 'لا بيانات في هذه الفترة.' },
        'web.sessions':    { de: 'Sitzungen', en: 'Sessions', fr: 'Sessions', ar: 'الجلسات' },
        'web.directShare': { de: 'Direkte Zugriffe', en: 'Direct traffic', fr: 'Accès directs', ar: 'الزيارات المباشرة' },
        'web.mobileShare': { de: 'Mobile Nutzer', en: 'Mobile users', fr: 'Utilisateurs mobiles', ar: 'مستخدمو الموبايل' },
        'web.referrers':   { de: 'Verweisende Webseiten', en: 'Referring sites', fr: 'Sites référents', ar: 'المواقع المُحيلة' },
        'web.domain':      { de: 'Domain', en: 'Domain', fr: 'Domaine', ar: 'النطاق' },
        'web.src.direct':  { de: 'Direkt', en: 'Direct', fr: 'Direct', ar: 'مباشر' },
        'web.src.search':  { de: 'Andere Suchmaschinen', en: 'Other search engines', fr: 'Autres moteurs', ar: 'محركات بحث أخرى' },
        'web.src.email':   { de: 'E-Mail', en: 'Email', fr: 'E-mail', ar: 'البريد الإلكتروني' },
        'web.src.referral':{ de: 'Verweise', en: 'Referrals', fr: 'Référents', ar: 'إحالات' },
        'web.src.other':   { de: 'Sonstige', en: 'Other', fr: 'Autre', ar: 'أخرى' },
        'web.lpTitle':     { de: 'Landingpages festlegen', en: 'Define landing pages', fr: 'Définir les pages de destination', ar: 'تحديد صفحات الهبوط' },
        'web.lpHelp':      { de: 'Pfad der Landingpage eingeben, z. B. /angebot. Mit * am Ende zählen alle Unterseiten.', en: 'Enter the landing page path, e.g. /offer. End with * to include all subpages.', fr: 'Saisissez le chemin, ex. /offre. Terminez par * pour inclure les sous-pages.', ar: 'أدخل مسار صفحة الهبوط، مثلاً /offer. أضف * بالنهاية لتشمل كل الصفحات الفرعية.' },
        'web.lpAdd':       { de: 'Hinzufügen', en: 'Add', fr: 'Ajouter', ar: 'إضافة' },
        'web.lpRemove':    { de: 'Entfernen', en: 'Remove', fr: 'Retirer', ar: 'إزالة' },
        'web.lpNone':      { de: 'Noch keine Landingpage festgelegt.', en: 'No landing page defined yet.', fr: 'Aucune page définie.', ar: 'لم يتم تحديد صفحة هبوط بعد.' },
        'web.badPath':     { de: 'Ungültiger Pfad.', en: 'Invalid path.', fr: 'Chemin invalide.', ar: 'مسار غير صالح.' },
        'web.lpPages':     { de: 'Landingpages im Detail', en: 'Landing pages in detail', fr: 'Détail des pages', ar: 'تفاصيل صفحات الهبوط' },
        'web.visits':      { de: 'Besuche', en: 'Visits', fr: 'Visites', ar: 'الزيارات' },
        'web.conv':        { de: 'Conversions', en: 'Conversions', fr: 'Conversions', ar: 'التحويلات' },
        'web.rate':        { de: 'Rate', en: 'Rate', fr: 'Taux', ar: 'النسبة' },
        'web.goals':       { de: 'Conversions nach Ziel', en: 'Conversions by goal', fr: 'Conversions par objectif', ar: 'التحويلات حسب الهدف' },
        'web.goal':        { de: 'Ziel', en: 'Goal', fr: 'Objectif', ar: 'الهدف' }
    });

    const SRC_COLOR = {
        direct: '#6366f1', google: '#f59e0b', instagram: '#ec4899', facebook: '#3b82f6', tiktok: '#14b8a6',
        youtube: '#ef4444', linkedin: '#0ea5e9', x: '#64748b', whatsapp: '#10b981', search: '#8b5cf6',
        email: '#a855f7', referral: '#94a3b8', other: '#cbd5e1'
    };
    const PLATFORM_SRC = ['google', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp'];
    const srcLabel = k => PLATFORM_SRC.includes(k) ? SP.platformLabel(k) : T('web.src.' + (SRC_COLOR[k] ? k : 'other'));
    const srcColor = k => SRC_COLOR[k] || SRC_COLOR.other;

    const state = { days: 30, data: null, loading: false };
    const charts = {};

    /* ---------- Formatierung ---------- */
    const ratio = (a, b) => (b > 0 ? a / b : 0);
    const pct = (a, b) => (b > 0 ? SP.fmtPct(a / b * 100) : '—');
    const avgDur = t => ratio(t.dur_sum, t.dur_n);
    const dur = s => { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    const shortDate = iso => {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
        return m ? new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString(SP.locale(), { day: '2-digit', month: '2-digit' }) : iso;
    };

    function trend(cur, prev, lowerIsBetter) {
        if (!prev) return null;
        const ch = (cur - prev) / prev * 100;
        if (!isFinite(ch) || Math.abs(ch) < 0.05) return null;
        const good = lowerIsBetter ? ch < 0 : ch > 0;
        return { html: `<i class="fas fa-arrow-${ch > 0 ? 'up' : 'down'}"></i> ${esc(SP.fmtNum(Math.abs(ch), 1))}%`, cls: good ? 'up' : 'down' };
    }

    function statsHtml(list) {
        return list.map(s =>
            `<div class="stat-card"><div class="stat-icon"><i class="${s.icon}"></i></div><div class="stat-info">` +
            `<div class="stat-label">${esc(T(s.labelKey))}</div><div class="stat-value">${esc(s.value)}</div>` +
            (s.trend ? `<span class="stat-change ${s.trend.cls}">${s.trend.html}</span>` : '') +
            `</div></div>`).join('');
    }

    function table(heads, rows) {
        if (!rows.length) return `<div class="sp-empty"><p>${esc(T('web.empty'))}</p></div>`;
        return '<div class="sp-table-wrap"><table class="data-table sp-mini"><thead><tr>' +
            heads.map(h => `<th class="${h.cls || ''}">${esc(T(h.key))}</th>`).join('') + '</tr></thead><tbody>' +
            rows.map(r => '<tr>' + r.map((c, i) => `<td class="${heads[i].cls || ''}">${c}</td>`).join('') + '</tr>').join('') +
            '</tbody></table></div>';
    }

    async function copyText(text) {
        try { await navigator.clipboard.writeText(text); return true; }
        catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
            ta.remove();
            return ok;
        }
    }

    /* ---------- Laden ---------- */
    async function load() {
        state.loading = true;
        renderAll();
        const res = await SP.api('web.stats', undefined, { days: state.days });
        state.loading = false;
        if (!res.ok) { SP.toast(SP.errText(res), 'err'); renderAll(); return; }
        state.data = res;
        renderAll();
        drawCharts();
    }

    /* ---------- Gemeinsame Elemente ---------- */
    function renderPeriods() {
        document.querySelectorAll('.sp-period').forEach(sel => {
            sel.innerHTML = [7, 30, 90].map(n => `<option value="${n}">${esc(T('web.last' + n))}</option>`).join('');
            sel.value = String(state.days);
            sel.setAttribute('aria-label', T('web.period'));
        });
    }

    function renderBanners() {
        const empty = state.data && !state.data.totals.pageviews;
        ['website-banner', 'visits-banner', 'landing-banner'].forEach(id => {
            const el = $(id);
            if (!el) return;
            el.hidden = !empty;
            if (empty) {
                el.innerHTML = `<i class="fas fa-info-circle"></i><span>${esc(T('web.noData'))}</span>` +
                    (id !== 'website-banner' ? `<button type="button" class="sp-btn-ghost" data-go-snippet>${esc(T('web.toSnippet'))}</button>` : '');
            }
        });
    }

    function loadingStats(ids) {
        ids.forEach(id => { const el = $(id); if (el) el.innerHTML = `<div class="sp-loading"><i class="fas fa-circle-notch fa-spin"></i> ${esc(T('crud.loading'))}</div>`; });
    }

    /* ---------- Seite: Webseite ---------- */
    function renderWebsite(d) {
        const t = d.totals, p = d.prev;
        $('website-stats').innerHTML = statsHtml([
            { icon: 'fas fa-users', labelKey: 'website.stat0.label', value: SP.fmtNum(t.visitors), trend: trend(t.visitors, p.visitors) },
            { icon: 'fas fa-percentage', labelKey: 'website.stat1.label', value: pct(t.bounces, t.sessions), trend: trend(ratio(t.bounces, t.sessions), ratio(p.bounces, p.sessions), true) },
            { icon: 'fas fa-clock', labelKey: 'website.stat2.label', value: dur(avgDur(t)), trend: trend(avgDur(t), avgDur(p)) }
        ]);

        $('website-pages').innerHTML = table(
            [{ key: 'web.page' }, { key: 'web.views', cls: 'sp-num' }, { key: 'web.share', cls: 'sp-num' }],
            d.pages.map(([path, n]) => [`<span class="sp-path" title="${esc(path)}">${esc(path)}</span>`, SP.fmtNum(n), esc(pct(n, t.pageviews))])
        );

        const src = new URL('assets/js/t.js', location.href).href;
        const code = `<script defer src="${src}"><\/script>`;
        const last = d.last_hit
            ? `${esc(T('web.lastHit'))} <strong>${esc(new Date(d.last_hit).toLocaleString(SP.locale(), { dateStyle: 'short', timeStyle: 'short' }))}</strong>`
            : `<span class="sp-warn">${esc(T('web.noHit'))}</span>`;
        $('website-snippet').innerHTML =
            `<p class="sp-help">${esc(T('web.snippetHelp'))}</p>` +
            `<pre class="sp-code"><code id="spSnippetCode">${esc(code)}</code></pre>` +
            `<div class="sp-actions" style="justify-content:flex-start;margin-top:10px;"><button type="button" class="balance-btn send" data-copy-snippet><i class="fas fa-copy"></i> ${esc(T('web.copy'))}</button></div>` +
            `<p class="sp-help">${d.site ? esc(T('web.siteOnly')) + ' <strong>' + esc(d.site) + '</strong>' : `<span class="sp-warn">${esc(T('web.noSite'))}</span>`}</p>` +
            `<p class="sp-help">${last}</p>` +
            `<p class="sp-help">${esc(T('web.convHelp'))}</p>`;
    }

    /* ---------- Seite: Besuche ---------- */
    function renderVisits(d) {
        const t = d.totals, p = d.prev;
        const direct = d.sources.direct || 0;
        $('visits-stats').innerHTML = statsHtml([
            { icon: 'fas fa-exchange-alt', labelKey: 'web.sessions', value: SP.fmtNum(t.sessions), trend: trend(t.sessions, p.sessions) },
            { icon: 'fas fa-sign-in-alt', labelKey: 'web.directShare', value: pct(direct, t.sessions) },
            { icon: 'fas fa-mobile-alt', labelKey: 'web.mobileShare', value: pct(d.devices.mobile || 0, t.sessions) }
        ]);

        const src = Object.entries(d.sources).sort((a, b) => b[1] - a[1]);
        $('visits-legend').innerHTML = src.length
            ? src.map(([k, n]) => `<div class="legend-item"><span class="legend-dot" style="background:${srcColor(k)}"></span>${esc(srcLabel(k))} — ${esc(pct(n, t.sessions))}</div>`).join('')
            : `<p class="sp-help">${esc(T('web.empty'))}</p>`;

        $('visits-referrers').innerHTML = table(
            [{ key: 'web.domain' }, { key: 'web.sessions', cls: 'sp-num' }, { key: 'web.share', cls: 'sp-num' }],
            d.referrers.map(([host, n]) => [esc(host), SP.fmtNum(n), esc(pct(n, t.sessions))])
        );
    }

    /* ---------- Seite: Landingpage ---------- */
    function renderLanding(d) {
        const t = d.totals, p = d.prev;
        $('landing-stats').innerHTML = statsHtml([
            { icon: 'fas fa-eye', labelKey: 'landing.stat0.label', value: SP.fmtNum(t.landing_visits), trend: trend(t.landing_visits, p.landing_visits) },
            { icon: 'fas fa-check-circle', labelKey: 'landing.stat1.label', value: pct(t.landing_conv, t.landing_visits),
              trend: trend(ratio(t.landing_conv, t.landing_visits), ratio(p.landing_conv, p.landing_visits)) },
            { icon: 'fas fa-file-signature', labelKey: 'web.conv', value: SP.fmtNum(t.landing_conv), trend: trend(t.landing_conv, p.landing_conv) }
        ]);

        const paths = d.landing_paths || [];
        $('landing-config').innerHTML =
            `<p class="sp-help">${esc(T('web.lpHelp'))}</p>` +
            `<div class="sp-chips">${paths.length
                ? paths.map(x => `<span class="sp-chip">${esc(x)}<button type="button" data-rm-path="${esc(x)}" aria-label="${esc(T('web.lpRemove'))}" title="${esc(T('web.lpRemove'))}"><i class="fas fa-times"></i></button></span>`).join('')
                : `<span class="sp-help">${esc(T('web.lpNone'))}</span>`}</div>` +
            `<div class="sp-inline-form"><input type="text" class="sp-input" id="lpInput" maxlength="200" placeholder="/angebot" aria-label="${esc(T('web.lpTitle'))}">` +
            `<button type="button" class="balance-btn send" data-add-path><i class="fas fa-plus"></i> ${esc(T('web.lpAdd'))}</button></div>`;

        $('landing-pages').innerHTML = table(
            [{ key: 'web.page' }, { key: 'web.visits', cls: 'sp-num' }, { key: 'web.conv', cls: 'sp-num' }, { key: 'web.rate', cls: 'sp-num' }],
            d.landing_pages.map(([path, v, c]) => [`<span class="sp-path" title="${esc(path)}">${esc(path)}</span>`, SP.fmtNum(v), SP.fmtNum(c), esc(pct(c, v))])
        );

        const convTotal = d.conversions.reduce((s, x) => s + x[1], 0);
        $('landing-goals').innerHTML = table(
            [{ key: 'web.goal' }, { key: 'web.conv', cls: 'sp-num' }, { key: 'web.share', cls: 'sp-num' }],
            d.conversions.map(([name, n]) => [esc(name), SP.fmtNum(n), esc(pct(n, convTotal))])
        );
    }

    function renderAll() {
        renderPeriods();
        if (state.loading || !state.data) {
            loadingStats(['website-stats', 'visits-stats', 'landing-stats']);
            return;
        }
        renderBanners();
        renderWebsite(state.data);
        renderVisits(state.data);
        renderLanding(state.data);
    }

    /* ---------- Diagramme ---------- */
    function draw(id, config) {
        const el = $(id);
        if (!el || typeof Chart === 'undefined') return;
        if (charts[id]) charts[id].destroy();
        charts[id] = new Chart(el.getContext('2d'), config);
    }

    function groupLanding(d) {
        const s = d.series;
        if (d.days !== 90) return { labels: s.map(x => shortDate(x.date)), visits: s.map(x => x.landing_visits), conv: s.map(x => x.landing_conv) };
        const out = { labels: [], visits: [], conv: [] };
        for (let i = 0; i < s.length; i += 7) {
            const chunk = s.slice(i, i + 7);
            out.labels.push(shortDate(chunk[0].date));
            out.visits.push(chunk.reduce((a, x) => a + x.landing_visits, 0));
            out.conv.push(chunk.reduce((a, x) => a + x.landing_conv, 0));
        }
        return out;
    }

    function drawCharts() {
        const d = state.data;
        if (!d) return;
        const dark = document.body.classList.contains('dark-mode');
        const text = dark ? '#9ca3af' : '#6b7280';
        const grid = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        const tooltip = { backgroundColor: dark ? '#1a1d29' : '#fff', titleColor: dark ? '#fff' : '#1f2937', bodyColor: text, borderColor: dark ? '#2d3748' : '#e5e7eb', borderWidth: 1, padding: 12, usePointStyle: true };
        const base = () => ({
            responsive: true, maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { display: true, position: 'bottom', labels: { color: text, usePointStyle: true, boxWidth: 8 } }, tooltip },
            scales: {
                x: { grid: { display: false }, ticks: { color: text, font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
                y: { beginAtZero: true, grid: { color: grid }, ticks: { color: text, font: { size: 11 }, precision: 0 } }
            }
        });
        const line = (label, data, color) => ({ label, data, borderColor: color, backgroundColor: color + '14', fill: true, tension: .35, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5 });

        draw('chart_website', {
            type: 'line',
            data: { labels: d.series.map(x => shortDate(x.date)), datasets: [
                line(T('website.d1'), d.series.map(x => x.visitors), '#6366f1'),
                line(T('website.d2'), d.series.map(x => x.pageviews), '#10b981')
            ] },
            options: base()
        });

        const src = Object.entries(d.sources).sort((a, b) => b[1] - a[1]);
        draw('chart_visits', {
            type: 'doughnut',
            data: { labels: src.map(([k]) => srcLabel(k)), datasets: [{ data: src.map(x => x[1]), backgroundColor: src.map(([k]) => srcColor(k)), borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip } }
        });

        const g = groupLanding(d);
        draw('chart_landing', {
            type: 'bar',
            data: { labels: g.labels, datasets: [
                { label: T('landing.d1'), data: g.visits, backgroundColor: '#6366f1', borderRadius: 4 },
                { label: T('landing.d2'), data: g.conv, backgroundColor: '#10b981', borderRadius: 4 }
            ] },
            options: base()
        });
    }

    /* Bei Sprachwechsel & Dark-Mode mitzeichnen */
    const origRebuild = window.rebuildAllCharts;
    window.rebuildAllCharts = function (lang) { origRebuild(lang); drawCharts(); };

    /* ---------- Landingpage-Pfade speichern ---------- */
    async function savePaths(paths) {
        const res = await SP.api('web.landing', { paths });
        if (!res.ok) {
            SP.toast(res.error === 'path' ? T('web.badPath') + ' ' + (res.value || '') : SP.errText(res), 'err');
            return false;
        }
        SP.toast(T('crud.saved'), 'ok');
        await load();
        return true;
    }

    /* ---------- Start ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        if (!$('website-stats')) return;

        document.querySelectorAll('.sp-period').forEach(sel => sel.addEventListener('change', () => {
            state.days = parseInt(sel.value, 10) || 30;
            load();
        }));

        document.addEventListener('click', async e => {
            if (e.target.closest('[data-go-snippet]')) {
                showPage('website');
                setTimeout(() => { const c = $('tracking-card'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
                return;
            }
            if (e.target.closest('[data-copy-snippet]')) {
                const code = $('spSnippetCode');
                const ok = code && await copyText(code.textContent);
                SP.toast(ok ? T('web.copied') : T('crud.error'), ok ? 'ok' : 'err');
                return;
            }
            const rm = e.target.closest('[data-rm-path]');
            if (rm && state.data) {
                savePaths(state.data.landing_paths.filter(x => x !== rm.dataset.rmPath));
                return;
            }
            if (e.target.closest('[data-add-path]') && state.data) {
                const inp = $('lpInput');
                const v = inp.value.trim();
                if (!v) { inp.focus(); return; }
                savePaths(state.data.landing_paths.concat([v]));
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.target && e.target.id === 'lpInput') {
                e.preventDefault();
                const btn = document.querySelector('[data-add-path]');
                if (btn) btn.click();
            }
        });

        SP.onLangChange(renderAll);
        load();
    });
})();
