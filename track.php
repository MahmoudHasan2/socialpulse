<?php
/**
 * SocialPulse – öffentlicher Tracking-Endpunkt
 * Pfad: /track.php
 */
define('SP_NO_SESSION', true);
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/tracking.php';

header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$method     = (string)($_SERVER['REQUEST_METHOD'] ?? '');
$origin     = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
$source     = $origin !== '' ? $origin : (string)($_SERVER['HTTP_REFERER'] ?? '');
$originHost = parse_url($source, PHP_URL_HOST);
$originHost = is_string($originHost) ? strtolower($originHost) : '';

if ($origin !== '' && is_installed() && track_host_matches($originHost, track_site_host())) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($method !== 'POST' || !is_installed()) {
    http_response_code(204);
    exit;
}

$raw = (string)file_get_contents('php://input', false, null, 0, 2048);
$in  = json_decode($raw, true);
if (is_array($in)) track_record($in, $originHost);

http_response_code(204);
