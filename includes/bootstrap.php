<?php
/**
 * SocialPulse – Bootstrap (Session, JSON-Speicher, Auth-Helfer)
 * Pfad: /includes/bootstrap.php
 */
declare(strict_types=1);

date_default_timezone_set('Europe/Berlin');

// ⚠️ Vor dem Setup jedes Kunden ändern (mind. 12 Zeichen)
const SETUP_KEY = 'TapWerbung-2026-Kunde01';

define('APP_ROOT', dirname(__DIR__));
define('DATA_DIR', APP_ROOT . '/data');
define('CONFIG_FILE', DATA_DIR . '/config.json');

const PLATFORMS = [
    'facebook'  => ['label' => 'Facebook',  'icon' => 'fab fa-facebook',  'required' => true],
    'instagram' => ['label' => 'Instagram', 'icon' => 'fab fa-instagram', 'required' => true],
    'google'    => ['label' => 'Google Unternehmensprofil', 'icon' => 'fab fa-google', 'required' => false, 'labelKey' => 'settings.p.google'],
    'tiktok'    => ['label' => 'TikTok',    'icon' => 'fab fa-tiktok',    'required' => false],
    'youtube'   => ['label' => 'YouTube',   'icon' => 'fab fa-youtube',   'required' => false],
    'linkedin'  => ['label' => 'LinkedIn',  'icon' => 'fab fa-linkedin',  'required' => false],
    'x'         => ['label' => 'X (Twitter)', 'icon' => 'fab fa-twitter', 'required' => false],
    'whatsapp'  => ['label' => 'WhatsApp Business', 'icon' => 'fab fa-whatsapp', 'required' => false],
];

/* ---------- Datenordner anlegen + schützen ---------- */
function ensure_data_dir(): void {
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }
    $ht = DATA_DIR . '/.htaccess';
    if (!is_file($ht)) {
        file_put_contents($ht,
            "<IfModule mod_authz_core.c>\n    Require all denied\n</IfModule>\n" .
            "<IfModule !mod_authz_core.c>\n    Deny from all\n</IfModule>\n");
    }
}
ensure_data_dir();

/* ---------- Session ---------- */
if (!defined('SP_NO_SESSION') && session_status() === PHP_SESSION_NONE) {
    session_name('SP_' . substr(md5(APP_ROOT), 0, 10));
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);
    ini_set('session.use_strict_mode', '1');
    session_start();
}

/* ---------- JSON-Speicher ---------- */
function read_json(string $file, array $default = []): array {
    if (!is_file($file)) return $default;
    $data = json_decode((string)file_get_contents($file), true);
    return is_array($data) ? $data : $default;
}

function write_json(string $file, array $data): bool {
    $tmp = $file . '.tmp';
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return rename($tmp, $file);
}

function is_installed(): bool { return is_file(CONFIG_FILE); }
function get_config(): array  { return read_json(CONFIG_FILE); }
function save_config(array $c): bool { return write_json(CONFIG_FILE, $c); }

/* ---------- Helfer ---------- */
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

function str_in($arr, string $key): string {
    return (is_array($arr) && isset($arr[$key]) && is_scalar($arr[$key])) ? trim((string)$arr[$key]) : '';
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function check_csrf($token): bool {
    return is_string($token) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

function valid_phone(string $p): bool {
    return (bool)preg_match('/^[0-9 +()\/.-]{5,25}$/', $p);
}

function clean_url(string $url): string {
    $url = trim($url);
    if ($url === '') return '';
    if (!preg_match('~^https?://~i', $url)) $url = 'https://' . $url;
    if (!filter_var($url, FILTER_VALIDATE_URL)) return '';
    $host = parse_url($url, PHP_URL_HOST);
    return (is_string($host) && strpos($host, '.') !== false) ? $url : '';
}

/** @return array [links, fehlerhaftesFeld|null] */
function validate_links($in): array {
    $links = ['website' => clean_url(str_in($in, 'website'))];
    if ($links['website'] === '') return [$links, 'website'];
    foreach (PLATFORMS as $key => $p) {
        $raw = str_in($in, $key);
        $url = clean_url($raw);
        if (($p['required'] && $url === '') || ($raw !== '' && $url === '')) return [$links, $key];
        $links[$key] = $url;
    }
    return [$links, null];
}

function platforms_public(): array {
    $out = [];
    foreach (PLATFORMS as $key => $p) $out[] = ['key' => $key] + $p;
    return $out;
}

/* ---------- Auth ---------- */
function is_logged_in(): bool {
    if (empty($_SESSION['uid'])) return false;
    $acc = get_config()['account'] ?? [];
    return hash_equals((string)($acc['username'] ?? ''), (string)$_SESSION['uid'])
        && (string)($_SESSION['pwv'] ?? '') === (string)($acc['password_changed_at'] ?? '');
}

function login_session(array $account): void {
    session_regenerate_id(true);
    $_SESSION['uid'] = $account['username'];
    $_SESSION['pwv'] = (string)($account['password_changed_at'] ?? '');
}

function require_login(): void {
    if (!is_installed()) { header('Location: setup.php'); exit; }
    if (!is_logged_in()) { header('Location: login.php'); exit; }
}
