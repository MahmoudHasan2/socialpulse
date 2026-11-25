<?php
/**
 * SocialPulse – JSON-API
 * Pfad: /api.php
 */
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/collections.php';
require __DIR__ . '/includes/tracking.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $error, int $code = 422, array $extra = []): void {
    out(['ok' => false, 'error' => $error] + $extra, $code);
}

if (!is_installed() || !is_logged_in()) fail('auth', 401);

$isPost = $_SERVER['REQUEST_METHOD'] === 'POST';
$input  = [];
if ($isPost) {
    if (!check_csrf($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) fail('csrf', 403);
    $decoded = json_decode((string)file_get_contents('php://input'), true);
    $input   = is_array($decoded) ? $decoded : [];
}
$needPost = function () use ($isPost): void { if (!$isPost) fail('method', 405); };

$action = is_string($_GET['action'] ?? null) ? $_GET['action'] : '';
$config = get_config();

switch ($action) {

    /* ================= Einstellungen ================= */

    case 'settings.get':
        out([
            'ok'        => true,
            'client'    => $config['client'] ?? [],
            'links'     => $config['links'] ?? [],
            'prefs'     => $config['prefs'] ?? [],
            'username'  => $config['account']['username'] ?? '',
            'platforms' => platforms_public(),
        ]);

    case 'settings.save':
        $needPost();
        $client = is_array($input['client'] ?? null) ? $input['client'] : [];
        $name   = str_in($client, 'name');
        $phone  = str_in($client, 'phone');
        if ($name === '' || mb_strlen($name) > 120) fail('name');
        if (!valid_phone($phone)) fail('phone');

        [$links, $bad] = validate_links($input['links'] ?? []);
        if ($bad === 'website') fail('website');
        if ($bad !== null)      fail('link', 422, ['field' => $bad]);

        $p = is_array($input['prefs'] ?? null) ? $input['prefs'] : [];
        $prefs = [
            'email_notifications' => !empty($p['email_notifications']),
            'auto_reports'        => !empty($p['auto_reports']),
            'ai_recommendations'  => !empty($p['ai_recommendations']),
        ];

        $config['client']['name']  = $name;
        $config['client']['phone'] = $phone;
        $config['links']      = $links;
        $config['prefs']      = $prefs;
        $config['updated_at'] = date('c');
        if (!save_config($config)) fail('save', 500);
        out(['ok' => true, 'client' => $config['client'], 'links' => $links, 'prefs' => $prefs]);

    case 'password.change':
        $needPost();
        $cur  = is_string($input['current'] ?? null) ? $input['current'] : '';
        $new  = is_string($input['new'] ?? null)     ? $input['new']     : '';
        $conf = is_string($input['confirm'] ?? null) ? $input['confirm'] : '';

        if (!password_verify($cur, (string)($config['account']['password_hash'] ?? ''))) fail('pw_current');
        if (strlen($new) < 8) fail('pw_short');
        if ($new !== $conf)   fail('pw_match');

        $config['account']['password_hash']       = password_hash($new, PASSWORD_DEFAULT);
        $config['account']['password_changed_at'] = date('c');
        if (!save_config($config)) fail('save', 500);
        login_session($config['account']);
        out(['ok' => true]);

    /* ================= Sammlungen (Beiträge, Kampagnen, ...) ================= */

    case 'col.list':
        $col = str_in($_GET, 'col');
        if (!isset(COLLECTIONS[$col])) fail('col', 404);
        out(['ok' => true, 'items' => col_load($col)]);

    case 'col.save':
        $needPost();
        $col = str_in($input, 'col');
        if (!isset(COLLECTIONS[$col])) fail('col', 404);
        $rawItem = is_array($input['item'] ?? null) ? $input['item'] : [];
        [$item, $err] = col_validate($col, $rawItem);
        if ($err) fail('field', 422, ['field' => $err[0], 'reason' => $err[1]]);
        $id = str_in($rawItem, 'id');

        $res = col_locked($col, function () use ($col, $item, $id) {
            $items = col_load($col);
            $now   = date('c');
            if ($id !== '') {
                foreach ($items as $i => $it) {
                    if (($it['id'] ?? '') === $id) {
                        $items[$i] = ['id' => $id, 'created_at' => $it['created_at'] ?? $now, 'updated_at' => $now] + $item;
                        return col_store($col, $items) ? $items[$i] : 'save';
                    }
                }
                return 'notfound';
            }
            if (count($items) >= COLLECTION_LIMIT) return 'limit';
            $new = ['id' => bin2hex(random_bytes(6)), 'created_at' => $now, 'updated_at' => $now] + $item;
            $items[] = $new;
            return col_store($col, $items) ? $new : 'save';
        });

        if (is_string($res)) fail($res, $res === 'save' ? 500 : ($res === 'notfound' ? 404 : 422));
        out(['ok' => true, 'item' => $res]);

    case 'col.delete':
        $needPost();
        $col = str_in($input, 'col');
        $id  = str_in($input, 'id');
        if (!isset(COLLECTIONS[$col])) fail('col', 404);

        $res = col_locked($col, function () use ($col, $id) {
            $items = col_load($col);
            $left  = array_values(array_filter($items, fn($it) => ($it['id'] ?? '') !== $id));
            if (count($left) === count($items)) return 'notfound';
            return col_store($col, $left) ? true : 'save';
        });

        if ($res !== true) fail($res, $res === 'notfound' ? 404 : 500);
        out(['ok' => true, 'id' => $id]);

    /* ================= Webseiten-Tracking ================= */

    case 'web.stats':
        $days = (int)($_GET['days'] ?? 30);
        if (!in_array($days, [7, 30, 90], true)) $days = 30;
        $landing = $config['tracking']['landing_paths'] ?? [];
        $landing = is_array($landing) ? array_values(array_filter($landing, 'is_string')) : [];
        $cur  = track_range($days, 0, $landing);
        $prev = track_range($days, $days, $landing);
        $last = @filemtime(DATA_DIR . '/track/last');
        out(['ok' => true, 'days' => $days, 'site' => track_site_host(), 'landing_paths' => $landing,
             'last_hit' => $last ? date('c', $last) : null, 'prev' => $prev['totals']] + $cur);

    case 'web.landing':
        $needPost();
        $raw = is_array($input['paths'] ?? null) ? $input['paths'] : [];
        $paths = [];
        foreach ($raw as $pth) {
            if (!is_string($pth)) continue;
            $pth = trim($pth);
            if ($pth === '') continue;
            if ($pth[0] !== '/') $pth = '/' . $pth;
            if (strlen($pth) > 200 || !preg_match('#^/[A-Za-z0-9/_.\-~%]*\*?$#', $pth)) fail('path', 422, ['value' => $pth]);
            if (strlen($pth) > 1 && substr($pth, -1) !== '*') $pth = rtrim($pth, '/') ?: '/';
            $paths[] = $pth;
        }
        $paths = array_values(array_unique($paths));
        if (count($paths) > 10) fail('limit');
        $config['tracking']['landing_paths'] = $paths;
        if (!save_config($config)) fail('save', 500);
        out(['ok' => true, 'paths' => $paths]);

    /* ================= Zielgruppe & Ziele ================= */

    case 'insights.get':
        out(['ok' => true, 'audience' => $config['audience'] ?? null, 'goals' => $config['goals'] ?? null]);

    case 'insights.save':
        $needPost();
        $pctVal = function ($v): ?float {
            if ($v === null || $v === '') return 0.0;
            if (!is_numeric($v)) return null;
            $f = round((float)$v, 1);
            return ($f < 0 || $f > 100) ? null : $f;
        };
        if (isset($input['audience'])) {
            $a = is_array($input['audience']) ? $input['audience'] : [];
            $ages = [];
            foreach (['18-24', '25-34', '35-44', '45-54', '55+'] as $k) {
                $v = $pctVal(($a['ages'] ?? [])[$k] ?? 0);
                if ($v === null) fail('field', 422, ['field' => 'age_' . $k, 'reason' => 'range']);
                $ages[$k] = $v;
            }
            $gender = [];
            foreach (['female', 'male', 'diverse'] as $k) {
                $v = $pctVal(($a['gender'] ?? [])[$k] ?? 0);
                if ($v === null) fail('field', 422, ['field' => 'gender_' . $k, 'reason' => 'range']);
                $gender[$k] = $v;
            }
            $cities = [];
            foreach (array_slice(is_array($a['cities'] ?? null) ? $a['cities'] : [], 0, 8) as $i => $c) {
                $name = str_in($c, 'name');
                if ($name === '') continue;
                if (mb_strlen($name) > 60) fail('field', 422, ['field' => 'city_' . $i, 'reason' => 'range']);
                $v = $pctVal(is_array($c) ? ($c['share'] ?? 0) : 0);
                if ($v === null) fail('field', 422, ['field' => 'city_' . $i, 'reason' => 'range']);
                $cities[] = ['name' => $name, 'share' => $v];
            }
            $config['audience'] = ['ages' => $ages, 'gender' => $gender, 'cities' => $cities, 'updated_at' => date('c')];
        }
        if (isset($input['goals'])) {
            $g = is_array($input['goals']) ? $input['goals'] : [];
            $posts = $g['posts_per_month'] ?? 12;
            $reach = $g['reach_per_month'] ?? 0;
            if (!is_numeric($posts) || (int)$posts < 1 || (int)$posts > 500) fail('field', 422, ['field' => 'posts_per_month', 'reason' => 'range']);
            if (!is_numeric($reach) || (int)$reach < 0 || (int)$reach > 1000000000) fail('field', 422, ['field' => 'reach_per_month', 'reason' => 'range']);
            $config['goals'] = ['posts_per_month' => (int)$posts, 'reach_per_month' => (int)$reach];
        }
        if (!save_config($config)) fail('save', 500);
        out(['ok' => true, 'audience' => $config['audience'] ?? null, 'goals' => $config['goals'] ?? null]);

    case 'web.month':
        $month = str_in($_GET, 'month');
        if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) fail('month');
        $landing = $config['tracking']['landing_paths'] ?? [];
        $landing = is_array($landing) ? array_values(array_filter($landing, 'is_string')) : [];
        out(['ok' => true, 'month' => $month, 'site' => track_site_host()] + track_month($month, $landing));

    /* ================= KI-Texte (optional, Anthropic API) ================= */

    case 'ai.status':
        require_once __DIR__ . '/includes/ai-config.php';
        out(['ok' => true, 'enabled' => AI_API_KEY !== '']);

    case 'ai.generate':
        $needPost();
        require_once __DIR__ . '/includes/ai-config.php';
        if (AI_API_KEY === '') fail('ai_off', 400);

        $now = time();
        $hits = array_values(array_filter($_SESSION['ai_hits'] ?? [], fn($t) => $t > $now - 3600));
        if (count($hits) >= 30) fail('ai_limit', 429);

        $topic = str_in($input, 'topic');
        if ($topic === '') fail('field', 422, ['field' => 'topic', 'reason' => 'required']);
        if (mb_strlen($topic) > 500) fail('field', 422, ['field' => 'topic', 'reason' => 'range']);
        $platform = str_in($input, 'platform');
        if (!in_array($platform, PLATFORM_OPTIONS, true)) $platform = 'instagram';
        $tone = str_in($input, 'tone');
        $tones = ['friendly' => 'freundlich und nahbar', 'professional' => 'professionell und seriös', 'casual' => 'locker und humorvoll', 'enthusiastic' => 'begeistert und motivierend'];
        if (!isset($tones[$tone])) $tone = 'friendly';
        $lang = str_in($input, 'lang');
        $langs = ['de' => 'Deutsch', 'en' => 'Englisch', 'fr' => 'Französisch', 'ar' => 'Arabisch'];
        if (!isset($langs[$lang])) $lang = 'de';
        $withTags = !empty($input['hashtags']);

        $business = (string)($config['client']['name'] ?? '');
        $system = 'Du schreibst Social-Media-Beiträge für ein lokales Unternehmen' . ($business !== '' ? ' namens "' . $business . '"' : '') .
            '. Antworte ausschließlich mit dem fertigen Beitragstext, ohne Einleitung, ohne Anführungszeichen und ohne Erklärungen.';
        $prompt = "Plattform: {$platform}\nTonalität: {$tones[$tone]}\nSprache: {$langs[$lang]}\nThema: {$topic}\n\n" .
            'Schreibe einen passenden Beitrag (max. 120 Wörter) mit klarer Handlungsaufforderung am Ende.' .
            ($withTags ? ' Füge in einer letzten, eigenen Zeile 5 bis 8 passende Hashtags hinzu.' : ' Keine Hashtags.');

        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 45,
            CURLOPT_HTTPHEADER     => ['content-type: application/json', 'x-api-key: ' . AI_API_KEY, 'anthropic-version: 2023-06-01'],
            CURLOPT_POSTFIELDS     => json_encode([
                'model'      => AI_MODEL,
                'max_tokens' => 700,
                'system'     => $system,
                'messages'   => [['role' => 'user', 'content' => $prompt]],
            ], JSON_UNESCAPED_UNICODE),
        ]);
        $raw  = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $resp = is_string($raw) ? json_decode($raw, true) : null;
        $text = '';
        foreach ((is_array($resp) ? ($resp['content'] ?? []) : []) as $block) {
            if (($block['type'] ?? '') === 'text') $text .= (string)$block['text'];
        }
        if ($code !== 200 || trim($text) === '') fail('ai_error', 502, ['status' => $code]);

        $hits[] = $now;
        $_SESSION['ai_hits'] = $hits;
        out(['ok' => true, 'text' => trim($text)]);

    default:
        fail('unknown_action', 404);
}
