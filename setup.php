<?php
/**
 * SocialPulse – Ersteinrichtung pro Kunde
 * Pfad: /setup.php
 */
require __DIR__ . '/includes/bootstrap.php';

if (is_installed()) { header('Location: login.php'); exit; }

$errors    = [];
$keyNotSet = (SETUP_KEY === 'BITTE-AENDERN' || strlen(SETUP_KEY) < 12);
$post      = $_SERVER['REQUEST_METHOD'] === 'POST' ? $_POST : [];
$postLinks = is_array($post['links'] ?? null) ? $post['links'] : [];

if ($post && !$keyNotSet) {
    if (!check_csrf(str_in($post, 'csrf')))                 $errors[] = 'Sitzung abgelaufen – bitte Formular erneut absenden.';
    if (!hash_equals(SETUP_KEY, str_in($post, 'setup_key'))) $errors[] = 'Setup-Schlüssel ist falsch.';

    $name  = str_in($post, 'client_name');
    $phone = str_in($post, 'client_phone');
    $date  = str_in($post, 'handover_date');
    if ($name === '' || mb_strlen($name) > 120) $errors[] = 'Bitte den Kundennamen eingeben.';
    if (!valid_phone($phone))                  $errors[] = 'Telefonnummer ist ungültig.';
    $d = DateTime::createFromFormat('Y-m-d', $date);
    if (!$d || $d->format('Y-m-d') !== $date)  $errors[] = 'Bitte ein gültiges Übergabedatum wählen.';

    [$links, $bad] = validate_links($postLinks);
    if ($bad === 'website')  $errors[] = 'Webseiten-Link ist ungültig.';
    elseif ($bad !== null)   $errors[] = PLATFORMS[$bad]['label'] . '-Link ist ungültig oder fehlt.';

    $user = str_in($post, 'username');
    $pw   = is_string($post['password'] ?? null)  ? $post['password']  : '';
    $pw2  = is_string($post['password2'] ?? null) ? $post['password2'] : '';
    if (!preg_match('/^[A-Za-z0-9._-]{3,40}$/', $user)) $errors[] = 'Benutzername: 3–40 Zeichen (Buchstaben, Zahlen, . _ -).';
    if (strlen($pw) < 8)  $errors[] = 'Passwort muss mindestens 8 Zeichen haben.';
    elseif ($pw !== $pw2) $errors[] = 'Passwörter stimmen nicht überein.';

    if (!$errors) {
        $now = date('c');
        $config = [
            'client'  => ['name' => $name, 'phone' => $phone, 'handover_date' => $date],
            'links'   => $links,
            'account' => [
                'username'            => $user,
                'password_hash'       => password_hash($pw, PASSWORD_DEFAULT),
                'password_changed_at' => $now,
            ],
            'prefs'   => ['email_notifications' => true, 'auto_reports' => true, 'ai_recommendations' => true],
            'created_at' => $now,
        ];
        if (save_config($config)) { header('Location: login.php?installed=1'); exit; }
        $errors[] = 'Konnte nicht gespeichert werden – Schreibrechte für den Ordner /data prüfen.';
    }
}

$v  = fn(string $k): string => e(str_in($post, $k));
$lv = fn(string $k): string => e(str_in($postLinks, $k));
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>SocialPulse – Einrichtung</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/auth.css">
</head>
<body>
<main class="auth-card wide">
    <div class="auth-brand">
        <div class="auth-logo"><i class="fas fa-chart-line"></i></div>
        <div>
            <h1>SocialPulse einrichten</h1>
            <p>Einmalige Einrichtung vor der Übergabe an den Kunden</p>
        </div>
    </div>

    <?php if ($keyNotSet): ?>
        <div class="alert alert-err">Bitte zuerst <strong>SETUP_KEY</strong> in <code>includes/bootstrap.php</code> setzen (mind. 12 Zeichen).</div>
    <?php else: ?>

    <?php if ($errors): ?>
        <div class="alert alert-err"><ul><?php foreach ($errors as $err): ?><li><?= e($err) ?></li><?php endforeach; ?></ul></div>
    <?php endif; ?>

    <form method="post" autocomplete="off" novalidate>
        <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">

        <section class="auth-section">
            <h2><i class="fas fa-key"></i> Setup-Schlüssel</h2>
            <div class="field">
                <label for="setup_key">Schlüssel aus includes/bootstrap.php <span class="req">*</span></label>
                <input type="password" id="setup_key" name="setup_key" required>
            </div>
        </section>

        <section class="auth-section">
            <h2><i class="fas fa-user-tie"></i> Kundendaten</h2>
            <div class="auth-grid">
                <div class="field">
                    <label for="client_name">Kundenname / Firma <span class="req">*</span></label>
                    <input type="text" id="client_name" name="client_name" maxlength="120" value="<?= $v('client_name') ?>" required>
                </div>
                <div class="field">
                    <label for="client_phone">Telefon <span class="req">*</span></label>
                    <input type="tel" id="client_phone" name="client_phone" maxlength="25" value="<?= $v('client_phone') ?>" required>
                </div>
                <div class="field">
                    <label for="handover_date">Übergabedatum <span class="req">*</span></label>
                    <input type="date" id="handover_date" name="handover_date" value="<?= $v('handover_date') ?: date('Y-m-d') ?>" required>
                </div>
            </div>
        </section>

        <section class="auth-section">
            <h2><i class="fas fa-share-alt"></i> Webseite &amp; Social Media</h2>
            <div class="auth-grid">
                <div class="field">
                    <label for="l_website"><i class="fas fa-globe"></i> Webseite <span class="req">*</span></label>
                    <input type="url" id="l_website" name="links[website]" placeholder="https://" value="<?= $lv('website') ?>" required>
                </div>
                <?php foreach (PLATFORMS as $key => $p): ?>
                <div class="field">
                    <label for="l_<?= e($key) ?>">
                        <i class="<?= e($p['icon']) ?>"></i> <?= e($p['label']) ?>
                        <?= $p['required'] ? '<span class="req">*</span>' : '<span class="opt">(optional)</span>' ?>
                    </label>
                    <input type="url" id="l_<?= e($key) ?>" name="links[<?= e($key) ?>]" placeholder="https://" value="<?= $lv($key) ?>">
                </div>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="auth-section">
            <h2><i class="fas fa-lock"></i> Zugangsdaten für den Kunden</h2>
            <div class="auth-grid">
                <div class="field">
                    <label for="username">Benutzername <span class="req">*</span></label>
                    <input type="text" id="username" name="username" maxlength="40" value="<?= $v('username') ?>" required>
                </div>
                <div class="field"></div>
                <div class="field">
                    <label for="password">Passwort (min. 8 Zeichen) <span class="req">*</span></label>
                    <input type="password" id="password" name="password" autocomplete="new-password" required>
                </div>
                <div class="field">
                    <label for="password2">Passwort wiederholen <span class="req">*</span></label>
                    <input type="password" id="password2" name="password2" autocomplete="new-password" required>
                </div>
            </div>
        </section>

        <button type="submit" class="btn"><i class="fas fa-check"></i> Dashboard einrichten</button>
    </form>
    <?php endif; ?>
</main>
</body>
</html>
