/**
 * SocialPulse – Beiträge
 * Pfad: /assets/js/pages/posts.js
 */
(function () {
    'use strict';
    const esc = SP.esc;

    SP.addTranslations({
        'posts.f.title':     { de: 'Titel / Inhalt', en: 'Title / content', fr: 'Titre / contenu', ar: 'العنوان / المحتوى' },
        'posts.f.url':       { de: 'Link zum Beitrag', en: 'Post link', fr: 'Lien de la publication', ar: 'رابط المنشور' },
        'posts.f.shares':    { de: 'Geteilt', en: 'Shares', fr: 'Partages', ar: 'المشاركات' },
        'posts.f.reach':     { de: 'Reichweite', en: 'Reach', fr: 'Portée', ar: 'الوصول' },
        'posts.st.published':{ de: 'Veröffentlicht', en: 'Published', fr: 'Publié', ar: 'منشور' },
        'posts.st.planned':  { de: 'Geplant', en: 'Planned', fr: 'Planifié', ar: 'مجدول' },
        'posts.add':         { de: 'Beitrag erfassen', en: 'Add post', fr: 'Ajouter une publication', ar: 'إضافة منشور' },
        'posts.empty':       { de: 'Noch keine Beiträge erfasst. Lege den ersten an.', en: 'No posts yet. Add the first one.', fr: 'Aucune publication. Ajoutez la première.', ar: 'لا توجد منشورات بعد. أضف أول منشور.' },
        'posts.interactions':{ de: 'Interaktionen', en: 'interactions', fr: 'interactions', ar: 'تفاعل' },
        'posts.publish':     { de: 'Als veröffentlicht markieren', en: 'Mark as published', fr: 'Marquer comme publié', ar: 'تعليم كمنشور' }
    });

    const eng = p => (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
    const patch = (it, ch) => SP.data.save('posts', Object.assign({}, it, ch)).then(r => { if (!r.ok) SP.toast(SP.errText(r), 'err'); return r; });

    document.addEventListener('DOMContentLoaded', () => {
        SP.crud({
            name: 'posts', page: 'posts', col: 'posts',
            mount: 'posts-crud', statsMount: 'posts-stats',
            addKey: 'posts.add', emptyKey: 'posts.empty', emptyIcon: 'fas fa-newspaper',
            filterPlatform: true, statusField: 'status', searchKeys: ['title'],
            fields: [
                { key: 'date', type: 'date', labelKey: 'common.date', required: true, default: SP.today },
                { key: 'platform', type: 'enum', labelKey: 'common.platform', required: true, options: () => SP.platformOptions(false) },
                { key: 'status', type: 'enum', labelKey: 'common.status', required: true, default: 'published',
                  options: [{ value: 'published', labelKey: 'posts.st.published' }, { value: 'planned', labelKey: 'posts.st.planned' }] },
                { key: 'title', type: 'text', labelKey: 'posts.f.title', required: true, max: 200, full: true },
                { key: 'url', type: 'url', labelKey: 'posts.f.url', full: true },
                { key: 'likes', type: 'int', labelKey: 'posts.h.likes' },
                { key: 'comments', type: 'int', labelKey: 'posts.h.comments' },
                { key: 'shares', type: 'int', labelKey: 'posts.f.shares' },
                { key: 'reach', type: 'int', labelKey: 'posts.f.reach' }
            ],
            sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
            columns: [
                { labelKey: 'common.date', cls: 'sp-nowrap', render: p => esc(SP.fmtDate(p.date)) },
                { labelKey: 'common.platform', render: p => SP.platCell(p.platform) },
                { labelKey: 'posts.f.title', cls: 'sp-trunc', render: p => p.url
                    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="sp-link" title="${esc(p.title)}">${esc(p.title)}</a>`
                    : `<span title="${esc(p.title)}">${esc(p.title)}</span>` },
                { labelKey: 'common.status', render: p => p.status === 'planned' ? SP.badge('posts.st.planned', 'badge-planned') : SP.badge('posts.st.published', 'badge-active') },
                { labelKey: 'posts.h.likes', cls: 'sp-num', render: p => SP.fmtNum(p.likes) },
                { labelKey: 'posts.h.comments', cls: 'sp-num', render: p => SP.fmtNum(p.comments) },
                { labelKey: 'posts.f.shares', cls: 'sp-num', render: p => SP.fmtNum(p.shares) },
                { labelKey: 'posts.f.reach', cls: 'sp-num', render: p => SP.fmtNum(p.reach) }
            ],
            actions: [
                { icon: 'fas fa-check', titleKey: 'posts.publish', show: p => p.status === 'planned', run: p => patch(p, { status: 'published' }) }
            ],
            stats: items => {
                const pub = items.filter(p => p.status !== 'planned');
                const planned = items.length - pub.length;
                const avg = pub.length ? pub.reduce((s, p) => s + eng(p), 0) / pub.length : 0;
                const best = pub.slice().sort((a, b) => eng(b) - eng(a))[0];
                return [
                    { icon: 'fas fa-newspaper', labelKey: 'posts.stat0.label', value: SP.fmtNum(pub.filter(p => SP.isThisMonth(p.date)).length),
                      sub: planned ? planned + ' ' + SP.tr('posts.st.planned') : '' },
                    { icon: 'fas fa-heart', labelKey: 'posts.stat1.label', value: SP.fmtNum(avg) },
                    { icon: 'fas fa-trophy', labelKey: 'posts.stat2.label', value: best ? SP.fmtDate(best.date) : '—',
                      sub: best ? SP.fmtNum(eng(best)) + ' ' + SP.tr('posts.interactions') : '', subCls: 'up' }
                ];
            }
        });
    });
})();
