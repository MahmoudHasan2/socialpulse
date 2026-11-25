/**
 * SocialPulse – Berichte (Monatsbericht zum Drucken/PDF) & CSV-Export
 * Pfad: /assets/js/pages/reports.js
 */
(function () {
    'use strict';
    const esc = SP.esc, $ = SP.$, T = k => SP.tr(k);

    SP.addTranslations({
        'rep.monthly':    { de: 'Monatsberichte', en: 'Monthly reports', fr: 'Rapports mensuels', ar: 'التقارير الشهرية' },
        'rep.month':      { de: 'Monat', en: 'Month', fr: 'Mois', ar: 'الشهر' },
        'rep.open':       { de: 'Bericht öffnen', en: 'Open report', fr: 'Ouvrir le rapport', ar: 'فتح التقرير' },
        'rep.records':    { de: 'Datensätze gesamt', en: 'Total records', fr: 'Enregistrements', ar: 'إجمالي السجلات' },
        'rep.export':     { de: 'Daten exportieren (CSV)', en: 'Export data (CSV)', fr: 'Exporter les données (CSV)', ar: 'تصدير البيانات (CSV)' },
        'rep.exportHelp': { de: 'CSV-Dateien lassen sich direkt in Excel öffnen.', en: 'CSV files open directly in Excel.', fr: "Les fichiers CSV s'ouvrent dans Excel.", ar: 'ملفات CSV بتنفتح مباشرة ببرنامج Excel.' },
        'rep.printHint':  { de: 'Der Bericht öffnet sich in einem neuen Tab. Über „Drucken“ lässt er sich als PDF speichern.', en: 'The report opens in a new tab. Use "Print" to save it as PDF.', fr: "Le rapport s'ouvre dans un nouvel onglet. « Imprimer » permet de l'enregistrer en PDF.", ar: 'التقرير بيفتح بتبويب جديد، ومن زر الطباعة فيك تحفظه PDF.' },
        'rep.print':      { de: 'Drucken / als PDF speichern', en: 'Print / save as PDF', fr: 'Imprimer / enregistrer en PDF', ar: 'طباعة / حفظ PDF' },
        'rep.popup':      { de: 'Bitte Pop-ups für diese Seite erlauben.', en: 'Please allow pop-ups for this site.', fr: 'Veuillez autoriser les pop-ups.', ar: 'يرجى السماح بالنوافذ المنبثقة لهذا الموقع.' },
        'rep.title':      { de: 'Monatsbericht', en: 'Monthly report', fr: 'Rapport mensuel', ar: 'التقرير الشهري' },
        'rep.created':    { de: 'Erstellt am', en: 'Created on', fr: 'Créé le', ar: 'تاريخ الإنشاء' },
        'rep.website':    { de: 'Webseite', en: 'Website', fr: 'Site web', ar: 'الموقع' },
        'rep.social':     { de: 'Social Media', en: 'Social media', fr: 'Réseaux sociaux', ar: 'السوشيال ميديا' },
        'rep.content':    { de: 'Beiträge', en: 'Posts', fr: 'Publications', ar: 'المنشورات' },
        'rep.care':       { de: 'Bewertungen & Nachrichten', en: 'Reviews & messages', fr: 'Avis & messages', ar: 'التقييمات والرسائل' },
        'rep.camps':      { de: 'Kampagnen', en: 'Campaigns', fr: 'Campagnes', ar: 'الحملات' },
        'rep.pageviews':  { de: 'Seitenaufrufe', en: 'Page views', fr: 'Pages vues', ar: 'مشاهدات الصفحات' },
        'rep.sources':    { de: 'Wichtigste Quellen', en: 'Top sources', fr: 'Principales sources', ar: 'أهم المصادر' },
        'rep.none':       { de: 'Keine Daten für diesen Monat.', en: 'No data for this month.', fr: 'Aucune donnée pour ce mois.', ar: 'لا بيانات لهذا الشهر.' },
        'rep.avgRating':  { de: 'Ø Bewertung', en: 'Avg. rating', fr: 'Note moyenne', ar: 'متوسط التقييم' },
        'rep.newReviews': { de: 'Neue Bewertungen', en: 'New reviews', fr: 'Nouveaux avis', ar: 'تقييمات جديدة' },
        'rep.msgs':       { de: 'Nachrichten', en: 'Messages', fr: 'Messages', ar: 'الرسائل' },
        'rep.answered':   { de: 'beantwortet', en: 'answered', fr: 'répondus', ar: 'تم الرد' },
        'rep.col.posts':     { de: 'Beiträge', en: 'Posts', fr: 'Publications', ar: 'المنشورات' },
        'rep.col.campaigns': { de: 'Kampagnen', en: 'Campaigns', fr: 'Campagnes', ar: 'الحملات' },
        'rep.col.reviews':   { de: 'Bewertungen', en: 'Reviews', fr: 'Avis', ar: 'التقييمات' },
        'rep.col.messages':  { de: 'Nachrichten', en: 'Messages', fr: 'Messages', ar: 'الرسائل' },
        'rep.col.inbox':     { de: 'Posteingang', en: 'Inbox', fr: 'Boîte de réception', ar: 'صندوق الوارد' },
        'rep.col.followers': { de: 'Follower-Stände', en: 'Follower counts', fr: 'Relevés d’abonnés', ar: 'أعداد المتابعين' },
        'rep.col.templates': { de: 'Vorlagen', en: 'Templates', fr: 'Modèles', ar: 'القوالب' }
    });

    const COLS = ['posts', 'campaigns', 'reviews', 'messages', 'inbox', 'followers', 'templates'];
    const M = () => SP.metrics;
    const inMonth = (d, mk) => (d || '').slice(0, 7) === mk;
    const eng = p => (p.likes || 0) + (p.comments || 0) + (p.shares || 0);

    function monthNumbers(mk) {
        const posts = SP.data.items('posts').filter(p => p.status !== 'planned' && inMonth(p.date, mk));
        const snaps = SP.data.items('followers').filter(s => inMonth(s.date, mk));
        return {
            posts: posts.length,
            engagement: posts.reduce((s, p) => s + eng(p), 0),
            gained: snaps.reduce((s, x) => s + (x.gained || 0), 0),
            reviews: SP.data.items('reviews').filter(r => inMonth(r.date, mk)).length
        };
    }

    function render() {
        if (!$('reports-stats')) return;
        const months = M().lastMonths(12).reverse();
        const withData = months.filter(mk => { const n = monthNumbers(mk); return n.posts || n.gained || n.reviews; });
        const records = COLS.reduce((s, c) => s + SP.data.items(c).length, 0);
        $('reports-stats').innerHTML = [
            ['fas fa-file-invoice', 'reports.stat0.label', SP.fmtNum(withData.length)],
            ['fas fa-calendar', 'reports.stat1.label', M().monthLabel(months[0])],
            ['fas fa-database', 'rep.records', SP.fmtNum(records)]
        ].map(([i, k, v]) => `<div class="stat-card"><div class="stat-icon"><i class="${i}"></i></div><div class="stat-info"><div class="stat-label">${esc(T(k))}</div><div class="stat-value">${esc(v)}</div></div></div>`).join('');

        $('reports-list').innerHTML = `<p class="sp-help">${esc(T('rep.printHint'))}</p>` +
            '<div class="sp-table-wrap"><table class="data-table sp-mini"><thead><tr>' +
            `<th>${esc(T('rep.month'))}</th><th class="sp-num">${esc(T('rep.content'))}</th><th class="sp-num">${esc(T('eng.total'))}</th><th class="sp-num">${esc(T('fol.new'))}</th><th class="sp-num">${esc(T('rep.newReviews'))}</th><th class="sp-num"></th></tr></thead><tbody>` +
            months.map(mk => {
                const n = monthNumbers(mk);
                return `<tr><td><strong>${esc(M().monthLabel(mk))}</strong></td><td class="sp-num">${SP.fmtNum(n.posts)}</td><td class="sp-num">${SP.fmtNum(n.engagement)}</td>` +
                    `<td class="sp-num">${SP.fmtNum(n.gained)}</td><td class="sp-num">${SP.fmtNum(n.reviews)}</td>` +
                    `<td class="sp-num"><button type="button" class="social-btn sp-rep-btn" data-report="${mk}"><i class="fas fa-file-alt"></i> ${esc(T('rep.open'))}</button></td></tr>`;
            }).join('') + '</tbody></table></div>';

        $('reports-export').innerHTML = `<p class="sp-help">${esc(T('rep.exportHelp'))}</p><div class="sp-export-grid">` +
            COLS.map(c => `<button type="button" class="social-btn" data-export="${c}"><i class="fas fa-download"></i> ${esc(T('rep.col.' + c))} <span class="sp-count">${SP.fmtNum(SP.data.items(c).length)}</span></button>`).join('') + '</div>';
    }

    /* ---------- CSV ---------- */
    function exportCsv(col) {
        const items = SP.data.items(col);
        const keys = [];
        items.forEach(it => Object.keys(it).forEach(k => { if (!keys.includes(k)) keys.push(k); }));
        const cell = v => {
            if (v === true) v = 'ja';
            if (v === false) v = 'nein';
            let s = String(v == null ? '' : v);
            if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
            return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        const csv = '\ufeff' + [keys.join(';')].concat(items.map(it => keys.map(k => cell(it[k])).join(';'))).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `socialpulse-${col}-${SP.today()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    /* ---------- Monatsbericht ---------- */
    async function openReport(mk) {
        const win = window.open('', '_blank');
        if (!win) { SP.toast(T('rep.popup'), 'err'); return; }
        win.document.write('<!DOCTYPE html><meta charset="utf-8"><title>…</title><p style="font-family:sans-serif;padding:40px">' + esc(T('crud.loading')) + '</p>');

        const [web, settings] = await Promise.all([
            SP.api('web.month', undefined, { month: mk }),
            SP.api('settings.get')
        ]);
        const client = settings.ok ? settings.client.name : '';
        const w = web.ok ? web : null;
        const pct = (a, b) => (b > 0 ? SP.fmtPct(a / b * 100) : '—');
        const dur = s => { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
        const monthEnd = mk + '-31';

        const posts = SP.data.items('posts').filter(p => p.status !== 'planned' && inMonth(p.date, mk));
        const snaps = SP.data.items('followers').filter(s => inMonth(s.date, mk));
        const latest = M().latestByPlatform(monthEnd);
        const reviews = SP.data.items('reviews').filter(r => inMonth(r.date, mk));
        const msgs = SP.data.items('messages').filter(m => inMonth(m.date, mk));
        const camps = SP.data.items('campaigns').filter(c => (c.start || '0000') <= monthEnd && (!c.end || c.end >= mk + '-01'));

        const kpi = (label, value) => `<div class="kpi"><div class="kpi-v">${esc(value)}</div><div class="kpi-l">${esc(label)}</div></div>`;
        const tbl = (heads, rows) => rows.length
            ? `<table><thead><tr>${heads.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
            : `<p class="muted">${esc(T('rep.none'))}</p>`;
        const srcLabel = k => ['google', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp'].includes(k) ? SP.platformLabel(k) : T('web.src.' + k);

        let html = `<h2>${esc(T('rep.website'))}</h2>`;
        if (w && w.totals.pageviews) {
            const t = w.totals;
            html += `<div class="kpis">${kpi(T('website.stat0.label'), SP.fmtNum(t.visitors))}${kpi(T('rep.pageviews'), SP.fmtNum(t.pageviews))}${kpi(T('website.stat1.label'), pct(t.bounces, t.sessions))}${kpi(T('website.stat2.label'), dur(t.dur_n ? t.dur_sum / t.dur_n : 0))}</div>`;
            const src = Object.entries(w.sources).sort((a, b) => b[1] - a[1]).slice(0, 6);
            html += `<h3>${esc(T('rep.sources'))}</h3>` + tbl([T('common.platform'), T('web.sessions'), T('web.share')], src.map(([k, n]) => [esc(srcLabel(k)), SP.fmtNum(n), pct(n, t.sessions)]));
            html += `<h3>${esc(T('web.topPages'))}</h3>` + tbl([T('web.page'), T('web.views')], w.pages.slice(0, 8).map(([p, n]) => [esc(p), SP.fmtNum(n)]));
        } else html += `<p class="muted">${esc(T('rep.none'))}</p>`;

        const gained = snaps.reduce((s, x) => s + (x.gained || 0), 0), lost = snaps.reduce((s, x) => s + (x.lost || 0), 0);
        html += `<h2>${esc(T('rep.social'))}</h2><div class="kpis">${kpi(T('soc.totalFollowers'), SP.fmtNum(Object.values(latest).reduce((s, x) => s + x.followers, 0)))}${kpi(T('analytics.sum0'), SP.fmtNum(gained))}${kpi(T('analytics.sum1'), SP.fmtNum(lost))}${kpi(T('analytics.sum2'), SP.fmtNum(gained - lost))}</div>`;
        html += tbl([T('common.platform'), T('soc.followers'), T('soc.lastUpdate')], Object.values(latest).map(s => [esc(SP.platformLabel(s.platform)), SP.fmtNum(s.followers), esc(SP.fmtDate(s.date))]));

        html += `<h2>${esc(T('rep.content'))}</h2><div class="kpis">${kpi(T('rep.content'), SP.fmtNum(posts.length))}${kpi(T('eng.total'), SP.fmtNum(posts.reduce((s, p) => s + eng(p), 0)))}${kpi(T('posts.f.reach'), SP.fmtNum(posts.reduce((s, p) => s + (p.reach || 0), 0)))}</div>`;
        html += tbl([T('common.date'), T('common.platform'), T('posts.f.title'), T('eng.total')],
            posts.slice().sort((a, b) => eng(b) - eng(a)).slice(0, 8).map(p => [esc(SP.fmtDate(p.date)), esc(SP.platformLabel(p.platform)), esc(p.title), SP.fmtNum(eng(p))]));

        const avg = reviews.length ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length : 0;
        html += `<h2>${esc(T('rep.care'))}</h2><div class="kpis">${kpi(T('rep.newReviews'), SP.fmtNum(reviews.length))}${kpi(T('rep.avgRating'), reviews.length ? SP.fmtNum(avg, 1) + ' ★' : '—')}` +
            `${kpi(T('reviews.stat2.label'), pct(reviews.filter(r => r.replied).length, reviews.length))}${kpi(T('rep.msgs'), SP.fmtNum(msgs.length) + ' (' + pct(msgs.filter(m => m.answered).length, msgs.length) + ' ' + T('rep.answered') + ')')}</div>`;

        html += `<h2>${esc(T('rep.camps'))}</h2>` + tbl([T('forms.field0'), T('common.platform'), T('common.status'), T('camp.col.spent')],
            camps.map(c => [esc(c.name), esc(SP.platformLabel(c.platform)), esc(T('camp.st.' + c.status)), esc(SP.fmtMoney(c.spent))]));

        const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        const title = `${T('rep.title')} ${M().monthLabel(mk)}${client ? ' – ' + client : ''}`;
        win.document.open();
        win.document.write(`<!DOCTYPE html><html lang="${currentLang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>
*{box-sizing:border-box}body{font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;color:#1f2937;margin:0;padding:40px;max-width:900px;margin-inline:auto;line-height:1.5}
header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:8px}
h1{font-size:24px;margin:0}header p{margin:4px 0 0;color:#6b7280;font-size:13px}
h2{font-size:17px;margin:32px 0 12px;color:#4338ca;break-after:avoid}h3{font-size:14px;margin:18px 0 8px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:10px}
.kpi{border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px}.kpi-v{font-size:20px;font-weight:700}.kpi-l{font-size:12px;color:#6b7280}
table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px}th,td{text-align:start;padding:7px 8px;border-bottom:1px solid #e5e7eb}th{font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:.4px}
.muted{color:#9ca3af;font-size:13px}.btn{background:#6366f1;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer;font-family:inherit}
footer{margin-top:40px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:10px}
@media print{.btn{display:none}body{padding:0}}
</style></head><body>
<header><div><h1>${esc(title)}</h1><p>${esc(T('rep.created'))} ${esc(new Date().toLocaleDateString(SP.locale()))}${w && w.site ? ' · ' + esc(w.site) : ''}</p></div>
<button class="btn" onclick="window.print()">${esc(T('rep.print'))}</button></header>
${html}
<footer>SocialPulse · TAP Werbung</footer></body></html>`);
        win.document.close();
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!$('reports-stats')) return;
        COLS.forEach(c => { SP.data.subscribe(c, render); SP.data.load(c); });
        SP.onLangChange(render);
        document.addEventListener('click', e => {
            const r = e.target.closest('[data-report]');
            if (r) { openReport(r.dataset.report); return; }
            const x = e.target.closest('[data-export]');
            if (x) exportCsv(x.dataset.export);
        });
        render();
    });
})();
