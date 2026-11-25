/**
 * SocialPulse – Einstellungen (Kundendaten, Links, Präferenzen, Passwort)
 * Pfad: /assets/js/settings.js
 */
(function () {
    'use strict';
    const $ = SP.$;

    SP.addTranslations({
        'settings.clientTitle': { de: 'Kundendaten', en: 'Client Details', fr: 'Données client', ar: 'بيانات العميل' },
        'settings.f.name':      { de: 'Kundenname / Firma', en: 'Client / Company Name', fr: 'Nom du client / entreprise', ar: 'اسم العميل / الشركة' },
        'settings.f.phone':     { de: 'Telefon', en: 'Phone', fr: 'Téléphone', ar: 'رقم الهاتف' },
        'settings.f.handover':  { de: 'Übergabedatum', en: 'Handover Date', fr: 'Date de remise', ar: 'تاريخ التسليم' },
        'settings.f.user':      { de: 'Benutzername', en: 'Username', fr: "Nom d'utilisateur", ar: 'اسم المستخدم' },
        'settings.linksTitle':  { de: 'Webseite & Social Media', en: 'Website & Social Media', fr: 'Site web & réseaux sociaux', ar: 'الموقع والسوشيال ميديا' },
        'settings.f.website':   { de: 'Webseite', en: 'Website', fr: 'Site web', ar: 'الموقع الإلكتروني' },
        'settings.p.google':    { de: 'Google Unternehmensprofil', en: 'Google Business Profile', fr: "Profil d'entreprise Google", ar: 'ملف غوغل التجاري' },
        'settings.optional':    { de: 'optional', en: 'optional', fr: 'facultatif', ar: 'اختياري' },
        'settings.pwTitle':     { de: 'Passwort ändern', en: 'Change Password', fr: 'Changer le mot de passe', ar: 'تغيير كلمة المرور' },
        'settings.pw.current':  { de: 'Aktuelles Passwort', en: 'Current Password', fr: 'Mot de passe actuel', ar: 'كلمة المرور الحالية' },
        'settings.pw.new':      { de: 'Neues Passwort (min. 8 Zeichen)', en: 'New Password (min. 8 chars)', fr: 'Nouveau mot de passe (min. 8)', ar: 'كلمة المرور الجديدة (8 أحرف على الأقل)' },
        'settings.pw.confirm':  { de: 'Neues Passwort wiederholen', en: 'Repeat New Password', fr: 'Répéter le mot de passe', ar: 'تأكيد كلمة المرور الجديدة' },
        'settings.pw.btn':      { de: 'Passwort ändern', en: 'Change Password', fr: 'Changer', ar: 'تغيير كلمة المرور' }
    });

    const MSG = {
        saved:      { de: 'Gespeichert.', en: 'Saved.', fr: 'Enregistré.', ar: 'تم الحفظ.' },
        pwChanged:  { de: 'Passwort wurde geändert.', en: 'Password changed.', fr: 'Mot de passe modifié.', ar: 'تم تغيير كلمة المرور.' },
        auth:       { de: 'Sitzung abgelaufen. Bitte neu anmelden.', en: 'Session expired. Please log in again.', fr: 'Session expirée. Veuillez vous reconnecter.', ar: 'انتهت الجلسة، سجّل الدخول من جديد.' },
        csrf:       { de: 'Sicherheitsprüfung fehlgeschlagen. Seite neu laden.', en: 'Security check failed. Reload the page.', fr: 'Échec de sécurité. Rechargez la page.', ar: 'فشل التحقق الأمني، أعد تحميل الصفحة.' },
        name:       { de: 'Bitte den Kundennamen eingeben.', en: 'Please enter the client name.', fr: 'Veuillez saisir le nom du client.', ar: 'الرجاء إدخال اسم العميل.' },
        phone:      { de: 'Telefonnummer ist ungültig.', en: 'Invalid phone number.', fr: 'Numéro de téléphone invalide.', ar: 'رقم الهاتف غير صالح.' },
        website:    { de: 'Webseiten-Link ist ungültig.', en: 'Invalid website link.', fr: 'Lien du site invalide.', ar: 'رابط الموقع غير صالح.' },
        link:       { de: 'Ungültiger oder fehlender Link:', en: 'Invalid or missing link:', fr: 'Lien invalide ou manquant :', ar: 'رابط غير صالح أو ناقص:' },
        pw_current: { de: 'Aktuelles Passwort ist falsch.', en: 'Current password is wrong.', fr: 'Mot de passe actuel incorrect.', ar: 'كلمة المرور الحالية غير صحيحة.' },
        pw_short:   { de: 'Das neue Passwort braucht mindestens 8 Zeichen.', en: 'New password needs at least 8 characters.', fr: 'Au moins 8 caractères requis.', ar: 'كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل.' },
        pw_match:   { de: 'Die neuen Passwörter stimmen nicht überein.', en: 'New passwords do not match.', fr: 'Les mots de passe ne correspondent pas.', ar: 'كلمتا المرور غير متطابقتين.' },
        save:       { de: 'Speichern fehlgeschlagen.', en: 'Saving failed.', fr: "Échec de l'enregistrement.", ar: 'فشل الحفظ.' },
        network:    { de: 'Verbindungsfehler.', en: 'Connection error.', fr: 'Erreur de connexion.', ar: 'خطأ في الاتصال.' }
    };
    const LANG_NAMES = { de: 'Deutsch', en: 'English', fr: 'Français', ar: 'العربية' };

    let state = null;

    function msg(code) { const m = MSG[code] || MSG.save; return m[currentLang] || m.de; }

    function errorText(res) {
        if (res.error === 'link') {
            const list = (state && state.platforms) || [];
            const p = list.find(x => x.key === res.field);
            const label = p ? (p.labelKey ? SP.tr(p.labelKey) : p.label) : res.field;
            return msg('link') + ' ' + label;
        }
        return msg(res.error);
    }

    function formatDate(iso) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
        return m ? `${m[3]}.${m[2]}.${m[1]}` : '—';
    }

    function i18nSpan(key, cls) {
        const s = document.createElement('span');
        s.setAttribute('data-i18n', key);
        s.textContent = SP.tr(key);
        if (cls) s.className = cls;
        return s;
    }

    function renderLinks() {
        const box = $('linksFields');
        box.innerHTML = '';
        const fields = [{ key: 'website', labelKey: 'settings.f.website', icon: 'fas fa-globe', required: true }]
            .concat(state.platforms);

        fields.forEach(f => {
            const group = document.createElement('div');
            group.className = 'form-group';

            const label = document.createElement('label');
            label.htmlFor = 'link_' + f.key;
            const icon = document.createElement('i');
            icon.className = f.icon + ' sp-label-icon';
            label.appendChild(icon);
            if (f.labelKey) label.appendChild(i18nSpan(f.labelKey));
            else label.appendChild(document.createTextNode(f.label));
            if (!f.required) label.appendChild(i18nSpan('settings.optional', 'sp-optional'));

            const input = document.createElement('input');
            input.type = 'url';
            input.id = 'link_' + f.key;
            input.className = 'sp-input';
            input.placeholder = 'https://';
            input.dataset.key = f.key;
            input.value = (state.links && state.links[f.key]) || '';

            group.append(label, input);
            box.appendChild(group);
        });
    }

    function refreshStats() {
        $('stClientName').textContent = (state && state.client.name) || '—';
        const notif = $('stNotif');
        const key = state && state.prefs.email_notifications ? 'common.active' : 'common.inactive';
        notif.setAttribute('data-i18n', key);
        notif.textContent = SP.tr(key);
        $('stLang').textContent = LANG_NAMES[currentLang] || currentLang;
    }

    function fill() {
        $('setName').value     = state.client.name || '';
        $('setPhone').value    = state.client.phone || '';
        $('setHandover').value = formatDate(state.client.handover_date);
        $('setUser').value     = state.username || '';
        $('prefEmail').checked   = !!state.prefs.email_notifications;
        $('prefReports').checked = !!state.prefs.auto_reports;
        $('prefAi').checked      = !!state.prefs.ai_recommendations;
        renderLinks();
        refreshStats();
    }

    async function save(btn) {
        const links = {};
        document.querySelectorAll('#linksFields input').forEach(i => { links[i.dataset.key] = i.value.trim(); });
        const body = {
            client: { name: $('setName').value.trim(), phone: $('setPhone').value.trim() },
            links,
            prefs: {
                email_notifications: $('prefEmail').checked,
                auto_reports: $('prefReports').checked,
                ai_recommendations: $('prefAi').checked
            }
        };
        btn.disabled = true;
        const res = await SP.api('settings.save', body);
        btn.disabled = false;
        if (!res.ok) { SP.toast(errorText(res), 'err'); return; }
        state.client = res.client;
        state.links  = res.links;
        state.prefs  = res.prefs;
        fill();
        SP.toast(msg('saved'), 'ok');
    }

    async function changePassword(btn) {
        const body = { current: $('pwCurrent').value, new: $('pwNew').value, confirm: $('pwConfirm').value };
        btn.disabled = true;
        const res = await SP.api('password.change', body);
        btn.disabled = false;
        if (!res.ok) { SP.toast(errorText(res), 'err'); return; }
        ['pwCurrent', 'pwNew', 'pwConfirm'].forEach(id => { $(id).value = ''; });
        SP.toast(msg('pwChanged'), 'ok');
    }

    async function init() {
        if (!$('linksFields')) return;
        $('btnSaveSettings').addEventListener('click', e => save(e.currentTarget));
        $('btnChangePw').addEventListener('click', e => changePassword(e.currentTarget));
        $('langSelect').addEventListener('change', refreshStats);

        const res = await SP.api('settings.get');
        if (!res.ok) { SP.toast(errorText(res), 'err'); return; }
        state = res;
        fill();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
