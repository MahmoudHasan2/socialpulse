/**
 * SocialPulse – Google Bewertungen
 * Pfad: /assets/js/pages/reviews.js
 */
(function () {
    'use strict';
    const esc = SP.esc;

    SP.addTranslations({
        'rev.f.author':      { de: 'Name', en: 'Name', fr: 'Nom', ar: 'الاسم' },
        'rev.f.text':        { de: 'Bewertungstext', en: 'Review text', fr: "Texte de l'avis", ar: 'نص التقييم' },
        'rev.f.replied':     { de: 'Beantwortet', en: 'Replied', fr: 'Répondu', ar: 'تم الرد' },
        'rev.f.reply':       { de: 'Unsere Antwort', en: 'Our reply', fr: 'Notre réponse', ar: 'ردّنا' },
        'rev.open':          { de: 'Offen', en: 'Open', fr: 'En attente', ar: 'بانتظار الرد' },
        'rev.add':           { de: 'Bewertung erfassen', en: 'Add review', fr: 'Ajouter un avis', ar: 'إضافة تقييم' },
        'rev.empty':         { de: 'Noch keine Bewertungen erfasst.', en: 'No reviews yet.', fr: 'Aucun avis pour le moment.', ar: 'لا توجد تقييمات بعد.' },
        'rev.markReplied':   { de: 'Als beantwortet markieren', en: 'Mark as replied', fr: 'Marquer comme répondu', ar: 'تعليم كتم الرد' },
        'rev.allRatings':    { de: 'Alle Sterne', en: 'All ratings', fr: 'Toutes les notes', ar: 'كل التقييمات' },
        'rev.thisMonth':     { de: 'diesen Monat', en: 'this month', fr: 'ce mois', ar: 'هذا الشهر' }
    });

    const patch = (it, ch) => SP.data.save('reviews', Object.assign({}, it, ch)).then(r => { if (!r.ok) SP.toast(SP.errText(r), 'err'); return r; });

    document.addEventListener('DOMContentLoaded', () => {
        SP.crud({
            name: 'reviews', page: 'reviews', col: 'reviews',
            mount: 'reviews-crud', statsMount: 'reviews-stats',
            addKey: 'rev.add', emptyKey: 'rev.empty', emptyIcon: 'fas fa-star', noteKey: 'crud.manualNote',
            statusField: 'rating', statusAllKey: 'rev.allRatings', searchKeys: ['author', 'text'],
            fields: [
                { key: 'author', type: 'text', labelKey: 'rev.f.author', required: true, max: 80 },
                { key: 'rating', type: 'int', labelKey: 'reviews.stat0.label', required: true, default: 5,
                  options: [5, 4, 3, 2, 1].map(n => ({ value: String(n), label: '★'.repeat(n) + ' (' + n + ')' })) },
                { key: 'date', type: 'date', labelKey: 'common.date', required: true, default: SP.today },
                { key: 'text', type: 'textarea', labelKey: 'rev.f.text', max: 2000 },
                { key: 'replied', type: 'bool', labelKey: 'rev.f.replied' },
                { key: 'reply', type: 'textarea', labelKey: 'rev.f.reply', max: 2000, rows: 3 }
            ],
            sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
            columns: [
                { labelKey: 'common.date', cls: 'sp-nowrap', render: r => esc(SP.fmtDate(r.date)) },
                { labelKey: 'rev.f.author', cls: 'sp-nowrap', render: r => esc(r.author) },
                { labelKey: 'reviews.stat0.label', render: r => SP.stars(r.rating) },
                { labelKey: 'rev.f.text', cls: 'sp-trunc', render: r => `<span title="${esc(r.text)}">${esc(r.text || '—')}</span>` },
                { labelKey: 'common.status', render: r => r.replied ? SP.badge('rev.f.replied', 'badge-active') : SP.badge('rev.open', 'badge-planned') }
            ],
            actions: [
                { icon: 'fas fa-reply', titleKey: 'rev.markReplied', show: r => !r.replied, run: r => patch(r, { replied: true }) }
            ],
            stats: items => {
                const avg = items.length ? items.reduce((s, r) => s + (Number(r.rating) || 0), 0) / items.length : 0;
                const month = items.filter(r => SP.isThisMonth(r.date)).length;
                return [
                    { icon: 'fas fa-star', labelKey: 'reviews.stat0.label', value: items.length ? SP.fmtNum(avg, 1) + ' ★' : '—' },
                    { icon: 'fas fa-comment', labelKey: 'reviews.stat1.label', value: SP.fmtNum(items.length),
                      sub: month ? '+' + month + ' ' + SP.tr('rev.thisMonth') : '', subCls: 'up' },
                    { icon: 'fas fa-reply', labelKey: 'reviews.stat2.label', value: items.length ? SP.fmtPct(SP.ratio(items.filter(r => r.replied).length, items.length) * 100) : '—' }
                ];
            }
        });
    });
})();
