/**
 * SocialPulse – Kampagnen & Werbekampagnen
 * Pfad: /assets/js/pages/campaigns.js
 */
(function () {
    'use strict';
    const esc = SP.esc;

    SP.addTranslations({
        'camp.f.kind':        { de: 'Art', en: 'Type', fr: 'Type', ar: 'النوع' },
        'camp.kind.organic':  { de: 'Organisch', en: 'Organic', fr: 'Organique', ar: 'عضوية' },
        'camp.kind.ad':       { de: 'Bezahlte Anzeige', en: 'Paid ad', fr: 'Publicité payante', ar: 'إعلان مدفوع' },
        'camp.st.planned':    { de: 'Geplant', en: 'Planned', fr: 'Planifiée', ar: 'مجدولة' },
        'camp.st.active':     { de: 'Aktiv', en: 'Active', fr: 'Active', ar: 'نشطة' },
        'camp.st.paused':     { de: 'Pausiert', en: 'Paused', fr: 'En pause', ar: 'متوقفة' },
        'camp.st.ended':      { de: 'Beendet', en: 'Ended', fr: 'Terminée', ar: 'منتهية' },
        'camp.f.spent':       { de: 'Ausgegeben (€)', en: 'Spent (€)', fr: 'Dépensé (€)', ar: 'المصروف (€)' },
        'camp.f.budget':      { de: 'Budget (€)', en: 'Budget (€)', fr: 'Budget (€)', ar: 'الميزانية (€)' },
        'camp.f.end':         { de: 'Enddatum', en: 'End date', fr: 'Date de fin', ar: 'تاريخ الانتهاء' },
        'camp.f.clicks':      { de: 'Klicks', en: 'Clicks', fr: 'Clics', ar: 'النقرات' },
        'camp.f.conversions': { de: 'Conversions', en: 'Conversions', fr: 'Conversions', ar: 'التحويلات' },
        'camp.f.revenue':     { de: 'Umsatz (€)', en: 'Revenue (€)', fr: "Chiffre d'affaires (€)", ar: 'الإيرادات (€)' },
        'camp.col.spent':     { de: 'Ausgegeben', en: 'Spent', fr: 'Dépensé', ar: 'المصروف' },
        'camp.col.period':    { de: 'Zeitraum', en: 'Period', fr: 'Période', ar: 'الفترة' },
        'camp.col.ctr':       { de: 'CTR', en: 'CTR', fr: 'CTR', ar: 'CTR' },
        'camp.col.cpc':       { de: 'CPC', en: 'CPC', fr: 'CPC', ar: 'CPC' },
        'camp.col.roas':      { de: 'ROAS', en: 'ROAS', fr: 'ROAS', ar: 'ROAS' },
        'camp.add':           { de: 'Kampagne anlegen', en: 'Add campaign', fr: 'Créer une campagne', ar: 'إنشاء حملة' },
        'camp.addAd':         { de: 'Anzeige anlegen', en: 'Add ad', fr: 'Créer une annonce', ar: 'إنشاء إعلان' },
        'camp.empty':         { de: 'Noch keine Kampagnen. Lege die erste an.', en: 'No campaigns yet. Add the first one.', fr: 'Aucune campagne. Créez la première.', ar: 'لا توجد حملات بعد. أنشئ أول حملة.' },
        'camp.emptyAd':       { de: 'Noch keine bezahlten Anzeigen erfasst.', en: 'No paid ads yet.', fr: 'Aucune publicité payante.', ar: 'لا توجد إعلانات مدفوعة بعد.' },
        'camp.ofBudget':      { de: 'vom Budget', en: 'of budget', fr: 'du budget', ar: 'من الميزانية' },
        'camp.pause':         { de: 'Pausieren', en: 'Pause', fr: 'Mettre en pause', ar: 'إيقاف مؤقت' },
        'camp.resume':        { de: 'Aktivieren', en: 'Activate', fr: 'Activer', ar: 'تفعيل' }
    });

    const STATUS_OPTS = ['planned', 'active', 'paused', 'ended'].map(v => ({ value: v, labelKey: 'camp.st.' + v }));
    const STATUS_CLS = { planned: 'badge-planned', active: 'badge-active', paused: 'badge-paused', ended: 'badge-neutral' };
    const statusBadge = c => SP.badge('camp.st.' + c.status, STATUS_CLS[c.status]);
    const sum = (items, k) => items.reduce((s, c) => s + (Number(c[k]) || 0), 0);
    const period = c => (c.start || c.end) ? esc(SP.fmtDate(c.start)) + ' – ' + esc(SP.fmtDate(c.end)) : '—';
    const patch = (it, ch) => SP.data.save('campaigns', Object.assign({}, it, ch)).then(r => { if (!r.ok) SP.toast(SP.errText(r), 'err'); return r; });

    const FIELDS = [
        { key: 'name', type: 'text', labelKey: 'forms.field0', required: true, max: 120, full: true },
        { key: 'kind', type: 'enum', labelKey: 'camp.f.kind', required: true, options: [{ value: 'organic', labelKey: 'camp.kind.organic' }, { value: 'ad', labelKey: 'camp.kind.ad' }] },
        { key: 'platform', type: 'enum', labelKey: 'common.platform', required: true, options: () => SP.platformOptions(false) },
        { key: 'status', type: 'enum', labelKey: 'common.status', required: true, default: 'planned', options: STATUS_OPTS },
        { key: 'budget', type: 'money', labelKey: 'camp.f.budget' },
        { key: 'spent', type: 'money', labelKey: 'camp.f.spent' },
        { key: 'start', type: 'date', labelKey: 'forms.field3', default: SP.today },
        { key: 'end', type: 'date', labelKey: 'camp.f.end' },
        { key: 'impressions', type: 'int', labelKey: 'adcampaigns.stat0.label' },
        { key: 'clicks', type: 'int', labelKey: 'camp.f.clicks' },
        { key: 'conversions', type: 'int', labelKey: 'camp.f.conversions' },
        { key: 'revenue', type: 'money', labelKey: 'camp.f.revenue' }
    ];

    const ACTIONS = [
        { icon: 'fas fa-pause', titleKey: 'camp.pause', show: c => c.status === 'active', run: c => patch(c, { status: 'paused' }) },
        { icon: 'fas fa-play', titleKey: 'camp.resume', show: c => c.status === 'paused' || c.status === 'planned', run: c => patch(c, { status: 'active' }) }
    ];

    const sortCamp = (a, b) => (b.start || '').localeCompare(a.start || '') || (a.name || '').localeCompare(b.name || '');

    document.addEventListener('DOMContentLoaded', () => {
        SP.crud({
            name: 'campaigns', page: 'campaigns', col: 'campaigns',
            mount: 'campaigns-crud', statsMount: 'campaigns-stats',
            addKey: 'camp.add', emptyKey: 'camp.empty', emptyIcon: 'fas fa-flag',
            filterPlatform: true, statusField: 'status', searchKeys: ['name'],
            fields: FIELDS, defaults: { kind: 'organic' }, actions: ACTIONS, sort: sortCamp,
            columns: [
                { labelKey: 'forms.field0', cls: 'sp-trunc', render: c => `<span title="${esc(c.name)}">${esc(c.name)}</span> ` + SP.badge(c.kind === 'ad' ? 'camp.kind.ad' : 'camp.kind.organic', 'badge-info') },
                { labelKey: 'common.platform', render: c => SP.platCell(c.platform) },
                { labelKey: 'common.status', render: statusBadge },
                { labelKey: 'forms.field2', cls: 'sp-num', render: c => esc(SP.fmtMoney(c.budget)) },
                { labelKey: 'camp.col.spent', cls: 'sp-num', render: c => esc(SP.fmtMoney(c.spent)) },
                { labelKey: 'camp.col.ctr', cls: 'sp-num', render: c => c.impressions ? esc(SP.fmtPct(SP.ratio(c.clicks, c.impressions) * 100)) : '—' },
                { labelKey: 'camp.col.period', cls: 'sp-nowrap', render: period }
            ],
            stats: items => {
                const budget = sum(items, 'budget'), spent = sum(items, 'spent');
                return [
                    { icon: 'fas fa-flag', labelKey: 'campaigns.stat0.label', value: SP.fmtNum(items.filter(c => c.status === 'active').length) },
                    { icon: 'fas fa-euro-sign', labelKey: 'campaigns.stat1.label', value: SP.fmtMoney(spent),
                      sub: budget ? SP.fmtPct(SP.ratio(spent, budget) * 100) + ' ' + SP.tr('camp.ofBudget') : '' },
                    { icon: 'fas fa-mouse-pointer', labelKey: 'campaigns.stat2.label', value: SP.fmtPct(SP.ratio(sum(items, 'clicks'), sum(items, 'impressions')) * 100) }
                ];
            }
        });

        SP.crud({
            name: 'adcampaigns', page: 'adcampaigns', col: 'campaigns',
            mount: 'adcampaigns-crud', statsMount: 'adcampaigns-stats',
            addKey: 'camp.addAd', emptyKey: 'camp.emptyAd', emptyIcon: 'fas fa-bullhorn',
            filterPlatform: true, statusField: 'status', searchKeys: ['name'],
            fields: FIELDS, defaults: { kind: 'ad', status: 'active' }, filter: c => c.kind === 'ad', actions: ACTIONS, sort: sortCamp,
            columns: [
                { labelKey: 'forms.field0', cls: 'sp-trunc', render: c => `<span title="${esc(c.name)}">${esc(c.name)}</span>` },
                { labelKey: 'common.platform', render: c => SP.platCell(c.platform) },
                { labelKey: 'common.status', render: statusBadge },
                { labelKey: 'camp.col.spent', cls: 'sp-num', render: c => esc(SP.fmtMoney(c.spent)) },
                { labelKey: 'adcampaigns.stat0.label', cls: 'sp-num', render: c => SP.fmtNum(c.impressions) },
                { labelKey: 'camp.f.clicks', cls: 'sp-num', render: c => SP.fmtNum(c.clicks) },
                { labelKey: 'camp.col.cpc', cls: 'sp-num', render: c => c.clicks ? esc(SP.fmtMoney(SP.ratio(c.spent, c.clicks))) : '—' },
                { labelKey: 'camp.col.roas', cls: 'sp-num', render: c => c.spent ? SP.fmtNum(SP.ratio(c.revenue, c.spent), 1) + 'x' : '—' }
            ],
            stats: items => {
                const spent = sum(items, 'spent'), clicks = sum(items, 'clicks');
                return [
                    { icon: 'fas fa-eye', labelKey: 'adcampaigns.stat0.label', value: SP.fmtNum(sum(items, 'impressions')) },
                    { icon: 'fas fa-coins', labelKey: 'adcampaigns.stat1.label', value: clicks ? SP.fmtMoney(SP.ratio(spent, clicks)) : '—' },
                    { icon: 'fas fa-chart-pie', labelKey: 'adcampaigns.stat2.label', value: spent ? SP.fmtNum(SP.ratio(sum(items, 'revenue'), spent), 1) + 'x' : '—' }
                ];
            }
        });
    });
})();
