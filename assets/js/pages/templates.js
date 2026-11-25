/**
 * SocialPulse – Content-Vorlagen
 * Pfad: /assets/js/pages/templates.js
 */
(function () {
    'use strict';
    const esc = SP.esc;

    SP.addTranslations({
        'tpl.f.title':       { de: 'Titel', en: 'Title', fr: 'Titre', ar: 'العنوان' },
        'tpl.f.category':    { de: 'Kategorie', en: 'Category', fr: 'Catégorie', ar: 'الفئة' },
        'tpl.f.text':        { de: 'Text', en: 'Text', fr: 'Texte', ar: 'النص' },
        'tpl.f.hashtags':    { de: 'Hashtags', en: 'Hashtags', fr: 'Hashtags', ar: 'الهاشتاغات' },
        'tpl.cat.offer':     { de: 'Angebot', en: 'Offer', fr: 'Offre', ar: 'عرض' },
        'tpl.cat.testimonial': { de: 'Kundenstimme', en: 'Testimonial', fr: 'Témoignage', ar: 'رأي عميل' },
        'tpl.cat.behind':    { de: 'Behind the Scenes', en: 'Behind the scenes', fr: 'Coulisses', ar: 'خلف الكواليس' },
        'tpl.cat.event':     { de: 'Veranstaltung', en: 'Event', fr: 'Événement', ar: 'فعالية' },
        'tpl.cat.info':      { de: 'Information', en: 'Information', fr: 'Information', ar: 'معلومات' },
        'tpl.cat.other':     { de: 'Sonstige', en: 'Other', fr: 'Autre', ar: 'أخرى' },
        'tpl.allCats':       { de: 'Alle Kategorien', en: 'All categories', fr: 'Toutes les catégories', ar: 'كل الفئات' },
        'tpl.copy':          { de: 'Text kopieren', en: 'Copy text', fr: 'Copier le texte', ar: 'نسخ النص' },
        'tpl.copied':        { de: 'In die Zwischenablage kopiert.', en: 'Copied to clipboard.', fr: 'Copié dans le presse-papiers.', ar: 'تم النسخ.' },
        'tpl.toPost':        { de: 'Als Beitrag planen', en: 'Plan as post', fr: 'Planifier comme publication', ar: 'جدولة كمنشور' },
        'tpl.used':          { de: 'Mal verwendet', en: 'times used', fr: 'fois utilisé', ar: 'مرات الاستخدام' },
        'tpl.add':           { de: 'Vorlage anlegen', en: 'Add template', fr: 'Créer un modèle', ar: 'إنشاء قالب' },
        'tpl.empty':         { de: 'Noch keine Vorlagen. Lege die erste an.', en: 'No templates yet. Add the first one.', fr: 'Aucun modèle. Créez le premier.', ar: 'لا توجد قوالب بعد. أنشئ أول قالب.' },
        'tpl.statNew':       { de: 'Neu diesen Monat', en: 'New this month', fr: 'Nouveaux ce mois', ar: 'جديد هذا الشهر' }
    });

    const CATS = ['offer', 'testimonial', 'behind', 'event', 'info', 'other'];
    const fullText = t => t.text + (t.hashtags ? '\n\n' + t.hashtags : '');

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
            ta.remove();
            return ok;
        }
    }

    const bumpUses = t => SP.data.save('templates', Object.assign({}, t, { uses: (t.uses || 0) + 1 }));

    document.addEventListener('DOMContentLoaded', () => {
        SP.crud({
            name: 'templates', page: 'templates', col: 'templates',
            mount: 'templates-crud', statsMount: 'templates-stats',
            addKey: 'tpl.add', emptyKey: 'tpl.empty', emptyIcon: 'fas fa-layer-group',
            statusField: 'category', statusAllKey: 'tpl.allCats', searchKeys: ['title', 'text', 'hashtags'],
            fields: [
                { key: 'title', type: 'text', labelKey: 'tpl.f.title', required: true, max: 120 },
                { key: 'category', type: 'enum', labelKey: 'tpl.f.category', required: true, options: CATS.map(c => ({ value: c, labelKey: 'tpl.cat.' + c })) },
                { key: 'platform', type: 'enum', labelKey: 'common.platform', required: true, default: 'all', options: () => SP.platformOptions(true) },
                { key: 'text', type: 'textarea', labelKey: 'tpl.f.text', required: true, max: 2200, rows: 6 },
                { key: 'hashtags', type: 'text', labelKey: 'tpl.f.hashtags', max: 300, full: true },
                { key: 'uses', type: 'int', labelKey: 'tpl.used', form: false, default: 0 }
            ],
            sort: (a, b) => (b.uses || 0) - (a.uses || 0) || (a.title || '').localeCompare(b.title || ''),
            renderCard: t =>
                `<div class="sp-tpl-head"><span class="badge badge-info">${esc(SP.tr('tpl.cat.' + t.category))}</span>${SP.platCell(t.platform)}</div>` +
                `<h4 class="sp-tpl-title">${esc(t.title)}</h4>` +
                `<p class="sp-tpl-text">${esc(t.text)}</p>` +
                (t.hashtags ? `<p class="sp-tpl-tags">${esc(t.hashtags)}</p>` : '') +
                `<div class="sp-tpl-meta">${SP.fmtNum(t.uses)} ${esc(SP.tr('tpl.used'))}</div>`,
            actions: [
                { icon: 'fas fa-copy', titleKey: 'tpl.copy', run: async t => {
                    const ok = await copyText(fullText(t));
                    SP.toast(ok ? SP.tr('tpl.copied') : SP.tr('crud.error'), ok ? 'ok' : 'err');
                    if (ok) await bumpUses(t);
                } },
                { icon: 'fas fa-calendar-plus', titleKey: 'tpl.toPost', run: async t => {
                    await bumpUses(t);
                    SP.openAdd('posts', {
                        title: t.title,
                        platform: t.platform && t.platform !== 'all' ? t.platform : 'instagram',
                        status: 'planned'
                    });
                } }
            ],
            stats: items => {
                const top = items.slice().sort((a, b) => (b.uses || 0) - (a.uses || 0))[0];
                return [
                    { icon: 'fas fa-layer-group', labelKey: 'templates.stat0.label', value: SP.fmtNum(items.length) },
                    { icon: 'fas fa-star', labelKey: 'templates.stat1.label', value: top && top.uses ? top.title : '—',
                      sub: top && top.uses ? SP.fmtNum(top.uses) + ' ' + SP.tr('tpl.used') : '' },
                    { icon: 'fas fa-magic', labelKey: 'tpl.statNew', value: SP.fmtNum(items.filter(t => SP.isThisMonth(t.created_at)).length) }
                ];
            }
        });
    });
})();
