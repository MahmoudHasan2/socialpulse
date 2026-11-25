/**
 * SocialPulse – Nachrichten & Posteingang
 * Pfad: /assets/js/pages/messages.js
 */
(function () {
    'use strict';
    const esc = SP.esc;

    SP.addTranslations({
        'msg.f.sender':      { de: 'Absender', en: 'Sender', fr: 'Expéditeur', ar: 'المرسل' },
        'msg.f.text':        { de: 'Nachricht', en: 'Message', fr: 'Message', ar: 'الرسالة' },
        'msg.f.read':        { de: 'Gelesen', en: 'Read', fr: 'Lu', ar: 'مقروءة' },
        'msg.f.answered':    { de: 'Beantwortet', en: 'Answered', fr: 'Répondu', ar: 'تم الرد' },
        'msg.add':           { de: 'Nachricht erfassen', en: 'Add message', fr: 'Ajouter un message', ar: 'إضافة رسالة' },
        'msg.empty':         { de: 'Noch keine Nachrichten erfasst.', en: 'No messages yet.', fr: 'Aucun message pour le moment.', ar: 'لا توجد رسائل بعد.' },
        'msg.markRead':      { de: 'Als gelesen markieren', en: 'Mark as read', fr: 'Marquer comme lu', ar: 'تعليم كمقروءة' },
        'msg.markAnswered':  { de: 'Als beantwortet markieren', en: 'Mark as answered', fr: 'Marquer comme répondu', ar: 'تعليم كتم الرد' },
        'msg.statMonth':     { de: 'Nachrichten diesen Monat', en: 'Messages this month', fr: 'Messages ce mois', ar: 'رسائل هذا الشهر' },
        'inb.f.type':        { de: 'Typ', en: 'Type', fr: 'Type', ar: 'النوع' },
        'inb.f.author':      { de: 'Von', en: 'From', fr: 'De', ar: 'من' },
        'inb.type.comment':  { de: 'Kommentar', en: 'Comment', fr: 'Commentaire', ar: 'تعليق' },
        'inb.type.mention':  { de: 'Erwähnung', en: 'Mention', fr: 'Mention', ar: 'إشارة' },
        'inb.st.new':        { de: 'Neu', en: 'New', fr: 'Nouveau', ar: 'جديد' },
        'inb.st.review':     { de: 'Zu prüfen', en: 'Needs review', fr: 'À vérifier', ar: 'بحاجة لمراجعة' },
        'inb.st.done':       { de: 'Erledigt', en: 'Done', fr: 'Traité', ar: 'تمت المعالجة' },
        'inb.add':           { de: 'Eintrag erfassen', en: 'Add entry', fr: 'Ajouter une entrée', ar: 'إضافة إدخال' },
        'inb.empty':         { de: 'Posteingang ist leer.', en: 'Inbox is empty.', fr: 'La boîte de réception est vide.', ar: 'صندوق الوارد فارغ.' },
        'inb.markDone':      { de: 'Als erledigt markieren', en: 'Mark as done', fr: 'Marquer comme traité', ar: 'تعليم كمعالَج' },
        'inb.markReview':    { de: 'Zur Prüfung markieren', en: 'Flag for review', fr: 'Signaler pour vérification', ar: 'تعليم للمراجعة' },
        'inb.thisMonth':     { de: 'diesen Monat', en: 'this month', fr: 'ce mois', ar: 'هذا الشهر' }
    });

    const when = x => esc(SP.fmtDate(x.date)) + (x.time ? ' <span class="list-time">' + esc(x.time) + '</span>' : '');
    const byDateTime = (a, b) => ((b.date || '') + (b.time || '')).localeCompare((a.date || '') + (a.time || ''));
    const patcher = col => (it, ch) => SP.data.save(col, Object.assign({}, it, ch)).then(r => { if (!r.ok) SP.toast(SP.errText(r), 'err'); return r; });

    document.addEventListener('DOMContentLoaded', () => {
        /* ----- Direktnachrichten ----- */
        const patchMsg = patcher('messages');
        SP.crud({
            name: 'messages', page: 'messages', col: 'messages',
            mount: 'messages-crud', statsMount: 'messages-stats',
            addKey: 'msg.add', emptyKey: 'msg.empty', emptyIcon: 'fas fa-comment-dots', noteKey: 'crud.manualNote',
            filterPlatform: true, searchKeys: ['sender', 'text'],
            fields: [
                { key: 'sender', type: 'text', labelKey: 'msg.f.sender', required: true, max: 80 },
                { key: 'platform', type: 'enum', labelKey: 'common.platform', required: true, options: () => SP.platformOptions(false) },
                { key: 'date', type: 'date', labelKey: 'common.date', required: true, default: SP.today },
                { key: 'time', type: 'time', labelKey: 'common.time' },
                { key: 'text', type: 'textarea', labelKey: 'msg.f.text', required: true, max: 2000 },
                { key: 'read', type: 'bool', labelKey: 'msg.f.read' },
                { key: 'answered', type: 'bool', labelKey: 'msg.f.answered' }
            ],
            sort: byDateTime,
            rowClass: m => (m.read ? '' : 'sp-row-unread'),
            columns: [
                { labelKey: 'common.date', cls: 'sp-nowrap', render: when },
                { labelKey: 'common.platform', render: m => SP.platCell(m.platform) },
                { labelKey: 'msg.f.sender', cls: 'sp-nowrap', render: m => esc(m.sender) },
                { labelKey: 'msg.f.text', cls: 'sp-trunc', render: m => `<span title="${esc(m.text)}">${esc(m.text)}</span>` },
                { labelKey: 'common.status', render: m => m.answered ? SP.badge('msg.f.answered', 'badge-active')
                    : (m.read ? SP.badge('msg.f.read', 'badge-neutral') : SP.badge('messages.stat0.label', 'badge-planned')) }
            ],
            actions: [
                { icon: 'fas fa-envelope-open', titleKey: 'msg.markRead', show: m => !m.read, run: m => patchMsg(m, { read: true }) },
                { icon: 'fas fa-reply', titleKey: 'msg.markAnswered', show: m => !m.answered, run: m => patchMsg(m, { read: true, answered: true }) }
            ],
            stats: items => [
                { icon: 'fas fa-envelope', labelKey: 'messages.stat0.label', value: SP.fmtNum(items.filter(m => !m.read).length) },
                { icon: 'fas fa-reply', labelKey: 'messages.stat1.label', value: items.length ? SP.fmtPct(SP.ratio(items.filter(m => m.answered).length, items.length) * 100) : '—' },
                { icon: 'fas fa-calendar-alt', labelKey: 'msg.statMonth', value: SP.fmtNum(items.filter(m => SP.isThisMonth(m.date)).length) }
            ]
        });

        /* ----- Kommentare & Erwähnungen ----- */
        const patchInb = patcher('inbox');
        const ST_CLS = { new: 'badge-planned', review: 'badge-paused', done: 'badge-active' };
        SP.crud({
            name: 'inbox', page: 'inbox', col: 'inbox',
            mount: 'inbox-crud', statsMount: 'inbox-stats',
            addKey: 'inb.add', emptyKey: 'inb.empty', emptyIcon: 'fas fa-inbox', noteKey: 'crud.manualNote',
            filterPlatform: true, statusField: 'status', searchKeys: ['author', 'text'],
            fields: [
                { key: 'type', type: 'enum', labelKey: 'inb.f.type', required: true,
                  options: [{ value: 'comment', labelKey: 'inb.type.comment' }, { value: 'mention', labelKey: 'inb.type.mention' }] },
                { key: 'platform', type: 'enum', labelKey: 'common.platform', required: true, options: () => SP.platformOptions(false) },
                { key: 'author', type: 'text', labelKey: 'inb.f.author', required: true, max: 80 },
                { key: 'status', type: 'enum', labelKey: 'common.status', required: true, default: 'new',
                  options: ['new', 'review', 'done'].map(v => ({ value: v, labelKey: 'inb.st.' + v })) },
                { key: 'date', type: 'date', labelKey: 'common.date', required: true, default: SP.today },
                { key: 'time', type: 'time', labelKey: 'common.time' },
                { key: 'text', type: 'textarea', labelKey: 'msg.f.text', required: true, max: 2000 }
            ],
            sort: byDateTime,
            rowClass: x => (x.status === 'new' ? 'sp-row-unread' : ''),
            columns: [
                { labelKey: 'common.date', cls: 'sp-nowrap', render: when },
                { labelKey: 'inb.f.type', render: x => SP.badge('inb.type.' + x.type, 'badge-info') },
                { labelKey: 'common.platform', render: x => SP.platCell(x.platform) },
                { labelKey: 'inb.f.author', cls: 'sp-nowrap', render: x => esc(x.author) },
                { labelKey: 'msg.f.text', cls: 'sp-trunc', render: x => `<span title="${esc(x.text)}">${esc(x.text)}</span>` },
                { labelKey: 'common.status', render: x => SP.badge('inb.st.' + x.status, ST_CLS[x.status]) }
            ],
            actions: [
                { icon: 'fas fa-flag', titleKey: 'inb.markReview', show: x => x.status === 'new', run: x => patchInb(x, { status: 'review' }) },
                { icon: 'fas fa-check', titleKey: 'inb.markDone', show: x => x.status !== 'done', run: x => patchInb(x, { status: 'done' }) }
            ],
            stats: items => {
                const mentions = items.filter(x => x.type === 'mention');
                const mMonth = mentions.filter(x => SP.isThisMonth(x.date)).length;
                return [
                    { icon: 'fas fa-comment-dots', labelKey: 'inbox.stat0.label', value: SP.fmtNum(items.filter(x => x.type === 'comment' && x.status === 'new').length) },
                    { icon: 'fas fa-at', labelKey: 'inbox.stat1.label', value: SP.fmtNum(mentions.length),
                      sub: mMonth ? '+' + mMonth + ' ' + SP.tr('inb.thisMonth') : '', subCls: 'up' },
                    { icon: 'fas fa-flag', labelKey: 'inbox.stat2.label', value: SP.fmtNum(items.filter(x => x.status === 'review').length) }
                ];
            }
        });
    });
})();
