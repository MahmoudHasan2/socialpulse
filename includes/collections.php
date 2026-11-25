<?php
/**
 * SocialPulse – Datensammlungen (Schema, Validierung, Speicher)
 * Pfad: /includes/collections.php
 */
declare(strict_types=1);

const PLATFORM_OPTIONS = ['instagram', 'facebook', 'google', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp', 'website', 'other'];
const COLLECTION_LIMIT = 5000;

const COLLECTIONS = [
    'posts' => [
        'date'     => ['type' => 'date', 'required' => true],
        'platform' => ['type' => 'enum', 'options' => PLATFORM_OPTIONS, 'required' => true],
        'status'   => ['type' => 'enum', 'options' => ['published', 'planned'], 'required' => true],
        'title'    => ['type' => 'text', 'max' => 200, 'required' => true],
        'url'      => ['type' => 'url'],
        'likes'    => ['type' => 'int'],
        'comments' => ['type' => 'int'],
        'shares'   => ['type' => 'int'],
        'reach'    => ['type' => 'int'],
    ],
    'campaigns' => [
        'name'        => ['type' => 'text', 'max' => 120, 'required' => true],
        'kind'        => ['type' => 'enum', 'options' => ['organic', 'ad'], 'required' => true],
        'platform'    => ['type' => 'enum', 'options' => PLATFORM_OPTIONS, 'required' => true],
        'status'      => ['type' => 'enum', 'options' => ['planned', 'active', 'paused', 'ended'], 'required' => true],
        'budget'      => ['type' => 'money'],
        'spent'       => ['type' => 'money'],
        'start'       => ['type' => 'date'],
        'end'         => ['type' => 'date'],
        'impressions' => ['type' => 'int'],
        'clicks'      => ['type' => 'int'],
        'conversions' => ['type' => 'int'],
        'revenue'     => ['type' => 'money'],
    ],
    'templates' => [
        'title'    => ['type' => 'text', 'max' => 120, 'required' => true],
        'category' => ['type' => 'enum', 'options' => ['offer', 'testimonial', 'behind', 'event', 'info', 'other'], 'required' => true],
        'platform' => ['type' => 'enum', 'options' => ['all', 'instagram', 'facebook', 'google', 'tiktok', 'youtube', 'linkedin', 'x', 'whatsapp', 'website', 'other'], 'required' => true],
        'text'     => ['type' => 'textarea', 'max' => 2200, 'required' => true],
        'hashtags' => ['type' => 'text', 'max' => 300],
        'uses'     => ['type' => 'int'],
    ],
    'reviews' => [
        'author'  => ['type' => 'text', 'max' => 80, 'required' => true],
        'rating'  => ['type' => 'int', 'min' => 1, 'max' => 5, 'required' => true],
        'date'    => ['type' => 'date', 'required' => true],
        'text'    => ['type' => 'textarea', 'max' => 2000],
        'replied' => ['type' => 'bool'],
        'reply'   => ['type' => 'textarea', 'max' => 2000],
    ],
    'messages' => [
        'sender'   => ['type' => 'text', 'max' => 80, 'required' => true],
        'platform' => ['type' => 'enum', 'options' => PLATFORM_OPTIONS, 'required' => true],
        'date'     => ['type' => 'date', 'required' => true],
        'time'     => ['type' => 'time'],
        'text'     => ['type' => 'textarea', 'max' => 2000, 'required' => true],
        'read'     => ['type' => 'bool'],
        'answered' => ['type' => 'bool'],
    ],
    'followers' => [
        'date'      => ['type' => 'date', 'required' => true],
        'platform'  => ['type' => 'enum', 'options' => PLATFORM_OPTIONS, 'required' => true],
        'followers' => ['type' => 'int', 'required' => true],
        'gained'    => ['type' => 'int'],
        'lost'      => ['type' => 'int'],
    ],
    'inbox' => [
        'type'     => ['type' => 'enum', 'options' => ['comment', 'mention'], 'required' => true],
        'platform' => ['type' => 'enum', 'options' => PLATFORM_OPTIONS, 'required' => true],
        'author'   => ['type' => 'text', 'max' => 80, 'required' => true],
        'date'     => ['type' => 'date', 'required' => true],
        'time'     => ['type' => 'time'],
        'text'     => ['type' => 'textarea', 'max' => 2000, 'required' => true],
        'status'   => ['type' => 'enum', 'options' => ['new', 'review', 'done'], 'required' => true],
    ],
];

/**
 * Prüft und normalisiert einen Eintrag.
 * @return array [item|null, [feld, grund]|null]
 */
function col_validate(string $col, $in): array {
    $in  = is_array($in) ? $in : [];
    $out = [];

    foreach (COLLECTIONS[$col] as $key => $f) {
        $req = !empty($f['required']);
        $raw = $in[$key] ?? null;

        switch ($f['type']) {
            case 'text':
            case 'textarea':
                $v   = is_scalar($raw) ? trim((string)$raw) : '';
                $max = $f['max'] ?? ($f['type'] === 'text' ? 200 : 2000);
                if ($v === '' && $req) return [null, [$key, 'required']];
                if (mb_strlen($v) > $max) return [null, [$key, 'range']];
                $out[$key] = $v;
                break;

            case 'url':
                $v = is_scalar($raw) ? trim((string)$raw) : '';
                $u = $v === '' ? '' : clean_url($v);
                if ($v !== '' && $u === '') return [null, [$key, 'invalid']];
                if ($u === '' && $req) return [null, [$key, 'required']];
                $out[$key] = $u;
                break;

            case 'int':
                if ($raw === null || $raw === '') {
                    if ($req) return [null, [$key, 'required']];
                    $out[$key] = 0;
                    break;
                }
                if (!is_numeric($raw) || (float)$raw != (int)$raw) return [null, [$key, 'invalid']];
                $n = (int)$raw;
                if ($n < ($f['min'] ?? 0) || $n > ($f['max'] ?? 1000000000000)) return [null, [$key, 'range']];
                $out[$key] = $n;
                break;

            case 'money':
                if ($raw === null || $raw === '') {
                    if ($req) return [null, [$key, 'required']];
                    $out[$key] = 0;
                    break;
                }
                if (!is_numeric($raw)) return [null, [$key, 'invalid']];
                $n = round((float)$raw, 2);
                if ($n < 0 || $n > 1000000000) return [null, [$key, 'range']];
                $out[$key] = $n;
                break;

            case 'date':
                $v = is_string($raw) ? trim($raw) : '';
                if ($v === '') {
                    if ($req) return [null, [$key, 'required']];
                    $out[$key] = '';
                    break;
                }
                $d = DateTime::createFromFormat('!Y-m-d', $v);
                if (!$d || $d->format('Y-m-d') !== $v) return [null, [$key, 'invalid']];
                $out[$key] = $v;
                break;

            case 'time':
                $v = is_string($raw) ? trim($raw) : '';
                if ($v === '') {
                    if ($req) return [null, [$key, 'required']];
                    $out[$key] = '';
                    break;
                }
                if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $v)) return [null, [$key, 'invalid']];
                $out[$key] = $v;
                break;

            case 'enum':
                $v = is_scalar($raw) ? (string)$raw : '';
                if ($v === '') {
                    if ($req) return [null, [$key, 'required']];
                    $out[$key] = '';
                    break;
                }
                if (!in_array($v, $f['options'], true)) return [null, [$key, 'invalid']];
                $out[$key] = $v;
                break;

            case 'bool':
                $out[$key] = ($raw === true || $raw === 1 || $raw === '1' || $raw === 'true');
                break;
        }
    }

    if ($col === 'campaigns' && $out['start'] !== '' && $out['end'] !== '' && $out['end'] < $out['start']) {
        return [null, ['end', 'range']];
    }
    return [$out, null];
}

/* ---------- Speicher ---------- */
function col_file(string $col): string { return DATA_DIR . '/col_' . $col . '.json'; }

function col_load(string $col): array {
    return array_values(array_filter(read_json(col_file($col)), 'is_array'));
}

function col_store(string $col, array $items): bool {
    return write_json(col_file($col), array_values($items));
}

/** Führt $fn exklusiv für eine Sammlung aus (verhindert gleichzeitiges Überschreiben). */
function col_locked(string $col, callable $fn) {
    $fh = fopen(DATA_DIR . '/col_' . $col . '.lock', 'c');
    if (!$fh) return $fn();
    flock($fh, LOCK_EX);
    try {
        return $fn();
    } finally {
        flock($fh, LOCK_UN);
        fclose($fh);
    }
}
