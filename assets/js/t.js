/*! SocialPulse Tracker – ohne Cookies, ohne lokale Speicherung | Pfad: /assets/js/t.js */
(function () {
    'use strict';
    var d = document, w = window, n = navigator;
    if (n.doNotTrack === '1' || w.doNotTrack === '1' || n.webdriver) return;
    if (/bot|crawl|spider|slurp|headless|lighthouse/i.test(n.userAgent || '')) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

    var script = d.currentScript;
    if (!script) return;
    var endpoint = script.getAttribute('data-endpoint') || script.src.replace(/assets\/js\/t\.js.*$/, 'track.php');
    var params = new URLSearchParams(location.search);

    function send(data) {
        data.p = location.pathname;
        data.w = w.innerWidth || 0;
        var body = JSON.stringify(data);
        if (n.sendBeacon) {
            try { if (n.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }))) return; } catch (e) {}
        }
        try { fetch(endpoint, { method: 'POST', body: body, keepalive: true, mode: 'no-cors', headers: { 'Content-Type': 'text/plain' } }); } catch (e) {}
    }

    var visibleSince = d.visibilityState === 'visible' ? Date.now() : 0;
    var engaged = 0;

    function flush() {
        if (visibleSince) { engaged += Date.now() - visibleSince; visibleSince = 0; }
        var sec = Math.round(engaged / 1000);
        if (sec > 0) { send({ t: 'leave', d: sec }); engaged = 0; }
    }

    d.addEventListener('visibilitychange', function () {
        if (d.visibilityState === 'hidden') flush();
        else visibleSince = Date.now();
    });
    w.addEventListener('pagehide', flush);

    send({ t: 'pv', r: d.referrer || '', us: params.get('utm_source') || '' });

    w.spTrack = function (name) { send({ t: 'conv', n: String(name || 'form').slice(0, 40) }); };

    if (script.getAttribute('data-forms') !== 'off') {
        d.addEventListener('submit', function (e) {
            var f = e.target;
            if (f && f.tagName === 'FORM' && !f.hasAttribute('data-sp-ignore')) {
                w.spTrack(f.getAttribute('data-sp-conv') || 'form');
            }
        }, true);
    }
})();
