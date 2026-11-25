/**
 * SocialPulse – KI-Tools: datenbasierte Empfehlungen + optionaler KI-Textgenerator
 * Pfad: /assets/js/pages/ai.js
 */
(function () {
    'use strict';
    const esc = SP.esc, $ = SP.$, T = k => SP.tr(k);

    SP.addTranslations({
        'ai.open':         { de: 'Offene Hinweise', en: 'Open alerts', fr: 'Alertes ouvertes', ar: 'تنبيهات مفتوحة' },
        'ai.tips':         { de: 'Empfehlungen', en: 'Recommendations', fr: 'Recommandations', ar: 'التوصيات' },
        'ai.bestDay':      { de: 'Bester Posting-Tag', en: 'Best posting day', fr: 'Meilleur jour', ar: 'أفضل يوم للنشر' },
        'ai.recTitle':     { de: 'Empfehlungen aus deinen Daten', en: 'Recommendations from your data', fr: 'Recommandations basées sur vos données', ar: 'توصيات من بياناتك' },
        'ai.allGood':      { de: 'Alles im grünen Bereich – aktuell keine Hinweise.', en: 'All good – no alerts right now.', fr: 'Tout va bien – aucune alerte.', ar: 'كل شي تمام – ما في تنبيهات حالياً.' },
        'ai.genTitle':     { de: 'KI-Textgenerator für Beiträge', en: 'AI post writer', fr: 'Rédacteur IA de publications', ar: 'مولّد نصوص المنشورات بالذكاء الصناعي' },
        'ai.off':          { de: 'Der KI-Textgenerator ist nicht aktiviert. Dafür muss in includes/ai-config.php ein API-Schlüssel eingetragen werden.', en: 'The AI writer is not enabled. An API key must be set in includes/ai-config.php.', fr: "Le rédacteur IA n'est pas activé. Une clé API doit être définie dans includes/ai-config.php.", ar: 'مولّد النصوص غير مفعّل. لازم ينحط مفتاح API بملف includes/ai-config.php.' },
        'ai.topic':        { de: 'Worum geht es?', en: 'What is it about?', fr: 'De quoi s’agit-il ?', ar: 'عن شو المنشور؟' },
        'ai.topicPh':      { de: 'z. B. 20 % Rabatt auf alle Herbstangebote bis Sonntag', en: 'e.g. 20% off all autumn offers until Sunday', fr: 'ex. -20 % sur les offres d’automne jusqu’à dimanche', ar: 'مثلاً: خصم 20% على كل عروض الخريف لحد الأحد' },
        'ai.tone':         { de: 'Tonalität', en: 'Tone', fr: 'Ton', ar: 'الأسلوب' },
        'ai.t.friendly':   { de: 'Freundlich', en: 'Friendly', fr: 'Amical', ar: 'ودّي' },
        'ai.t.professional': { de: 'Professionell', en: 'Professional', fr: 'Professionnel', ar: 'احترافي' },
        'ai.t.casual':     { de: 'Locker', en: 'Casual', fr: 'Décontracté', ar: 'عفوي' },
        'ai.t.enthusiastic': { de: 'Begeistert', en: 'Enthusiastic', fr: 'Enthousiaste', ar: 'حماسي' },
        'ai.lang':         { de: 'Sprache', en: 'Language', fr: 'Langue', ar: 'اللغة' },
        'ai.hashtags':     { de: 'Hashtags hinzufügen', en: 'Add hashtags', fr: 'Ajouter des hashtags', ar: 'إضافة هاشتاغات' },
        'ai.generate':     { de: 'Text erstellen', en: 'Generate text', fr: 'Générer le texte', ar: 'إنشاء النص' },
        'ai.working':      { de: 'Text wird erstellt...', en: 'Writing...', fr: 'Rédaction...', ar: 'جارٍ الكتابة...' },
        'ai.asTemplate':   { de: 'Als Vorlage speichern', en: 'Save as template', fr: 'Enregistrer comme modèle', ar: 'حفظ كقالب' },
        'ai.asPost':       { de: 'Als Beitrag planen', en: 'Plan as post', fr: 'Planifier', ar: 'جدولة كمنشور' },
        'ai.err':          { de: 'Der Text konnte nicht erstellt werden. Bitte später erneut versuchen.', en: 'Could not generate text. Please try again later.', fr: 'Impossible de générer le texte. Réessayez plus tard.', ar: 'ما قدرنا ننشئ النص، جرّب بعدين.' },
        'ai.limit':        { de: 'Stundenlimit erreicht (30 Texte). Bitte später erneut versuchen.', en: 'Hourly limit reached (30 texts).', fr: 'Limite horaire atteinte (30 textes).', ar: 'تم الوصول للحد بالساعة (30 نص).' },
        'ai.review':       { de: 'Bitte vor dem Veröffentlichen prüfen – KI-Texte können Fehler enthalten.', en: 'Please review before publishing – AI texts can contain mistakes.', fr: 'Vérifiez avant publication – les textes IA peuvent contenir des erreurs.', ar: 'راجع النص قبل النشر – نصوص الذكاء الصناعي ممكن يكون فيها أخطاء.' },
        'r.reviews':       { de: '{n} Bewertungen warten auf eine Antwort.', en: '{n} reviews are waiting for a reply.', fr: '{n} avis attendent une réponse.', ar: '{n} تقييمات بانتظار الرد.' },
        'r.messages':      { de: '{n} ungelesene Nachrichten.', en: '{n} unread messages.', fr: '{n} messages non lus.', ar: '{n} رسائل غير مقروءة.' },
        'r.inbox':         { de: '{n} Kommentare/Erwähnungen sind zur Prüfung markiert.', en: '{n} comments/mentions are flagged for review.', fr: '{n} commentaires/mentions à vérifier.', ar: '{n} تعليقات/إشارات بحاجة لمراجعة.' },
        'r.due':           { de: '{n} geplante Beiträge sind heute oder überfällig.', en: '{n} planned posts are due or overdue.', fr: '{n} publications planifiées sont dues.', ar: '{n} منشورات مجدولة مستحقة أو متأخرة.' },
        'r.behind':        { de: 'Du liegst {n} Beiträge hinter deinem Monatsziel.', en: 'You are {n} posts behind your monthly goal.', fr: 'Vous avez {n} publications de retard sur l’objectif.', ar: 'متأخر {n} منشورات عن هدفك الشهري.' },
        'r.bestDay':       { de: 'Beiträge am {d} erzielen im Schnitt {p}% mehr Interaktionen.', en: 'Posts on {d} get {p}% more engagement on average.', fr: 'Les publications du {d} obtiennent {p} % d’interactions en plus.', ar: 'المنشورات يوم {d} بتجيب تفاعل أكتر بـ {p}% بالمتوسط.' },
        'r.bestPlat':      { de: '{pl} bringt die meisten Interaktionen pro Beitrag (Ø {n}).', en: '{pl} brings the most engagement per post (avg. {n}).', fr: '{pl} génère le plus d’interactions par publication (moy. {n}).', ar: '{pl} بتجيب أعلى تفاعل لكل منشور (متوسط {n}).' },
        'r.noTracking':    { de: 'Noch keine Webseiten-Besuche erfasst – Tracking-Code einbauen.', en: 'No website visits recorded yet – add the tracking code.', fr: 'Aucune visite enregistrée – ajoutez le code de suivi.', ar: 'ما في زيارات مسجلة للموقع – ركّب كود التتبع.' },
        'r.bounce':        { de: 'Hohe Absprungrate ({p}) – Startseite und Ladezeit prüfen.', en: 'High bounce rate ({p}) – check home page and loading speed.', fr: 'Taux de rebond élevé ({p}) – vérifiez l’accueil et la vitesse.', ar: 'نسبة ارتداد عالية ({p}) – افحص الصفحة الرئيسية وسرعة التحميل.' },
        'r.topSource':     { de: 'Die meisten Besucher kommen über {s} ({p}).', en: 'Most visitors come via {s} ({p}).', fr: 'La plupart des visiteurs viennent de {s} ({p}).', ar: 'أغلب الزوار بييجو من {s} ({p}).' },
        'r.audience':      { de: 'Zielgruppendaten fehlen – Alters- und Städtedaten ergänzen.', en: 'Audience data missing – add age and city data.', fr: "Données d'audience manquantes.", ar: 'بيانات الجمهور ناقصة – أضف الأعمار والمدن.' },
        'r.followers':     { de: 'Letzter Follower-Stand ist älter als 14 Tage – bitte aktualisieren.', en: 'Last follower count is older than 14 days – please update.', fr: 'Dernier relevé de plus de 14 jours.', ar: 'آخر عدد متابعين أقدم من 14 يوم – حدّثه.' },
        'r.go':            { de: 'Öffnen', en: 'Open', fr: 'Ouvrir', ar: 'فتح' }
    });

    const fill = (key, vars) => T(key).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));
    const state = { web: null, enabled: false, lastText: '' };

    function recommendations() {
        const M = SP.metrics, recs = [];
        const today = SP.today();
        const add = (level, icon, text, page) => recs.push({ level, icon, text, page });

        const unReplied = SP.data.items('reviews').filter(r => !r.replied).length;
        if (unReplied) add('warn', 'fas fa-star', fill('r.reviews', { n: unReplied }), 'reviews');
        const unread = SP.data.items('messages').filter(m => !m.read).length;
        if (unread) add('warn', 'fas fa-envelope', fill('r.messages', { n: unread }), 'messages');
        const toReview = SP.data.items('inbox').filter(x => x.status === 'review').length;
        if (toReview) add('warn', 'fas fa-flag', fill('r.inbox', { n: toReview }), 'inbox');
        const due = SP.data.items('posts').filter(p => p.status === 'planned' && p.date <= today).length;
        if (due) add('warn', 'fas fa-calendar-times', fill('r.due', { n: due }), 'posts');

        const goal = (SP.insights.data.goals || {}).posts_per_month || 12;
        const now = new Date();
        const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const done = M.published().filter(p => p.date >= today.slice(0, 8) + '01').length;
        const behind = Math.floor(goal * now.getDate() / dim) - done;
        if (behind >= 2) add('info', 'fas fa-calendar-plus', fill('r.behind', { n: behind }), 'posts');

        const snaps = M.snaps();
        if (snaps.length && snaps[snaps.length - 1].date < M.daysAgo(14)) add('info', 'fas fa-users', T('r.followers'), 'followers');
        const a = SP.insights.data.audience;
        if (SP.insights.loaded && (!a || !a.cities.length)) add('info', 'fas fa-user-friends', T('r.audience'), 'audience');

        const w = state.web;
        if (w) {
            if (!w.totals.pageviews) add('warn', 'fas fa-code', T('r.noTracking'), 'website');
            else {
                const br = w.totals.sessions ? w.totals.bounces / w.totals.sessions : 0;
                if (w.totals.sessions >= 30 && br > 0.6) add('info', 'fas fa-percentage', fill('r.bounce', { p: SP.fmtPct(br * 100) }), 'website');
                const top = Object.entries(w.sources).sort((x, y) => y[1] - x[1])[0];
                if (top) {
                    const lab = ['google', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp'].includes(top[0]) ? SP.platformLabel(top[0]) : T('web.src.' + top[0]);
                    add('good', 'fas fa-route', fill('r.topSource', { s: lab, p: SP.fmtPct(top[1] / w.totals.sessions * 100) }), 'visits');
                }
            }
        }

        const posts = M.published().filter(p => M.eng(p) > 0);
        if (posts.length >= 5) {
            const by = Array.from({ length: 7 }, () => ({ n: 0, e: 0 }));
            posts.forEach(p => { const [y, m, d] = p.date.split('-').map(Number); const wd = new Date(y, m - 1, d).getDay(); by[wd].n++; by[wd].e += M.eng(p); });
            const avg = posts.reduce((s, p) => s + M.eng(p), 0) / posts.length;
            let best = -1, bestAvg = 0;
            by.forEach((o, i) => { if (o.n >= 2 && o.e / o.n > bestAvg) { bestAvg = o.e / o.n; best = i; } });
            if (best >= 0 && bestAvg > avg * 1.1) {
                state.bestDay = new Date(2024, 0, 7 + best).toLocaleDateString(SP.locale(), { weekday: 'long' });
                add('good', 'fas fa-clock', fill('r.bestDay', { d: state.bestDay, p: SP.fmtNum((bestAvg - avg) / avg * 100) }), 'posts');
            }
            const plat = {};
            posts.forEach(p => { const o = plat[p.platform] = plat[p.platform] || { n: 0, e: 0 }; o.n++; o.e += M.eng(p); });
            const bp = Object.entries(plat).filter(([, o]) => o.n >= 2).sort((x, y) => y[1].e / y[1].n - x[1].e / x[1].n)[0];
            if (bp && Object.keys(plat).length > 1) add('good', 'fas fa-trophy', fill('r.bestPlat', { pl: SP.platformLabel(bp[0]), n: SP.fmtNum(bp[1].e / bp[1].n) }), 'engagement');
        }
        return recs;
    }

    function render() {
        if (!$('aitools-stats')) return;
        state.bestDay = null;
        const recs = recommendations();
        const warn = recs.filter(r => r.level === 'warn').length;
        $('aitools-stats').innerHTML = [
            ['fas fa-exclamation-circle', 'ai.open', SP.fmtNum(warn)],
            ['fas fa-lightbulb', 'ai.tips', SP.fmtNum(recs.length)],
            ['fas fa-clock', 'ai.bestDay', state.bestDay || '—']
        ].map(([i, k, v]) => `<div class="stat-card"><div class="stat-icon"><i class="${i}"></i></div><div class="stat-info"><div class="stat-label">${esc(T(k))}</div><div class="stat-value">${esc(v)}</div></div></div>`).join('');

        const order = { warn: 0, info: 1, good: 2 };
        $('aitools-recs').innerHTML = recs.length
            ? '<div class="sp-recs">' + recs.sort((a, b) => order[a.level] - order[b.level]).map(r =>
                `<div class="sp-rec sp-rec-${r.level}"><span class="sp-rec-icon"><i class="${r.icon}"></i></span><span class="sp-rec-text">${esc(r.text)}</span>` +
                `<button type="button" class="sp-btn-ghost" onclick="showPage('${r.page}')">${esc(T('r.go'))}</button></div>`).join('') + '</div>'
            : `<div class="sp-empty"><i class="fas fa-check-circle"></i><p>${esc(T('ai.allGood'))}</p></div>`;

        renderGenerator();
    }

    function renderGenerator() {
        const box = $('aitools-gen');
        if (!box) return;
        if (!state.enabled) { box.innerHTML = `<div class="sp-banner"><i class="fas fa-info-circle"></i><span>${esc(T('ai.off'))}</span></div>`; return; }
        const keep = id => { const el = box.querySelector('#' + id); return el ? (el.type === 'checkbox' ? el.checked : el.value) : null; };
        const prev = { topic: keep('aiTopic'), platform: keep('aiPlatform'), tone: keep('aiTone'), lang: keep('aiLang'), tags: keep('aiTags') };
        box.innerHTML =
            `<div class="sp-form">` +
            `<div class="form-group sp-full"><label for="aiTopic">${esc(T('ai.topic'))}</label><textarea id="aiTopic" class="sp-input" rows="3" maxlength="500" placeholder="${esc(T('ai.topicPh'))}"></textarea></div>` +
            `<div class="form-group"><label for="aiPlatform">${esc(T('common.platform'))}</label><select id="aiPlatform" class="sp-input">${SP.platformOptions(false).map(o => `<option value="${o.value}">${esc(o.label())}</option>`).join('')}</select></div>` +
            `<div class="form-group"><label for="aiTone">${esc(T('ai.tone'))}</label><select id="aiTone" class="sp-input">${['friendly', 'professional', 'casual', 'enthusiastic'].map(t => `<option value="${t}">${esc(T('ai.t.' + t))}</option>`).join('')}</select></div>` +
            `<div class="form-group"><label for="aiLang">${esc(T('ai.lang'))}</label><select id="aiLang" class="sp-input"><option value="de">Deutsch</option><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option></select></div>` +
            `<div class="form-group"><label class="sp-toggle" style="margin-top:22px;"><span>${esc(T('ai.hashtags'))}</span><input type="checkbox" id="aiTags" checked></label></div>` +
            `</div><div class="sp-actions"><button type="button" class="balance-btn send" data-ai-gen><i class="fas fa-magic"></i> ${esc(T('ai.generate'))}</button></div>` +
            `<div id="aiResult"></div>`;
        if (prev.topic !== null) {
            box.querySelector('#aiTopic').value = prev.topic;
            box.querySelector('#aiPlatform').value = prev.platform;
            box.querySelector('#aiTone').value = prev.tone;
            box.querySelector('#aiLang').value = prev.lang;
            box.querySelector('#aiTags').checked = prev.tags;
        } else {
            box.querySelector('#aiLang').value = currentLang;
        }
        if (state.lastText) showResult(state.lastText);
    }

    function showResult(text) {
        const el = $('aiResult');
        if (!el) return;
        el.innerHTML = `<div class="sp-ai-result"><pre class="sp-ai-text">${esc(text)}</pre><p class="sp-help">${esc(T('ai.review'))}</p>` +
            `<div class="sp-actions" style="justify-content:flex-start;flex-wrap:wrap;gap:8px;">` +
            `<button type="button" class="social-btn" data-ai-copy><i class="fas fa-copy"></i> ${esc(T('tpl.copy'))}</button>` +
            `<button type="button" class="social-btn" data-ai-tpl><i class="fas fa-layer-group"></i> ${esc(T('ai.asTemplate'))}</button>` +
            `<button type="button" class="social-btn primary" data-ai-post><i class="fas fa-calendar-plus"></i> ${esc(T('ai.asPost'))}</button></div></div>`;
    }

    async function generate(btn) {
        const topic = $('aiTopic').value.trim();
        if (!topic) { $('aiTopic').focus(); return; }
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${esc(T('ai.working'))}`;
        const res = await SP.api('ai.generate', { topic, platform: $('aiPlatform').value, tone: $('aiTone').value, lang: $('aiLang').value, hashtags: $('aiTags').checked });
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-magic"></i> ${esc(T('ai.generate'))}`;
        if (!res.ok) { SP.toast(T(res.error === 'ai_limit' ? 'ai.limit' : 'ai.err'), 'err'); return; }
        state.lastText = res.text;
        showResult(res.text);
    }

    function splitTags(text) {
        const lines = text.trim().split('\n');
        const last = lines[lines.length - 1].trim();
        if (lines.length > 1 && /^(#\S+\s*)+$/.test(last)) return { body: lines.slice(0, -1).join('\n').trim(), tags: last };
        return { body: text.trim(), tags: '' };
    }

    document.addEventListener('DOMContentLoaded', async () => {
        if (!$('aitools-stats')) return;
        ['posts', 'reviews', 'messages', 'inbox', 'followers'].forEach(c => { SP.data.subscribe(c, render); SP.data.load(c); });
        SP.insights.subscribe(render);
        SP.onLangChange(render);

        document.addEventListener('click', async e => {
            const g = e.target.closest('[data-ai-gen]');
            if (g) { generate(g); return; }
            if (!state.lastText) return;
            if (e.target.closest('[data-ai-copy]')) {
                try { await navigator.clipboard.writeText(state.lastText); SP.toast(T('tpl.copied'), 'ok'); } catch (err) { SP.toast(T('crud.error'), 'err'); }
            } else if (e.target.closest('[data-ai-tpl]')) {
                const { body, tags } = splitTags(state.lastText);
                const topic = ($('aiTopic').value.trim() || body).slice(0, 110);
                const res = await SP.data.save('templates', { title: topic, category: 'other', platform: $('aiPlatform').value, text: body.slice(0, 2200), hashtags: tags.slice(0, 300), uses: 0 });
                SP.toast(res.ok ? T('crud.saved') : SP.errText(res), res.ok ? 'ok' : 'err');
            } else if (e.target.closest('[data-ai-post]')) {
                const { body } = splitTags(state.lastText);
                SP.openAdd('posts', { title: body.replace(/\s+/g, ' ').slice(0, 200), platform: $('aiPlatform').value, status: 'planned' });
            }
        });

        render();
        const [st, web] = await Promise.all([SP.api('ai.status'), SP.api('web.stats', undefined, { days: 30 })]);
        state.enabled = !!(st.ok && st.enabled);
        if (web.ok) state.web = web;
        render();
    });
})();
