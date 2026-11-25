<?php
/**
 * SocialPulse – Anmeldung
 * Pfad: /login.php
 */
require __DIR__ . '/includes/bootstrap.php';

if (!is_installed()) { header('Location: setup.php'); exit; }
if (is_logged_in())  { header('Location: index.php'); exit; }

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 900;

$attFile  = DATA_DIR . '/login_attempts.json';
$ipKey    = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . APP_ROOT);
$now      = time();
$attempts = read_json($attFile);
foreach ($attempts as $k => $r) {
    if (($r['until'] ?? 0) < $now && ($r['last'] ?? 0) < $now - LOCK_SECONDS) unset($attempts[$k]);
}
$rec      = $attempts[$ipKey] ?? ['count' => 0, 'last' => 0, 'until' => 0];
$error    = '';
$username = '';

if ($rec['until'] > $now) {
    $error = 'Zu viele Fehlversuche. Bitte in ' . ceil(($rec['until'] - $now) / 60) . ' Minuten erneut versuchen.';
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = str_in($_POST, 'username');
    $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
    $acc      = get_config()['account'] ?? [];

    $valid = check_csrf(str_in($_POST, 'csrf'))
        && hash_equals((string)($acc['username'] ?? ''), $username)
        && password_verify($password, (string)($acc['password_hash'] ?? ''));

    if ($valid) {
        unset($attempts[$ipKey]);
        write_json($attFile, $attempts);
        login_session($acc);
        header('Location: index.php');
        exit;
    }

    $rec['count']++;
    $rec['last'] = $now;
    if ($rec['count'] >= MAX_ATTEMPTS) { $rec['until'] = $now + LOCK_SECONDS; $rec['count'] = 0; }
    $attempts[$ipKey] = $rec;
    write_json($attFile, $attempts);
    usleep(400000);
    $error = 'Benutzername oder Passwort ist falsch.';
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>SocialPulse – Anmelden</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/auth.css">
</head>
<body>
<main class="auth-card">
    <div class="auth-brand">
        <div class="auth-logo"><i class="fas fa-chart-line"></i></div>
        <div>
            <h1>SocialPulse</h1>
            <p>Social-Media- &amp; Webseiten-Analyse</p>
        </div>
    </div>

    <?php if (isset($_GET['installed']) && !$error): ?>
        <div class="alert alert-ok">Einrichtung abgeschlossen. Jetzt mit den Kundenzugangsdaten anmelden.</div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="alert alert-err"><?= e($error) ?></div>
    <?php endif; ?>

    <form method="post" novalidate>
        <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
        <div class="field">
            <label for="username">Benutzername</label>
            <input type="text" id="username" name="username" value="<?= e($username) ?>" autocomplete="username" required autofocus>
        </div>
        <div class="field" style="margin-top:14px;">
            <label for="password">Passwort</label>
            <input type="password" id="password" name="password" autocomplete="current-password" required>
        </div>
        <button type="submit" class="btn"><i class="fas fa-sign-in-alt"></i> Anmelden</button>
    </form>
    <p class="hint">Powered by TAP Werbung</p>
</main>
</body>
</html>
