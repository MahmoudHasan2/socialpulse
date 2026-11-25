<?php
/**
 * SocialPulse – Webseiten-Tracking (ohne Cookies, ohne IP-Speicherung)
 * Pfad: /includes/tracking.php
 *
 * Besucher werden über einen täglich wechselnden Hash (Salt + Domain + IP + Browser)
 * gezählt. Der Salt wird jeden Tag neu erzeugt, IP-Adressen werden nie gespeichert.
 */
declare(strict_types=1);

const TRACK_SESSION_GAP = 1800;        // 30 Minuten Pause = neue Sitzung
const TRACK_MAX_FILE    = 52428800;    // max. 50 MB Rohdaten pro Tag
const TRACK_SUM_VERSION = 1;

function track_dir(): string {
    $dir = DATA_DIR . '/track';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    return $dir;
}

function track_ends_with(string $h, string $s): bool {
    $l = strlen($s);
    return $l > 0 && $l <= strlen($h) && substr($h, -$l) === $s;
}

function track_strip_www(string $host): string {
    $host = strtolower(trim($host));
    return strpos($host, 'www.') === 0 ? substr($host, 4) : $host;
}

function track_site_host(): string {
    $url  = (string)(get_config()['links']['website'] ?? '');
    $host = parse_url($url, PHP_URL_HOST);
    return is_string($host) ? track_strip_www($host) : '';
}

function track_host_matches(string $host, string $site): bool {
    $host = track_strip_www($host);
    return $site !== '' && ($host === $site || track_ends_with($host, '.' . $site));
}

function track_daily_salt(): string {
    $file  = track_dir() . '/salt.json';
    $today = date('Y-m-d');
    $s = read_json($file);
    if (($s['date'] ?? '') !== $today || empty($s['salt'])) {
        $s = ['date' => $today, 'salt' => bin2hex(random_bytes(16))];
        write_json($file, $s);
    }
    return (string)$s['salt'];
}

function track_source(string $refHost, string $utm): string {
    $known = ['google', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp', 'email'];
    $u = strtolower(trim($utm));
    if ($u !== '') {
        $alias = ['ig' => 'instagram', 'insta' => 'instagram', 'fb' => 'facebook', 'meta' => 'facebook',
                  'gmb' => 'google', 'google_business' => 'google', 'tt' => 'tiktok', 'yt' => 'youtube',
                  'wa' => 'whatsapp', 'twitter' => 'x', 'newsletter' => 'email', 'mail' => 'email'];
        $u = $alias[$u] ?? $u;
        return in_array($u, $known, true) ? $u : 'other';
    }
    if ($refHost === '') return 'direct';

    $rules = [
        'email'     => '/(^|\.)(mail\.google\.com|outlook\.live\.com|outlook\.office\.com|web\.de|gmx\.(net|de)|t-online\.de)$/',
        'google'    => '/(^|\.)google\.[a-z.]+$/',
        'instagram' => '/(^|\.)instagram\.com$/',
        'facebook'  => '/(^|\.)(facebook\.com|fb\.me|fb\.com)$/',
        'tiktok'    => '/(^|\.)tiktok\.com$/',
        'youtube'   => '/(^|\.)(youtube\.com|youtu\.be)$/',
        'linkedin'  => '/(^|\.)(linkedin\.com|lnkd\.in)$/',
        'x'         => '/(^|\.)(t\.co|twitter\.com|x\.com)$/',
        'whatsapp'  => '/(^|\.)(whatsapp\.com|wa\.me)$/',
        'search'    => '/(^|\.)(bing\.com|duckduckgo\.com|yahoo\.[a-z.]+|ecosia\.org|qwant\.com|startpage\.com)$/',
    ];
    foreach ($rules as $src => $re) {
        if (preg_match($re, $refHost)) return $src;
    }
    return 'referral';
}

function track_norm_path($p): string {
    $p = is_string($p) ? $p : '/';
    $p = (string)preg_replace('/[?#].*$/s', '', $p);
    $p = (string)preg_replace('/[\x00-\x1F\x7F\s]/', '', $p);
    if ($p === '' || $p[0] !== '/') $p = '/';
    if (strlen($p) > 1) {
        $p = rtrim($p, '/');
        if ($p === '') $p = '/';
    }
    return substr($p, 0, 200);
}

function track_path_matches(string $path, string $pattern): bool {
    if (substr($pattern, -1) === '*') {
        return strpos($path, substr($pattern, 0, -1)) === 0;
    }
    return $path === $pattern;
}

/** Speichert ein Ereignis. $originHost = Host der aufrufenden Webseite. */
function track_record(array $in, string $originHost): bool {
    $site = track_site_host();
    if (!track_host_matches($originHost, $site)) return false;

    $t = str_in($in, 't');
    if (!in_array($t, ['pv', 'leave', 'conv'], true)) return false;

    $ua = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 400);
    if ($ua === '' || preg_match('/bot|crawl|spider|slurp|headless|preview|lighthouse|pingdom|uptime|monitor/i', $ua)) return false;
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');

    $e = [
        'ts' => time(),
        'v'  => substr(hash('sha256', track_daily_salt() . '|' . $site . '|' . $ip . '|' . $ua), 0, 16),
        't'  => $t,
        'p'  => track_norm_path($in['p'] ?? '/'),
    ];

    if ($t === 'pv') {
        $refHost = parse_url(substr(str_in($in, 'r'), 0, 500), PHP_URL_HOST);
        $refHost = is_string($refHost) ? track_strip_www($refHost) : '';
        if ($refHost !== '' && track_host_matches($refHost, $site)) $refHost = '';
        $e['s'] = track_source($refHost, substr(str_in($in, 'us'), 0, 40));
        if ($refHost !== '') $e['h'] = substr($refHost, 0, 100);
        $w = is_numeric($in['w'] ?? null) ? (int)$in['w'] : 0;
        $e['m'] = ($w > 0 && $w < 768) ? 1 : 0;
    } elseif ($t === 'leave') {
        $d = is_numeric($in['d'] ?? null) ? (int)$in['d'] : 0;
        if ($d <= 0) return false;
        $e['d'] = min($d, TRACK_SESSION_GAP);
    } else {
        $n = strtolower(str_in($in, 'n'));
        $e['n'] = preg_match('/^[a-z0-9_-]{1,40}$/', $n) ? $n : 'form';
    }

    $file = track_dir() . '/ev-' . date('Y-m-d') . '.jsonl';
    if (is_file($file) && filesize($file) > TRACK_MAX_FILE) return false;
    $ok = file_put_contents($file, json_encode($e, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX) !== false;
    if ($ok) @touch(track_dir() . '/last');
    return $ok;
}

function track_inc(array &$arr, string $key, int $by = 1): void {
    $arr[$key] = ($arr[$key] ?? 0) + $by;
}

function track_top(array $arr, int $n): array {
    arsort($arr);
    return array_slice($arr, 0, $n, true);
}

function track_empty_summary(string $date): array {
    return [
        'v' => TRACK_SUM_VERSION, 'date' => $date,
        'visitors' => 0, 'pageviews' => 0, 'sessions' => 0, 'bounces' => 0,
        'dur_sum' => 0, 'dur_n' => 0, 'conv_sessions' => 0,
        'sources' => [], 'referrers' => [], 'pages' => [], 'entries' => [],
        'devices' => ['mobile' => 0, 'desktop' => 0], 'conversions' => [],
    ];
}

/** Wertet die Rohdaten eines Tages aus. */
function track_summarize(string $date): array {
    $sum  = track_empty_summary($date);
    $file = track_dir() . '/ev-' . $date . '.jsonl';
    if (!is_file($file)) return $sum;

    $byVid = [];
    $fh = fopen($file, 'r');
    if (!$fh) return $sum;
    while (($line = fgets($fh)) !== false) {
        $e = json_decode($line, true);
        if (!is_array($e) || !isset($e['v'], $e['ts'], $e['t'])) continue;
        $byVid[(string)$e['v']][] = $e;
    }
    fclose($fh);

    $sum['visitors'] = count($byVid);

    foreach ($byVid as $events) {
        usort($events, fn($a, $b) => (int)$a['ts'] <=> (int)$b['ts']);
        $sessions = [];
        $cur  = null;
        $last = 0;
        foreach ($events as $e) {
            $ts = (int)$e['ts'];
            if ($cur === null || $ts - $last > TRACK_SESSION_GAP) {
                if ($cur !== null) $sessions[] = $cur;
                $cur = ['pv' => 0, 'entry' => null, 'src' => 'direct', 'host' => '', 'm' => 0, 'dur' => 0, 'conv' => false];
            }
            $last = $ts;

            if ($e['t'] === 'pv') {
                $cur['pv']++;
                $sum['pageviews']++;
                $path = (string)($e['p'] ?? '/');
                track_inc($sum['pages'], $path);
                if ($cur['entry'] === null) {
                    $cur['entry'] = $path;
                    $cur['src']   = (string)($e['s'] ?? 'direct');
                    $cur['host']  = (string)($e['h'] ?? '');
                    $cur['m']     = empty($e['m']) ? 0 : 1;
                }
            } elseif ($e['t'] === 'leave') {
                $cur['dur'] += min(TRACK_SESSION_GAP, (int)($e['d'] ?? 0));
            } elseif ($e['t'] === 'conv') {
                $cur['conv'] = true;
                track_inc($sum['conversions'], (string)($e['n'] ?? 'form'));
            }
        }
        if ($cur !== null) $sessions[] = $cur;

        foreach ($sessions as $s) {
            if ($s['pv'] === 0) continue;
            $sum['sessions']++;
            if ($s['pv'] === 1) $sum['bounces']++;
            if ($s['dur'] > 0) { $sum['dur_sum'] += $s['dur']; $sum['dur_n']++; }
            track_inc($sum['sources'], $s['src']);
            if ($s['host'] !== '') track_inc($sum['referrers'], $s['host']);
            $sum['devices'][$s['m'] ? 'mobile' : 'desktop']++;
            $ent = $sum['entries'][$s['entry']] ?? [0, 0];
            $ent[0]++;
            if ($s['conv']) { $ent[1]++; $sum['conv_sessions']++; }
            $sum['entries'][$s['entry']] = $ent;
        }
    }

    $sum['referrers'] = track_top($sum['referrers'], 100);
    $sum['pages']     = track_top($sum['pages'], 200);
    uasort($sum['entries'], fn($a, $b) => $b[0] <=> $a[0]);
    $sum['entries']   = array_slice($sum['entries'], 0, 200, true);
    return $sum;
}

/** Tageszusammenfassung – vergangene Tage werden zwischengespeichert. */
function track_day(string $date): array {
    $today = date('Y-m-d');
    if ($date >= $today) return track_summarize($date);

    $cache = track_dir() . '/sum-' . $date . '.json';
    $c = read_json($cache);
    if (($c['v'] ?? 0) === TRACK_SUM_VERSION) return $c;

    $sum = track_summarize($date);
    if (is_file(track_dir() . '/ev-' . $date . '.jsonl')) write_json($cache, $sum);
    return $sum;
}

function track_pairs(array $assoc, int $limit): array {
    arsort($assoc);
    $out = [];
    foreach (array_slice($assoc, 0, $limit, true) as $k => $n) $out[] = [(string)$k, $n];
    return $out;
}

/** Auswertung eines Zeitraums ($days Tage, $offset Tage zurück). */
function track_range(int $days, int $offset, array $landing): array {
    $dates = [];
    $now = time();
    for ($i = $days - 1 + $offset; $i >= $offset; $i--) {
        $dates[] = date('Y-m-d', (int)strtotime('-' . $i . ' days', $now));
    }
    return track_collect($dates, $landing);
}

/** Auswertung eines Kalendermonats (YYYY-MM), höchstens bis heute. */
function track_month(string $month, array $landing): array {
    $first = $month . '-01';
    $last  = date('Y-m-t', (int)strtotime($first));
    $today = date('Y-m-d');
    if ($last > $today) $last = $today;
    $dates = [];
    for ($d = $first; $d <= $last; $d = date('Y-m-d', (int)strtotime($d . ' +1 day'))) $dates[] = $d;
    return track_collect($dates, $landing);
}

/** Summiert die Tageszusammenfassungen einer Datumsliste. */
function track_collect(array $dates, array $landing): array {
    $keys = ['visitors', 'pageviews', 'sessions', 'bounces', 'dur_sum', 'dur_n', 'conv_sessions'];
    $tot  = array_fill_keys($keys, 0) + ['landing_visits' => 0, 'landing_conv' => 0];
    $sources = $referrers = $pages = $conversions = $entries = [];
    $devices = ['mobile' => 0, 'desktop' => 0];
    $series  = [];

    foreach ($dates as $date) {
        $s = track_day($date);

        foreach ($keys as $k) $tot[$k] += (int)($s[$k] ?? 0);
        foreach (($s['sources'] ?? []) as $k => $n)     track_inc($sources, (string)$k, (int)$n);
        foreach (($s['referrers'] ?? []) as $k => $n)   track_inc($referrers, (string)$k, (int)$n);
        foreach (($s['pages'] ?? []) as $k => $n)       track_inc($pages, (string)$k, (int)$n);
        foreach (($s['conversions'] ?? []) as $k => $n) track_inc($conversions, (string)$k, (int)$n);
        foreach (($s['devices'] ?? []) as $k => $n)     $devices[$k] = ($devices[$k] ?? 0) + (int)$n;

        $lv = 0; $lc = 0;
        foreach (($s['entries'] ?? []) as $path => $pair) {
            $path = (string)$path;
            foreach ($landing as $pattern) {
                if (track_path_matches($path, $pattern)) {
                    $lv += (int)$pair[0];
                    $lc += (int)$pair[1];
                    $e = $entries[$path] ?? [0, 0];
                    $entries[$path] = [$e[0] + (int)$pair[0], $e[1] + (int)$pair[1]];
                    break;
                }
            }
        }
        $tot['landing_visits'] += $lv;
        $tot['landing_conv']   += $lc;

        $series[] = [
            'date' => $date,
            'visitors' => (int)$s['visitors'], 'pageviews' => (int)$s['pageviews'], 'sessions' => (int)$s['sessions'],
            'landing_visits' => $lv, 'landing_conv' => $lc,
        ];
    }

    uasort($entries, fn($a, $b) => $b[0] <=> $a[0]);
    $landingPages = [];
    foreach (array_slice($entries, 0, 50, true) as $path => $pair) $landingPages[] = [(string)$path, $pair[0], $pair[1]];

    return [
        'series'        => $series,
        'totals'        => $tot,
        'sources'       => $sources,
        'referrers'     => track_pairs($referrers, 15),
        'pages'         => track_pairs($pages, 15),
        'devices'       => $devices,
        'conversions'   => track_pairs($conversions, 20),
        'landing_pages' => $landingPages,
    ];
}
