<?php
require __DIR__ . '/includes/bootstrap.php';
require_login();
?>
<!DOCTYPE html>
<html lang="de" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SocialPulse - Social-Media- &amp; Webseiten-Analyse</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --sidebar-bg: #1a1d29;
            --sidebar-width: 260px;
            --primary: #6366f1;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
            --body-bg: #f3f4f6;
            --card-bg: #ffffff;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --text-muted: #9ca3af;
            --border-color: #e5e7eb;
            --shadow: 0 1px 3px rgba(0,0,0,0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
            --radius: 12px;
            --radius-sm: 8px;
        }
        .dark-mode {
            --body-bg: #0f111a; --card-bg: #1a1d29; --text-primary: #f3f4f6;
            --text-secondary: #9ca3af; --text-muted: #6b7280; --border-color: #2d3748;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Inter', sans-serif; background: var(--body-bg); color: var(--text-primary); transition: all .3s ease; }
        .sidebar { position:fixed; left:0; top:0; width:var(--sidebar-width); height:100vh; background:var(--sidebar-bg); color:#9ca3af; overflow-y:auto; overflow-x:hidden; z-index:1000; transition: all .3s ease; }
        .sidebar::-webkit-scrollbar{width:4px;} .sidebar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px;}
        .sidebar-header { padding:20px; display:flex; align-items:center; gap:12px; border-bottom:1px solid rgba(255,255,255,.05); }
        .logo-icon { width:36px; height:36px; background:linear-gradient(135deg,#ec4899,#f43f5e); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; }
        .logo-text { color:#fff; } .logo-text h1{font-size:18px;font-weight:700;letter-spacing:.5px;} .logo-text span{font-size:9px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;}
        .menu-label { padding:20px 20px 8px; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#6b7280; font-weight:600; }
        .nav-item { padding:10px 20px; display:flex; align-items:center; gap:12px; cursor:pointer; transition: all .2s; position:relative; }
        .nav-item:hover { color:#fff; background:rgba(255,255,255,.03); }
        .nav-item.active { color:#fff; background:rgba(255,255,255,.05); }
        .nav-item.active::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--primary); }
        .nav-item i { width:20px; text-align:center; font-size:14px; }
        .nav-item span { font-size:13px; font-weight:500; flex:1; }
        .main-content { margin-left: var(--sidebar-width); min-height:100vh; transition: all .3s ease; }
        .topbar { background:var(--card-bg); padding:12px 24px; display:flex; align-items:center; justify-content:space-between; box-shadow:var(--shadow); position:sticky; top:0; z-index:100; }
        .topbar-left { display:flex; align-items:center; gap:16px; flex:1; }
        .menu-toggle { background:none; border:none; color:var(--text-secondary); font-size:18px; cursor:pointer; padding:8px; border-radius:8px; transition: all .2s; }
        .menu-toggle:hover { background:var(--body-bg); color:var(--text-primary); }
        .search-box { position:relative; width:280px; }
        .search-box input { width:100%; padding:10px 16px 10px 40px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--body-bg); color:var(--text-primary); font-size:14px; outline:none; }
        .search-box i { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:14px; }
        .topbar-right { display:flex; align-items:center; gap:8px; }
        .topbar-icon { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; transition: all .2s; position:relative; font-size:16px; }
        .topbar-icon:hover { background:var(--body-bg); color:var(--text-primary); }
        .topbar-icon .notif-badge { position:absolute; top:2px; right:2px; width:18px; height:18px; background:var(--danger); color:#fff; font-size:10px; font-weight:700; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid var(--card-bg); }
        .user-avatar { width:36px; height:36px; border-radius:50%; object-fit:cover; cursor:pointer; border:2px solid var(--border-color); }
        .page-content { padding:24px; }
        .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .page-title h2 { font-size:20px; font-weight:600; }
        .breadcrumb { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-secondary); }
        .breadcrumb a { color:var(--text-secondary); text-decoration:none; } .breadcrumb i{font-size:10px;} .breadcrumb span{color:var(--text-primary);font-weight:500;}
        .stats-grid { display:grid; grid-template-columns: repeat(4,1fr); gap:20px; margin-bottom:24px; }
        .stat-card { background:var(--card-bg); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow); display:flex; align-items:flex-start; gap:16px; transition: all .3s ease; }
        .stat-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); }
        .stat-icon { width:48px; height:48px; border-radius:var(--radius-sm); background:rgba(99,102,241,.1); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .stat-info { flex:1; } .stat-label{font-size:12px;color:var(--text-secondary);margin-bottom:4px;}
        .stat-value { font-size:22px; font-weight:700; margin-bottom:4px; }
        .stat-change { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:2px 8px; border-radius:4px; }
        .stat-change.up { color:var(--success); background:rgba(16,185,129,.1); }
        .stat-change.down { color:var(--danger); background:rgba(239,68,68,.1); }
        .stat-sparkline { width:100px; height:40px; }
        .dashboard-grid { display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:20px; }
        .dashboard-grid-bottom { display:grid; grid-template-columns:1fr 1.5fr 1fr; gap:20px; }
        .card { background:var(--card-bg); border-radius:var(--radius); box-shadow:var(--shadow); overflow:hidden; }
        .card-header { padding:20px 20px 0; display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .card-title { font-size:15px; font-weight:600; }
        .card-dropdown { padding:6px 12px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:transparent; color:var(--text-secondary); font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .card-body { padding:0 20px 20px; }
        .sales-analytic { grid-row: span 2; }
        .sales-earnings { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-secondary); margin-bottom:16px; }
        .sales-earnings i { color:var(--text-primary); } .sales-earnings strong{color:var(--text-primary);font-weight:600;}
        .chart-container { position:relative; height:280px; margin-bottom:16px; }
        .sales-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding-top:16px; border-top:1px solid var(--border-color); }
        .summary-item { text-align:center; } .summary-label{font-size:12px;color:var(--text-secondary);margin-bottom:4px;}
        .summary-value { font-size:16px; font-weight:600; margin-bottom:4px; }
        .summary-change { font-size:11px; font-weight:600; } .summary-change.up{color:var(--success);} .summary-change.down{color:var(--danger);}
        .balance-card { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; padding:24px; border-radius:var(--radius); position:relative; overflow:hidden; }
        .balance-card::before { content:''; position:absolute; top:-50%; right:-20%; width:200px; height:200px; background:rgba(255,255,255,.05); border-radius:50%; }
        .balance-amount { font-size:24px; font-weight:700; margin-bottom:4px; }
        .balance-label { font-size:13px; opacity:.8; margin-bottom:20px; }
        .balance-stats { display:flex; gap:16px; margin-bottom:20px; }
        .balance-stat { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.15); padding:10px 14px; border-radius:var(--radius-sm); }
        .balance-stat-icon { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; }
        .balance-stat-icon.income { background:rgba(16,185,129,.3); color:#6ee7b7; } .balance-stat-icon.expense{background:rgba(239,68,68,.3);color:#fca5a5;}
        .balance-stat-info { font-size:12px; } .balance-stat-info div:first-child{font-weight:600;} .balance-stat-info div:last-child{opacity:.7;font-size:11px;}
        .balance-actions { display:flex; gap:10px; }
        .balance-btn { flex:1; padding:10px; border:none; border-radius:var(--radius-sm); font-size:13px; font-weight:600; cursor:pointer; transition: all .2s; }
        .balance-btn.send { background:#f59e0b; color:#fff; } .balance-btn.receive{background:rgba(255,255,255,.2);color:#fff;}
        .balance-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.15); }
        .balance-illustration { position:absolute; right:20px; bottom:20px; width:120px; height:100px; opacity:.9; }
        .mini-cards { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .mini-card { background:var(--card-bg); border-radius:var(--radius); padding:20px; box-shadow:var(--shadow); text-align:center; }
        .mini-card-icon { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:16px; }
        .mini-card-icon.purple { background:rgba(99,102,241,.1); color:var(--primary); } .mini-card-icon.green{background:rgba(16,185,129,.1);color:var(--success);}
        .mini-card-value { font-size:18px; font-weight:700; margin-bottom:4px; }
        .mini-card-label { font-size:12px; color:var(--text-secondary); margin-bottom:8px; }
        .mini-card-target { font-size:11px; color:var(--text-muted); margin-bottom:8px; }
        .progress-bar { height:6px; background:var(--body-bg); border-radius:3px; overflow:hidden; }
        .progress-fill { height:100%; border-radius:3px; transition: width 1s ease; }
        .progress-fill.purple { background:var(--primary); } .progress-fill.green{background:var(--success);}
        .view-more { display:flex; align-items:center; justify-content:flex-end; gap:4px; font-size:12px; color:var(--primary); text-decoration:none; margin-top:12px; font-weight:500; }
        .social-source-subtitle { font-size:12px; color:var(--text-secondary); margin-bottom:16px; }
        .donut-container { position:relative; height:180px; display:flex; align-items:center; justify-content:center; }
        .donut-center { position:absolute; text-align:center; } .donut-center-label{font-size:11px;color:var(--text-secondary);}
        .donut-center-value { font-size:24px; font-weight:700; }
        .social-buyers { display:flex; align-items:center; gap:8px; margin-top:12px; font-size:13px; color:var(--text-secondary); }
        .social-buyers i { color:var(--primary); } .social-buyers strong{color:var(--text-primary);}
        .social-actions { display:flex; gap:8px; margin-top:16px; }
        .social-btn { flex:1; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:transparent; color:var(--text-secondary); font-size:12px; cursor:pointer; transition: all .2s; }
        .social-btn:hover { background:var(--primary); color:#fff; border-color:var(--primary); }
        .social-btn.primary { background:var(--primary); color:#fff; border-color:var(--primary); }
        .map-container { height:200px; background:#f8fafc; border-radius:var(--radius-sm); position:relative; overflow:hidden; }
        .map-svg { width:100%; height:100%; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:.5;} }
        .weekly-sales-img { width:100%; height:140px; object-fit:cover; border-radius:var(--radius-sm); margin-bottom:12px; }
        .weekly-sales-info h4 { font-size:14px; font-weight:600; margin-bottom:4px; }
        .weekly-sales-info p { font-size:12px; color:var(--text-secondary); margin-bottom:8px; }
        .weekly-sales-price { font-size:16px; font-weight:700; color:var(--primary); }
        .weekly-sales-meta { display:flex; align-items:center; gap:12px; margin-top:8px; font-size:11px; color:var(--text-muted); flex-wrap:wrap; }
        .weekly-sales-meta span { display:flex; align-items:center; gap:4px; }
        @media (max-width:1400px){ .stats-grid{grid-template-columns:repeat(2,1fr);} .dashboard-grid{grid-template-columns:1fr;} .dashboard-grid-bottom{grid-template-columns:1fr;} }
        @media (max-width:768px){ .sidebar{transform:translateX(-100%);} .sidebar.open{transform:translateX(0);} .main-content{margin-left:0;} .stats-grid{grid-template-columns:1fr;} .search-box{width:180px;} }
        ::-webkit-scrollbar{width:6px;height:6px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;} .dark-mode ::-webkit-scrollbar-thumb{background:#4b5563;}

        .stats-grid-3 { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1400px) { .stats-grid-3 { grid-template-columns: repeat(1, 1fr); } }
        .page-subtitle { font-size: 13px; color: var(--text-secondary); margin: -14px 0 20px; }
        .lang-switch { display:flex; align-items:center; gap:6px; padding:8px 10px; border:1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); font-size:13px; }
        .lang-switch select { border:none; background:transparent; color: var(--text-primary); font-size:13px; outline:none; cursor:pointer; }
        .list-row { display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid var(--border-color); }
        .list-row:last-child { border-bottom:none; }
        .list-row-icon { width:38px; height:38px; border-radius:50%; background: rgba(99,102,241,0.1); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
        .list-row-info { flex:1; min-width:0; }
        .list-row-title { font-size:13px; font-weight:600; color:var(--text-primary); display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .list-row-sub { font-size:12px; color:var(--text-secondary); margin-top:2px; }
        .list-time { font-size:11px; color:var(--text-muted); font-weight:400; }
        .stars { color:#f59e0b; font-size:11px; letter-spacing:1px; }
        .badge { font-size:10px; font-weight:600; padding:2px 8px; border-radius:20px; }
        .badge-active { background: rgba(16,185,129,0.12); color: var(--success); }
        .badge-paused { background: rgba(239,68,68,0.12); color: var(--danger); }
        .data-table { width:100%; border-collapse:collapse; font-size:13px; }
        .data-table th { text-align:left; padding:10px 8px; color: var(--text-secondary); font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid var(--border-color); }
        .data-table td { padding:10px 8px; border-bottom:1px solid var(--border-color); color: var(--text-primary); }
        .form-grid { display:grid; grid-template-columns: repeat(2,1fr); gap:16px; }
        @media (max-width: 1400px){ .form-grid { grid-template-columns: 1fr; } }
        .form-group label { display:block; font-size:12px; color:var(--text-secondary); margin-bottom:6px; font-weight:500; }
        .form-group input { width:100%; padding:10px 12px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--body-bg); color:var(--text-muted); font-size:13px; }
        .grid-3 { display:grid; grid-template-columns: repeat(3,1fr); gap:16px; }
        .grid-5 { display:grid; grid-template-columns: repeat(5,1fr); gap:16px; }
        @media (max-width: 1400px){ .grid-3{grid-template-columns:1fr 1fr;} .grid-5{grid-template-columns:repeat(3,1fr);} }
        @media (max-width: 768px){ .grid-3{grid-template-columns:1fr;} .grid-5{grid-template-columns:repeat(2,1fr);} }
        .legend-list { display:flex; flex-wrap:wrap; gap:10px 18px; margin-top:14px; font-size:12px; color:var(--text-secondary); }
        .legend-item { display:flex; align-items:center; gap:6px; }
        .legend-dot { width:9px; height:9px; border-radius:50%; display:inline-block; }
        [dir="rtl"] .nav-item.active::before { left:auto; right:0; }
        [dir="rtl"] .sidebar { left:auto; right:0; }
        [dir="rtl"] .main-content { margin-left:0; }
        [dir="rtl"] .search-box i { left:auto; right:14px; }
        [dir="rtl"] .search-box input { padding:10px 40px 10px 16px; }

    </style>
    <meta name="csrf-token" content="<?= e(csrf_token()) ?>">
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
<aside class="sidebar" id="sidebar">
<div class="sidebar-header">
        <div class="logo-icon"><i class="fas fa-chart-line"></i></div>
        <div class="logo-text"><h1>SocialPulse</h1><span>SMART ANALYTICS</span></div>
    </div>
<div class="menu-label"><span data-i18n="navgroup.MENU">MENÜ</span></div>
<div class="nav-item active" data-page="analytics" onclick="showPage('analytics')">
                <i class="fas fa-th-large"></i>
                <span data-i18n="nav.analytics">Analysen</span>
            </div>
<div class="nav-item" data-page="social" onclick="showPage('social')">
                <i class="fas fa-share-alt"></i>
                <span data-i18n="nav.social">Social Media</span>
            </div>
<div class="nav-item" data-page="website" onclick="showPage('website')">
                <i class="fas fa-globe"></i>
                <span data-i18n="nav.website">Webseite</span>
            </div>
<div class="nav-item" data-page="reviews" onclick="showPage('reviews')">
                <i class="fas fa-star"></i>
                <span data-i18n="nav.reviews">Google Bewertungen</span>
            </div>
<div class="nav-item" data-page="audience" onclick="showPage('audience')">
                <i class="fas fa-user-friends"></i>
                <span data-i18n="nav.audience">Zielgruppe</span>
            </div>
<div class="nav-item" data-page="campaigns" onclick="showPage('campaigns')">
                <i class="fas fa-flag"></i>
                <span data-i18n="nav.campaigns">Kampagnen</span>
            </div>
<div class="nav-item" data-page="landing" onclick="showPage('landing')">
                <i class="fas fa-file-alt"></i>
                <span data-i18n="nav.landing">Landingpage</span>
            </div>
<div class="nav-item" data-page="linked" onclick="showPage('linked')">
                <i class="fas fa-link"></i>
                <span data-i18n="nav.linked">Verknüpfte Konten</span>
            </div>
<div class="nav-item" data-page="adcampaigns" onclick="showPage('adcampaigns')">
                <i class="fas fa-bullhorn"></i>
                <span data-i18n="nav.adcampaigns">Werbekampagnen</span>
            </div>
<div class="nav-item" data-page="followers" onclick="showPage('followers')">
                <i class="fas fa-users"></i>
                <span data-i18n="nav.followers">Follower</span>
            </div>
<div class="nav-item" data-page="engagement" onclick="showPage('engagement')">
                <i class="fas fa-heart"></i>
                <span data-i18n="nav.engagement">Interaktionen</span>
            </div>
<div class="nav-item" data-page="visits" onclick="showPage('visits')">
                <i class="fas fa-exchange-alt"></i>
                <span data-i18n="nav.visits">Besuche</span>
            </div>
<div class="nav-item" data-page="messages" onclick="showPage('messages')">
                <i class="fas fa-comment-dots"></i>
                <span data-i18n="nav.messages">Nachrichten</span>
            </div>
<div class="nav-item" data-page="inbox" onclick="showPage('inbox')">
                <i class="fas fa-inbox"></i>
                <span data-i18n="nav.inbox">Posteingang</span>
            </div>
<div class="nav-item" data-page="posts" onclick="showPage('posts')">
                <i class="fas fa-newspaper"></i>
                <span data-i18n="nav.posts">Beiträge</span>
            </div>
<div class="menu-label"><span data-i18n="navgroup.CUSTOM">BENUTZERDEFINIERT</span></div>
<div class="nav-item" data-page="reports" onclick="showPage('reports')">
                <i class="fas fa-file-invoice"></i>
                <span data-i18n="nav.reports">Berichte</span>
            </div>
<div class="nav-item" data-page="settings" onclick="showPage('settings')">
                <i class="fas fa-lock"></i>
                <span data-i18n="nav.settings">Einstellungen</span>
            </div>
<div class="nav-item" data-page="aitools" onclick="showPage('aitools')">
                <i class="fas fa-robot"></i>
                <span data-i18n="nav.aitools">KI-Tools</span>
            </div>
<div class="nav-item" data-page="templates" onclick="showPage('templates')">
                <i class="fas fa-layer-group"></i>
                <span data-i18n="nav.templates">Content-Vorlagen</span>
            </div>
<div class="menu-label"><span data-i18n="navgroup.COMPONENTS">KOMPONENTEN</span></div>
<div class="nav-item" data-page="baseaccounts" onclick="showPage('baseaccounts')">
                <i class="fas fa-cube"></i>
                <span data-i18n="nav.baseaccounts">Basiskonten</span>
            </div>
<div class="nav-item" data-page="advanced" onclick="showPage('advanced')">
                <i class="fas fa-cubes"></i>
                <span data-i18n="nav.advanced">Erweiterte Analysen</span>
            </div>
<div class="nav-item" data-page="charts" onclick="showPage('charts')">
                <i class="fas fa-chart-bar"></i>
                <span data-i18n="nav.charts">Diagramme</span>
            </div>
<div class="nav-item" data-page="map" onclick="showPage('map')">
                <i class="fas fa-map"></i>
                <span data-i18n="nav.map">Verteilungskarte</span>
            </div>
</aside>
    <main class="main-content">
<header class="topbar">
        <div class="topbar-left">
            <button class="menu-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Suchen..." data-i18n-placeholder="search">
            </div>
        </div>
        <div class="topbar-right">
            <div class="lang-switch">
                <i class="fas fa-globe"></i>
                <select id="langSelect" onchange="setLanguage(this.value)">
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                </select>
            </div>
            <div class="topbar-icon" onclick="toggleDarkMode()"><i class="fas fa-moon"></i></div>
            <div class="topbar-icon" style="position: relative;">
                <i class="fas fa-bell"></i>
                <span class="notif-badge">5</span>
            </div>
            <div class="topbar-icon" onclick="showPage('settings')" title="Einstellungen"><i class="fas fa-cog"></i></div>
            <a class="topbar-icon" href="logout.php" title="Abmelden"><i class="fas fa-sign-out-alt"></i></a>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="User" class="user-avatar">
        </div>
    </header>
        <div class="page-content">
<div class="page-section active" id="page-analytics">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.analytics">Analysen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.analytics.bc">Analysen</span></span>
            </div>
        </div>
        <div class="stats-grid" id="dash-stats"></div>
        <div class="dashboard-grid">
            <div class="card sales-analytic">
                <div class="card-header">
                    <h3 class="card-title"><span data-i18n="analytics.chartTitle">Wachstum von Followern und Interaktion</span></h3>
                    <span class="card-dropdown sp-static"><span data-i18n="dash.last12">Letzte 12 Monate</span></span>
                </div>
                <div class="card-body">
                    <div class="sales-earnings"><i class="fas fa-chart-bar"></i> <span data-i18n="analytics.reachLabel">Gesamtreichweite</span> : <strong id="dash-reach">—</strong></div>
                    <div class="chart-container"><canvas id="salesChart"></canvas></div>
                    <div class="sales-summary" id="dash-summary"></div>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:20px;">
                <div class="balance-card">
                    <div class="balance-amount" id="dash-score">— / 100</div>
                    <div class="balance-label"><span data-i18n="analytics.perfLabel">Performance-Score deines Kontos</span> <i class="fas fa-info-circle sp-score-hint"></i></div>
                    <div class="balance-stats" id="dash-balance"></div>
                    <div class="balance-actions">
                        <button class="balance-btn send" onclick="SP.openAdd('posts', {status:'published'})"><span data-i18n="analytics.btn0">Jetzt posten</span></button>
                        <button class="balance-btn receive" onclick="SP.openAdd('posts', {status:'planned'})"><span data-i18n="analytics.btn1">Beitrag planen</span></button>
                    </div>
                    <svg class="balance-illustration" viewBox="0 0 120 100" fill="none">
                        <ellipse cx="60" cy="85" rx="50" ry="10" fill="rgba(255,255,255,0.1)"/>
                        <rect x="30" y="50" width="60" height="35" rx="4" fill="rgba(255,255,255,0.2)"/>
                        <rect x="35" y="55" width="20" height="8" rx="2" fill="rgba(255,255,255,0.3)"/>
                        <rect x="35" y="68" width="50" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
                        <rect x="35" y="75" width="30" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
                        <circle cx="85" cy="40" r="15" fill="rgba(255,255,255,0.15)"/>
                        <text x="85" y="45" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="14">%</text>
                        <circle cx="25" cy="35" r="8" fill="rgba(255,255,255,0.1)"/>
                        <circle cx="95" cy="25" r="6" fill="rgba(255,255,255,0.1)"/>
                        <circle cx="15" cy="55" r="5" fill="rgba(255,255,255,0.1)"/>
                    </svg>
                </div>
                <div class="mini-cards" id="dash-minis"></div>
                <a href="#" class="view-more" onclick="showPage('posts');return false;"><span data-i18n="common.viewMore">Mehr anzeigen</span> <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
        <div class="dashboard-grid-bottom" style="margin-top:20px;">
            <div class="card">
                <div class="card-header">
                    <div><h3 class="card-title"><span data-i18n="analytics.sourceTitle">Traffic-Quellen</span></h3>
                    <p class="social-source-subtitle"><span data-i18n="dash.last30">Letzte 30 Tage</span></p></div>
                </div>
                <div class="card-body">
                    <div class="donut-container"><canvas id="socialChart"></canvas>
                        <div class="donut-center"><div class="donut-center-label"><span data-i18n="web.sessions">Sitzungen</span></div><div class="donut-center-value" id="dash-donut-value">—</div></div>
                    </div>
                    <div class="social-buyers"><i class="fas fa-users"></i> <span data-i18n="dash.visitorsToday">Besucher heute</span> : <strong id="dash-today">—</strong></div>
                    <div class="social-actions">
                        <button class="social-btn" onclick="showPage('visits')"><span data-i18n="dash.toVisits">Quellen ansehen</span></button>
                        <button class="social-btn primary" onclick="showPage('website')"><span data-i18n="dash.toWebsite">Zur Webseite</span></button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><span data-i18n="analytics.mapTitle">Follower-Verteilung in Deutschland</span></h3>
                    <button class="card-dropdown" onclick="showPage('map')"><span data-i18n="common.viewMore">Mehr anzeigen</span> <i class="fas fa-chevron-right" style="font-size:10px;"></i></button>
                </div>
                <div class="card-body"><div id="dash-cities"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="dash.tipTitle">Empfehlung aus deinen Daten</span></h3></div>
                <div class="card-body">
                    <img src="https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=200&fit=crop" alt="AI Insight" class="weekly-sales-img">
                    <div class="weekly-sales-info">
                        <h4><span data-i18n="dash.bestDay">Bester Wochentag zum Posten</span></h4>
                        <p><span data-i18n="dash.bestDayText">Basierend auf den Interaktionen deiner bisherigen Beiträge</span></p>
                        <div class="weekly-sales-price" id="dash-bestday">—</div>
                        <div class="weekly-sales-meta" id="dash-bestday-meta"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-social" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.social">Social Media</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.social.bc">Social Media</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="social.subtitle">Überblick über deine Social-Media-Konten</span></p>
        <div class="stats-grid stats-grid-3" id="social-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="social.title">Follower-Wachstum nach Plattform</span></h3></div>
                <div class="card-body"><div class="chart-container" style="height:320px;"><canvas id="chart_social"></canvas></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="soc.platforms">Plattformen im Überblick</span></h3></div>
                <div class="card-body"><div id="social-platforms"></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-website" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.website">Webseite</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.website.bc">Webseite</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="website.subtitle">Verkehr und Verhalten auf deiner Webseite</span></p>
        <div class="sp-period-bar"><select class="sp-input sp-period"></select></div>
        <div class="sp-banner" id="website-banner" hidden></div>
        <div class="stats-grid stats-grid-3" id="website-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="web.chartTitle">Besucher &amp; Seitenaufrufe</span></h3></div>
                <div class="card-body"><div class="chart-container" style="height:320px;"><canvas id="chart_website"></canvas></div></div>
            </div>
            <div class="sp-grid-2">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="web.topPages">Meistbesuchte Seiten</span></h3></div>
                <div class="card-body"><div id="website-pages"></div></div>
            </div>
            <div class="card" id="tracking-card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="web.snippetTitle">Tracking-Code</span></h3></div>
                <div class="card-body"><div id="website-snippet"></div></div>
            </div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-reviews" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.reviews">Google Bewertungen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.reviews.bc">Google Bewertungen</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="reviews.subtitle">Deine Google-Bewertungen auf einen Blick</span></p>
        <div class="stats-grid stats-grid-3" id="reviews-stats"></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><span data-i18n="reviews.title">Neueste Bewertungen</span></h3></div>
            <div class="card-body"><div id="reviews-crud"></div></div>
        </div>
    </div>
<div class="page-section" id="page-audience" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.audience">Zielgruppe</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.audience.bc">Zielgruppe</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="audience.subtitle">Wer folgt und interagiert mit dir</span></p>
        <div class="stats-grid stats-grid-3" id="audience-stats"></div>
        <div class="sp-stack">
            <div class="sp-grid-2">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="audience.title">Altersgruppen der Follower</span></h3></div>
                <div class="card-body"><div class="donut-container" style="height:220px;"><canvas id="chart_audience"></canvas></div><div class="legend-list" id="audience-legend"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="aud.formTitle">Zielgruppendaten pflegen</span></h3></div>
                <div class="card-body"><div id="audience-form"></div></div>
            </div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-campaigns" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.campaigns">Kampagnen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.campaigns.bc">Kampagnen</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="campaigns.subtitle">Aktive und geplante Kampagnen</span></p>
        <div class="stats-grid stats-grid-3" id="campaigns-stats"></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><span data-i18n="campaigns.title">Kampagnenübersicht</span></h3></div>
            <div class="card-body"><div id="campaigns-crud"></div></div>
        </div>
    </div>
<div class="page-section" id="page-landing" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.landing">Landingpage</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.landing.bc">Landingpage</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="landing.subtitle">Leistung deiner Landingpage</span></p>
        <div class="sp-period-bar"><select class="sp-input sp-period"></select></div>
        <div class="sp-banner" id="landing-banner" hidden></div>
        <div class="stats-grid stats-grid-3" id="landing-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="web.lpTitle">Landingpages festlegen</span></h3></div>
                <div class="card-body"><div id="landing-config"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="landing.title">Besuche vs. Conversions</span></h3></div>
                <div class="card-body"><div class="chart-container" style="height:300px;"><canvas id="chart_landing"></canvas></div></div>
            </div>
            <div class="sp-grid-2">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="web.lpPages">Landingpages im Detail</span></h3></div>
                <div class="card-body"><div id="landing-pages"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="web.goals">Conversions nach Ziel</span></h3></div>
                <div class="card-body"><div id="landing-goals"></div></div>
            </div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-linked" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.linked">Verknüpfte Konten</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.linked.bc">Verknüpfte Konten</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="linked.subtitle">Deine verknüpften Plattformen</span></p>
        <div class="stats-grid stats-grid-3" id="linked-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="linked.title">Verknüpfte Konten</span></h3></div>
                <div class="card-body"><div id="linked-list"></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-adcampaigns" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.adcampaigns">Werbekampagnen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.adcampaigns.bc">Werbekampagnen</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="adcampaigns.subtitle">Bezahlte Werbeanzeigen im Überblick</span></p>
        <div class="stats-grid stats-grid-3" id="adcampaigns-stats"></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><span data-i18n="adcampaigns.title">Aktive Werbeanzeigen</span></h3></div>
            <div class="card-body"><div id="adcampaigns-crud"></div></div>
        </div>
    </div>
<div class="page-section" id="page-followers" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.followers">Follower</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.followers.bc">Follower</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="followers.subtitle">Follower-Entwicklung im Detail</span></p>
        <div class="stats-grid stats-grid-3" id="followers-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="fol.chartTitle">Neue Follower vs. Entfolgt pro Monat</span></h3></div>
                <div class="card-body"><div class="chart-container" style="height:300px;"><canvas id="chart_followers"></canvas></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="fol.history">Erfasste Follower-Stände</span></h3></div>
                <div class="card-body"><div id="followers-crud"></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-engagement" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.engagement">Interaktionen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.engagement.bc">Interaktionen</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="engagement.subtitle">Wie deine Follower reagieren</span></p>
        <div class="stats-grid stats-grid-3" id="engagement-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="engagement.title">Interaktionen pro Woche</span></h3></div>
                <div class="card-body"><div class="chart-container" style="height:300px;"><canvas id="chart_engagement"></canvas></div></div>
            </div>
            <div class="sp-grid-2">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="eng.topPosts">Stärkste Beiträge</span></h3></div>
                <div class="card-body"><div id="engagement-top"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="eng.byPlatform">Interaktionen nach Plattform</span></h3></div>
                <div class="card-body"><div id="engagement-platforms"></div></div>
            </div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-visits" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.visits">Besuche</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.visits.bc">Besuche</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="visits.subtitle">Woher deine Besucher kommen</span></p>
        <div class="sp-period-bar"><select class="sp-input sp-period"></select></div>
        <div class="sp-banner" id="visits-banner" hidden></div>
        <div class="stats-grid stats-grid-3" id="visits-stats"></div>
        <div class="sp-stack">
            <div class="sp-grid-2">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="visits.title">Traffic-Quellen</span></h3></div>
                <div class="card-body"><div class="donut-container" style="height:220px;"><canvas id="chart_visits"></canvas></div><div class="legend-list" id="visits-legend"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="web.referrers">Verweisende Webseiten</span></h3></div>
                <div class="card-body"><div id="visits-referrers"></div></div>
            </div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-messages" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.messages">Nachrichten</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.messages.bc">Nachrichten</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="messages.subtitle">Direktnachrichten von deinen Followern</span></p>
        <div class="stats-grid stats-grid-3" id="messages-stats"></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><span data-i18n="messages.title">Letzte Nachrichten</span></h3></div>
            <div class="card-body"><div id="messages-crud"></div></div>
        </div>
    </div>
<div class="page-section" id="page-inbox" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.inbox">Posteingang</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.inbox.bc">Posteingang</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="inbox.subtitle">Kommentare und Erwähnungen</span></p>
        <div class="stats-grid stats-grid-3" id="inbox-stats"></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><span data-i18n="inbox.title">Posteingang</span></h3></div>
            <div class="card-body"><div id="inbox-crud"></div></div>
        </div>
    </div>
<div class="page-section" id="page-posts" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.posts">Beiträge</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.posts.bc">Beiträge</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="posts.subtitle">Leistung deiner letzten Beiträge</span></p>
        <div class="stats-grid stats-grid-3" id="posts-stats"></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><span data-i18n="tables.title">Alle Beiträge</span></h3></div>
            <div class="card-body"><div id="posts-crud"></div></div>
        </div>
    </div>
<div class="page-section" id="page-reports" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.reports">Berichte</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.reports.bc">Berichte</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="reports.subtitle">Deine automatisch erstellten Berichte</span></p>
        <div class="stats-grid stats-grid-3" id="reports-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="rep.monthly">Monatsberichte</span></h3></div>
                <div class="card-body"><div id="reports-list"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="rep.export">Daten exportieren (CSV)</span></h3></div>
                <div class="card-body"><div id="reports-export"></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-settings" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.settings">Einstellungen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.settings.bc">Einstellungen</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="settings.subtitle">Konto- und Benachrichtigungseinstellungen</span></p>

        <div class="stats-grid stats-grid-3">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user"></i></div>
                <div class="stat-info">
                    <div class="stat-label"><span data-i18n="settings.stat0.label">Kontoinhaber</span></div>
                    <div class="stat-value" id="stClientName">—</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-bell"></i></div>
                <div class="stat-info">
                    <div class="stat-label"><span data-i18n="settings.stat1.label">Benachrichtigungen</span></div>
                    <div class="stat-value" id="stNotif">—</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-globe-europe"></i></div>
                <div class="stat-info">
                    <div class="stat-label"><span data-i18n="settings.stat2.label">Sprache</span></div>
                    <div class="stat-value" id="stLang">—</div>
                </div>
            </div>
        </div>

        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="settings.clientTitle">Kundendaten</span></h3></div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="setName"><span data-i18n="settings.f.name">Kundenname / Firma</span></label>
                            <input type="text" id="setName" class="sp-input" maxlength="120" autocomplete="organization">
                        </div>
                        <div class="form-group">
                            <label for="setPhone"><span data-i18n="settings.f.phone">Telefon</span></label>
                            <input type="tel" id="setPhone" class="sp-input" maxlength="25" autocomplete="tel">
                        </div>
                        <div class="form-group">
                            <label for="setHandover"><span data-i18n="settings.f.handover">Übergabedatum</span></label>
                            <input type="text" id="setHandover" class="sp-input" readonly>
                        </div>
                        <div class="form-group">
                            <label for="setUser"><span data-i18n="settings.f.user">Benutzername</span></label>
                            <input type="text" id="setUser" class="sp-input" readonly>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="settings.linksTitle">Webseite &amp; Social Media</span></h3></div>
                <div class="card-body"><div class="form-grid" id="linksFields"></div></div>
            </div>

            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="settings.title">Kontoeinstellungen</span></h3></div>
                <div class="card-body">
                    <label class="sp-toggle"><span data-i18n="settings.field1">E-Mail-Benachrichtigungen</span><input type="checkbox" id="prefEmail"></label>
                    <label class="sp-toggle"><span data-i18n="settings.field2">Automatische Berichte</span><input type="checkbox" id="prefReports"></label>
                    <label class="sp-toggle"><span data-i18n="settings.field3">KI-Empfehlungen aktivieren</span><input type="checkbox" id="prefAi"></label>
                </div>
            </div>

            <div class="sp-actions" style="margin-top:0;">
                <button type="button" class="balance-btn send" id="btnSaveSettings"><span data-i18n="common.save">Speichern</span></button>
            </div>

            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="settings.pwTitle">Passwort ändern</span></h3></div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="pwCurrent"><span data-i18n="settings.pw.current">Aktuelles Passwort</span></label>
                            <input type="password" id="pwCurrent" class="sp-input" autocomplete="current-password">
                        </div>
                        <div class="form-group"></div>
                        <div class="form-group">
                            <label for="pwNew"><span data-i18n="settings.pw.new">Neues Passwort (min. 8 Zeichen)</span></label>
                            <input type="password" id="pwNew" class="sp-input" autocomplete="new-password">
                        </div>
                        <div class="form-group">
                            <label for="pwConfirm"><span data-i18n="settings.pw.confirm">Neues Passwort wiederholen</span></label>
                            <input type="password" id="pwConfirm" class="sp-input" autocomplete="new-password">
                        </div>
                    </div>
                    <div class="sp-actions">
                        <button type="button" class="balance-btn send" id="btnChangePw"><span data-i18n="settings.pw.btn">Passwort ändern</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-aitools" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.aitools">KI-Tools</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.aitools.bc">KI-Tools</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="aitools.subtitle">Intelligente Empfehlungen für dein Wachstum</span></p>
        <div class="stats-grid stats-grid-3" id="aitools-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="ai.recTitle">Empfehlungen aus deinen Daten</span></h3></div>
                <div class="card-body"><div id="aitools-recs"></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="ai.genTitle">KI-Textgenerator für Beiträge</span></h3></div>
                <div class="card-body"><div id="aitools-gen"></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-templates" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.templates">Content-Vorlagen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.templates.bc">Content-Vorlagen</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="templates.subtitle">Fertige Vorlagen für deine Beiträge</span></p>
        <div class="stats-grid stats-grid-3" id="templates-stats"></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><span data-i18n="templates.title">Content-Vorlagen</span></h3></div>
            <div class="card-body"><div id="templates-crud"></div></div>
        </div>
    </div>
<div class="page-section" id="page-baseaccounts" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.baseaccounts">Basiskonten</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.baseaccounts.bc">Basiskonten</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="baseaccounts.subtitle">Deine primären Unternehmensprofile</span></p>
        <div class="stats-grid stats-grid-3" id="baseaccounts-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="baseaccounts.title">Basiskonten</span></h3></div>
                <div class="card-body"><div id="baseaccounts-list"></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-advanced" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.advanced">Erweiterte Analysen</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.advanced.bc">Erweiterte Analysen</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="advanced.subtitle">Tiefergehende Kennzahlen für Profis</span></p>
        <div class="stats-grid stats-grid-3" id="advanced-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="adv.chart">Reichweite vs. Interaktionen (12 Monate)</span></h3></div>
                <div class="card-body"><div class="chart-container" style="height:320px;"><canvas id="chart_advanced"></canvas></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-charts" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.charts">Diagramme</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.charts.bc">Diagramme</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="charts.subtitle">Alle wichtigen Diagramme im Überblick</span></p>
        <div class="stats-grid stats-grid-3" id="charts-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="cmp.chart">Follower &amp; Interaktionen (90 Tage) je Plattform</span></h3></div>
                <div class="card-body"><div class="chart-container" style="height:320px;"><canvas id="chart_charts"></canvas></div></div>
            </div>
        </div>
    </div>
<div class="page-section" id="page-map" style="display:none;">
        <div class="page-header">
            <div class="page-title"><h2><span data-i18n="nav.map">Verteilungskarte</span></h2></div>
            <div class="breadcrumb">
                <a href="#" onclick="showPage('analytics');return false;"><span data-i18n="common.breadcrumbHome">Dashboard</span></a>
                <i class="fas fa-chevron-right"></i>
                <span><span data-i18n="nav.map.bc">Verteilungskarte</span></span>
            </div>
        </div>
        <p class="page-subtitle"><span data-i18n="map.subtitle">Wo deine Follower in Deutschland leben</span></p>
        <div class="stats-grid stats-grid-3" id="map-stats"></div>
        <div class="sp-stack">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><span data-i18n="map.title">Verteilung in Deutschland</span></h3></div>
                <div class="card-body"><div id="map-cities"></div></div>
            </div>
        </div>
    </div>
        </div>
    </main>

    <script>
        const TRANSLATIONS = {"navgroup.MENU": {"de": "MENÜ", "en": "MENU", "fr": "MENU", "ar": "القائمة"}, "nav.analytics": {"de": "Analysen", "en": "Analytics", "fr": "Analytique", "ar": "التحليلات"}, "nav.social": {"de": "Social Media", "en": "Social Media", "fr": "Réseaux sociaux", "ar": "السوشيال ميديا"}, "nav.website": {"de": "Webseite", "en": "Website", "fr": "Site web", "ar": "الموقع الإلكتروني"}, "nav.reviews": {"de": "Google Bewertungen", "en": "Google Reviews", "fr": "Avis Google", "ar": "تقييمات غوغل"}, "nav.audience": {"de": "Zielgruppe", "en": "Audience", "fr": "Audience", "ar": "الجمهور"}, "nav.campaigns": {"de": "Kampagnen", "en": "Campaigns", "fr": "Campagnes", "ar": "الحملات"}, "nav.landing": {"de": "Landingpage", "en": "Landing Page", "fr": "Page de destination", "ar": "صفحة الهبوط"}, "nav.linked": {"de": "Verknüpfte Konten", "en": "Linked Accounts", "fr": "Comptes liés", "ar": "الحسابات المرتبطة"}, "nav.adcampaigns": {"de": "Werbekampagnen", "en": "Ad Campaigns", "fr": "Campagnes publicitaires", "ar": "الحملات الإعلانية"}, "nav.followers": {"de": "Follower", "en": "Followers", "fr": "Abonnés", "ar": "المتابعون"}, "nav.engagement": {"de": "Interaktionen", "en": "Engagement", "fr": "Interactions", "ar": "التفاعلات"}, "nav.visits": {"de": "Besuche", "en": "Visits", "fr": "Visites", "ar": "الزيارات"}, "nav.messages": {"de": "Nachrichten", "en": "Messages", "fr": "Messages", "ar": "الرسائل"}, "nav.inbox": {"de": "Posteingang", "en": "Inbox", "fr": "Boîte de réception", "ar": "صندوق الوارد"}, "nav.posts": {"de": "Beiträge", "en": "Posts", "fr": "Publications", "ar": "المنشورات"}, "navgroup.CUSTOM": {"de": "BENUTZERDEFINIERT", "en": "CUSTOM", "fr": "PERSONNALISÉ", "ar": "مخصص"}, "nav.reports": {"de": "Berichte", "en": "Reports", "fr": "Rapports", "ar": "التقارير"}, "nav.settings": {"de": "Einstellungen", "en": "Settings", "fr": "Paramètres", "ar": "الإعدادات"}, "nav.aitools": {"de": "KI-Tools", "en": "AI Tools", "fr": "Outils IA", "ar": "أدوات الذكاء الصناعي"}, "nav.templates": {"de": "Content-Vorlagen", "en": "Content Templates", "fr": "Modèles de contenu", "ar": "قوالب المحتوى"}, "navgroup.COMPONENTS": {"de": "KOMPONENTEN", "en": "COMPONENTS", "fr": "COMPOSANTS", "ar": "مكونات"}, "nav.baseaccounts": {"de": "Basiskonten", "en": "Base Accounts", "fr": "Comptes de base", "ar": "الحسابات الأساسية"}, "nav.advanced": {"de": "Erweiterte Analysen", "en": "Advanced Analytics", "fr": "Analyses avancées", "ar": "تحليلات متقدمة"}, "nav.charts": {"de": "Diagramme", "en": "Charts", "fr": "Graphiques", "ar": "الرسوم البيانية"}, "nav.forms": {"de": "Formulare", "en": "Forms", "fr": "Formulaires", "ar": "النماذج"}, "nav.tables": {"de": "Tabellen", "en": "Tables", "fr": "Tableaux", "ar": "الجداول"}, "nav.icons": {"de": "Plattform-Icons", "en": "Platform Icons", "fr": "Icônes de plateforme", "ar": "الأيقونات"}, "nav.map": {"de": "Verteilungskarte", "en": "Distribution Map", "fr": "Carte de répartition", "ar": "خريطة التوزع"},
            "social.d1": {"de": "Instagram", "en": "Instagram", "fr": "Instagram", "ar": "انستغرام"}, "social.d2": {"de": "Facebook", "en": "Facebook", "fr": "Facebook", "ar": "فيسبوك"}, "social.title": {"de": "Follower-Wachstum nach Plattform", "en": "Follower Growth by Platform", "fr": "Croissance des abonnés par plateforme", "ar": "نمو المتابعين حسب المنصة"}, "social.stat0.label": {"de": "Instagram Follower", "en": "Instagram Followers", "fr": "Abonnés Instagram", "ar": "متابعون انستغرام"}, "social.stat1.label": {"de": "Facebook Follower", "en": "Facebook Followers", "fr": "Abonnés Facebook", "ar": "متابعون فيسبوك"}, "social.stat2.label": {"de": "Wachstumsrate", "en": "Growth Rate", "fr": "Taux de croissance", "ar": "معدل النمو"}, "common.breadcrumbHome": {"de": "Dashboard", "en": "Dashboard", "fr": "Tableau de bord", "ar": "لوحة التحكم"}, "nav.social.bc": {"de": "Social Media", "en": "Social Media", "fr": "Réseaux sociaux", "ar": "السوشيال ميديا"}, "social.subtitle": {"de": "Überblick über deine Social-Media-Konten", "en": "Overview of your social media accounts", "fr": "Aperçu de vos comptes de réseaux sociaux", "ar": "نظرة عامة على حسابات السوشيال ميديا"},
            "website.d1": {"de": "Besucher", "en": "Visitors", "fr": "Visiteurs", "ar": "الزوار"}, "website.d2": {"de": "Seitenaufrufe", "en": "Page Views", "fr": "Pages vues", "ar": "مشاهدات الصفحة"}, "website.title": {"de": "Besucher pro Monat", "en": "Visitors per Month", "fr": "Visiteurs par mois", "ar": "الزوار شهرياً"}, "website.stat0.label": {"de": "Besucher", "en": "Visitors", "fr": "Visiteurs", "ar": "الزوار"}, "website.stat1.label": {"de": "Absprungrate", "en": "Bounce Rate", "fr": "Taux de rebond", "ar": "معدل الارتداد"}, "website.stat2.label": {"de": "Verweildauer", "en": "Avg. Time on Page", "fr": "Temps moyen", "ar": "متوسط مدة الزيارة"}, "nav.website.bc": {"de": "Webseite", "en": "Website", "fr": "Site web", "ar": "الموقع الإلكتروني"}, "website.subtitle": {"de": "Verkehr und Verhalten auf deiner Webseite", "en": "Traffic and behavior on your website", "fr": "Trafic et comportement sur votre site", "ar": "حركة وسلوك زوار موقعك"},
            "reviews.review0": {"de": "Sehr professioneller Service, schnelle Antwort.", "en": "Very professional service, fast response.", "fr": "Service très professionnel, réponse rapide.", "ar": "خدمة احترافية جداً وردّ سريع."}, "reviews.review1": {"de": "Top Qualität und freundliches Team.", "en": "Top quality and a friendly team.", "fr": "Excellente qualité, équipe sympathique.", "ar": "جودة ممتازة وفريق لطيف."}, "reviews.review2": {"de": "Gute Erfahrung, würde wieder buchen.", "en": "Good experience, would book again.", "fr": "Bonne expérience, je reviendrai.", "ar": "تجربة جيدة وبرجع اتعامل معهم."}, "reviews.title": {"de": "Neueste Bewertungen", "en": "Latest Reviews", "fr": "Derniers avis", "ar": "أحدث المراجعات"}, "reviews.stat0.label": {"de": "Bewertung", "en": "Rating", "fr": "Note", "ar": "التقييم"}, "reviews.stat1.label": {"de": "Anzahl Bewertungen", "en": "Number of Reviews", "fr": "Nombre d'avis", "ar": "عدد المراجعات"}, "reviews.stat2.label": {"de": "Antwortrate", "en": "Reply Rate", "fr": "Taux de réponse", "ar": "نسبة الردود"}, "nav.reviews.bc": {"de": "Google Bewertungen", "en": "Google Reviews", "fr": "Avis Google", "ar": "تقييمات غوغل"}, "reviews.subtitle": {"de": "Deine Google-Bewertungen auf einen Blick", "en": "Your Google reviews at a glance", "fr": "Vos avis Google en un coup d'œil", "ar": "تقييماتك على غوغل بلمحة"},
            "audience.cat0": {"de": "18-24", "en": "18-24", "fr": "18-24", "ar": "18-24"}, "audience.cat1": {"de": "25-34", "en": "25-34", "fr": "25-34", "ar": "25-34"}, "audience.cat2": {"de": "35-44", "en": "35-44", "fr": "35-44", "ar": "35-44"}, "audience.cat3": {"de": "45+", "en": "45+", "fr": "45+", "ar": "45+"}, "audience.title": {"de": "Altersgruppen der Follower", "en": "Follower Age Groups", "fr": "Tranches d'âge des abonnés", "ar": "الفئات العمرية للمتابعين"}, "audience.stat0.label": {"de": "Aktivste Altersgruppe", "en": "Most Active Age Group", "fr": "Tranche d'âge la plus active", "ar": "الفئة العمرية الأكثر تفاعلاً"}, "audience.stat1.label": {"de": "Geschlechterverteilung", "en": "Gender Split", "fr": "Répartition par genre", "ar": "توزع الجنس"}, "audience.stat2.label": {"de": "Top Stadt", "en": "Top City", "fr": "Ville principale", "ar": "المدينة الأكثر تفاعلاً"}, "nav.audience.bc": {"de": "Zielgruppe", "en": "Audience", "fr": "Audience", "ar": "الجمهور"}, "audience.subtitle": {"de": "Wer folgt und interagiert mit dir", "en": "Who follows and engages with you", "fr": "Qui vous suit et interagit avec vous", "ar": "مين عم يتابعك ويتفاعل معك"},
            "campaigns.camp0": {"de": "Sommeraktion Instagram", "en": "Summer Promo Instagram", "fr": "Promo été Instagram", "ar": "عرض الصيف - انستغرام"}, "campaigns.camp0.status": {"de": "Aktiv", "en": "Active", "fr": "Actif", "ar": "نشط"}, "campaigns.camp1": {"de": "Google Local Ads", "en": "Google Local Ads", "fr": "Google Local Ads", "ar": "إعلانات غوغل المحلية"}, "campaigns.camp1.status": {"de": "Aktiv", "en": "Active", "fr": "Actif", "ar": "نشط"}, "campaigns.camp2": {"de": "Facebook Neukunden", "en": "Facebook New Customers", "fr": "Facebook nouveaux clients", "ar": "فيسبوك - عملاء جدد"}, "campaigns.camp2.status": {"de": "Pausiert", "en": "Paused", "fr": "En pause", "ar": "متوقف"}, "campaigns.title": {"de": "Kampagnenübersicht", "en": "Campaign Overview", "fr": "Aperçu des campagnes", "ar": "نظرة عامة على الحملات"}, "campaigns.stat0.label": {"de": "Aktive Kampagnen", "en": "Active Campaigns", "fr": "Campagnes actives", "ar": "حملات نشطة"}, "campaigns.stat1.label": {"de": "Verwendetes Budget", "en": "Budget Used", "fr": "Budget utilisé", "ar": "الميزانية المستخدمة"}, "campaigns.stat2.label": {"de": "Klickrate", "en": "Click Rate", "fr": "Taux de clic", "ar": "معدل النقر"}, "nav.campaigns.bc": {"de": "Kampagnen", "en": "Campaigns", "fr": "Campagnes", "ar": "الحملات"}, "campaigns.subtitle": {"de": "Aktive und geplante Kampagnen", "en": "Active and scheduled campaigns", "fr": "Campagnes actives et planifiées", "ar": "الحملات النشطة والمجدولة"},
            "landing.d1": {"de": "Besuche", "en": "Visits", "fr": "Visites", "ar": "الزيارات"}, "landing.d2": {"de": "Conversions", "en": "Conversions", "fr": "Conversions", "ar": "التحويلات"}, "landing.title": {"de": "Besuche vs. Conversions", "en": "Visits vs. Conversions", "fr": "Visites vs conversions", "ar": "الزيارات مقابل التحويلات"}, "landing.stat0.label": {"de": "Seitenbesuche", "en": "Page Visits", "fr": "Visites de la page", "ar": "زيارات الصفحة"}, "landing.stat1.label": {"de": "Konversionsrate", "en": "Conversion Rate", "fr": "Taux de conversion", "ar": "معدل التحويل"}, "landing.stat2.label": {"de": "Ausgefüllte Formulare", "en": "Form Submissions", "fr": "Formulaires soumis", "ar": "نماذج معبأة"}, "nav.landing.bc": {"de": "Landingpage", "en": "Landing Page", "fr": "Page de destination", "ar": "صفحة الهبوط"}, "landing.subtitle": {"de": "Leistung deiner Landingpage", "en": "Your landing page performance", "fr": "Performance de votre page de destination", "ar": "أداء صفحة الهبوط"},
            "linked.acc0.status": {"de": "Verbunden", "en": "Connected", "fr": "Connecté", "ar": "متصل"}, "linked.acc1.status": {"de": "Verbunden", "en": "Connected", "fr": "Connecté", "ar": "متصل"}, "linked.acc2.status": {"de": "Verbunden", "en": "Connected", "fr": "Connecté", "ar": "متصل"}, "linked.acc3.status": {"de": "Nicht verbunden", "en": "Not Connected", "fr": "Non connecté", "ar": "غير متصل"}, "linked.title": {"de": "Verknüpfte Konten", "en": "Linked Accounts", "fr": "Comptes liés", "ar": "الحسابات المرتبطة"}, "linked.stat0.label": {"de": "Verbundene Konten", "en": "Connected Accounts", "fr": "Comptes connectés", "ar": "الحسابات المتصلة"}, "linked.stat1.label": {"de": "Letzte Synchronisierung", "en": "Last Sync", "fr": "Dernière synchro", "ar": "آخر مزامنة"}, "linked.stat2.label": {"de": "Sicherheitsstatus", "en": "Security Status", "fr": "État de sécurité", "ar": "حالة الأمان"}, "nav.linked.bc": {"de": "Verknüpfte Konten", "en": "Linked Accounts", "fr": "Comptes liés", "ar": "الحسابات المرتبطة"}, "linked.subtitle": {"de": "Deine verknüpften Plattformen", "en": "Your linked platforms", "fr": "Vos plateformes liées", "ar": "المنصات المرتبطة بحسابك"},
            "adcampaigns.camp0": {"de": "Instagram Story Ads", "en": "Instagram Story Ads", "fr": "Pub Story Instagram", "ar": "إعلانات ستوري انستغرام"}, "adcampaigns.camp0.status": {"de": "Aktiv", "en": "Active", "fr": "Actif", "ar": "نشط"}, "adcampaigns.camp1": {"de": "Facebook Feed Ads", "en": "Facebook Feed Ads", "fr": "Pub Fil Facebook", "ar": "إعلانات فيسبوك"}, "adcampaigns.camp1.status": {"de": "Aktiv", "en": "Active", "fr": "Actif", "ar": "نشط"}, "adcampaigns.camp2": {"de": "Google Suchanzeigen", "en": "Google Search Ads", "fr": "Annonces Google", "ar": "إعلانات غوغل البحثية"}, "adcampaigns.camp2.status": {"de": "Aktiv", "en": "Active", "fr": "Actif", "ar": "نشط"}, "adcampaigns.title": {"de": "Aktive Werbeanzeigen", "en": "Active Ads", "fr": "Publicités actives", "ar": "الإعلانات النشطة"}, "adcampaigns.stat0.label": {"de": "Impressionen", "en": "Impressions", "fr": "Impressions", "ar": "مرات الظهور"}, "adcampaigns.stat1.label": {"de": "Kosten pro Klick", "en": "Cost per Click", "fr": "Coût par clic", "ar": "تكلفة النقرة"}, "adcampaigns.stat2.label": {"de": "Werbeausgabenrendite", "en": "Return on Ad Spend", "fr": "ROAS", "ar": "عائد الإنفاق الإعلاني"}, "nav.adcampaigns.bc": {"de": "Werbekampagnen", "en": "Ad Campaigns", "fr": "Campagnes publicitaires", "ar": "الحملات الإعلانية"}, "adcampaigns.subtitle": {"de": "Bezahlte Werbeanzeigen im Überblick", "en": "Overview of your paid ads", "fr": "Aperçu de vos publicités payantes", "ar": "نظرة عامة على الإعلانات المدفوعة"},
            "followers.d1": {"de": "Instagram", "en": "Instagram", "fr": "Instagram", "ar": "انستغرام"}, "followers.d2": {"de": "Facebook", "en": "Facebook", "fr": "Facebook", "ar": "فيسبوك"}, "followers.title": {"de": "Follower je Plattform", "en": "Followers per Platform", "fr": "Abonnés par plateforme", "ar": "المتابعون حسب المنصة"}, "followers.stat0.label": {"de": "Neue Follower", "en": "New Followers", "fr": "Nouveaux abonnés", "ar": "متابعون جدد"}, "followers.stat1.label": {"de": "Entfolgt", "en": "Unfollows", "fr": "Désabonnements", "ar": "إلغاء متابعة"}, "followers.stat2.label": {"de": "Wachstumsrate", "en": "Growth Rate", "fr": "Taux de croissance", "ar": "معدل النمو"}, "nav.followers.bc": {"de": "Follower", "en": "Followers", "fr": "Abonnés", "ar": "المتابعون"}, "followers.subtitle": {"de": "Follower-Entwicklung im Detail", "en": "Follower development in detail", "fr": "Évolution détaillée des abonnés", "ar": "تطور عدد المتابعين بالتفصيل"},
            "engagement.d1": {"de": "Gefällt mir", "en": "Likes", "fr": "J'aime", "ar": "الإعجابات"}, "engagement.d2": {"de": "Kommentare", "en": "Comments", "fr": "Commentaires", "ar": "التعليقات"}, "engagement.title": {"de": "Interaktionen pro Woche", "en": "Engagement per Week", "fr": "Interactions par semaine", "ar": "التفاعل أسبوعياً"}, "engagement.stat0.label": {"de": "Gefällt mir", "en": "Likes", "fr": "J'aime", "ar": "الإعجابات"}, "engagement.stat1.label": {"de": "Kommentare", "en": "Comments", "fr": "Commentaires", "ar": "التعليقات"}, "engagement.stat2.label": {"de": "Geteilt", "en": "Shares", "fr": "Partages", "ar": "المشاركات"}, "nav.engagement.bc": {"de": "Interaktionen", "en": "Engagement", "fr": "Interactions", "ar": "التفاعلات"}, "engagement.subtitle": {"de": "Wie deine Follower reagieren", "en": "How your followers react", "fr": "Comment vos abonnés réagissent", "ar": "كيف يتفاعل متابعوك"},
            "visits.cat0": {"de": "Direkt", "en": "Direct", "fr": "Direct", "ar": "مباشر"}, "visits.cat1": {"de": "Instagram", "en": "Instagram", "fr": "Instagram", "ar": "انستغرام"}, "visits.cat2": {"de": "Facebook", "en": "Facebook", "fr": "Facebook", "ar": "فيسبوك"}, "visits.cat3": {"de": "Google", "en": "Google", "fr": "Google", "ar": "غوغل"}, "visits.title": {"de": "Traffic-Quellen", "en": "Traffic Sources", "fr": "Sources de trafic", "ar": "مصادر الزيارات"}, "visits.stat0.label": {"de": "Besucher", "en": "Visitors", "fr": "Visiteurs", "ar": "الزوار"}, "visits.stat1.label": {"de": "Absprungrate", "en": "Bounce Rate", "fr": "Taux de rebond", "ar": "معدل الارتداد"}, "visits.stat2.label": {"de": "Verweildauer", "en": "Avg. Time on Page", "fr": "Temps moyen", "ar": "متوسط مدة الزيارة"}, "nav.visits.bc": {"de": "Besuche", "en": "Visits", "fr": "Visites", "ar": "الزيارات"}, "visits.subtitle": {"de": "Woher deine Besucher kommen", "en": "Where your visitors come from", "fr": "D'où viennent vos visiteurs", "ar": "من وين عم ييجو زوارك"},
            "messages.msg0": {"de": "Habt ihr noch Termine frei diese Woche?", "en": "Do you have any slots free this week?", "fr": "Avez-vous des créneaux cette semaine ?", "ar": "في مواعيد فاضية هالأسبوع؟"}, "messages.msg1": {"de": "Danke für die schnelle Antwort!", "en": "Thanks for the fast reply!", "fr": "Merci pour la réponse rapide !", "ar": "شكراً عالرد السريع!"}, "messages.msg2": {"de": "Neue Anfrage über 'Route planen' erhalten.", "en": "New request received via 'Get Directions'.", "fr": "Nouvelle demande via « Itinéraire ».", "ar": "وصل طلب جديد عبر خرائط غوغل."}, "messages.title": {"de": "Letzte Nachrichten", "en": "Recent Messages", "fr": "Messages récents", "ar": "أحدث الرسائل"}, "messages.stat0.label": {"de": "Ungelesen", "en": "Unread", "fr": "Non lus", "ar": "غير مقروءة"}, "messages.stat1.label": {"de": "Antwortrate", "en": "Reply Rate", "fr": "Taux de réponse", "ar": "نسبة الردود"}, "messages.stat2.label": {"de": "Ø Antwortzeit", "en": "Avg. Response Time", "fr": "Temps de réponse moyen", "ar": "متوسط وقت الرد"}, "nav.messages.bc": {"de": "Nachrichten", "en": "Messages", "fr": "Messages", "ar": "الرسائل"}, "messages.subtitle": {"de": "Direktnachrichten von deinen Followern", "en": "Direct messages from your followers", "fr": "Messages privés de vos abonnés", "ar": "الرسائل الخاصة من متابعينك"},
            "inbox.msg0": {"de": "Tolles Angebot, wo kann ich buchen?", "en": "Great offer, where can I book?", "fr": "Super offre, où puis-je réserver ?", "ar": "عرض حلو، من وين احجز؟"}, "inbox.msg1": {"de": "Wurde markiert in einem Beitrag.", "en": "Was tagged in a post.", "fr": "A été mentionné dans une publication.", "ar": "تم الإشارة إليك بمنشور."}, "inbox.msg2": {"de": "Neue Bewertung erhalten (5 Sterne).", "en": "New review received (5 stars).", "fr": "Nouvel avis reçu (5 étoiles).", "ar": "وصل تقييم جديد (5 نجوم)."}, "inbox.title": {"de": "Posteingang", "en": "Inbox", "fr": "Boîte de réception", "ar": "صندوق الوارد"}, "inbox.stat0.label": {"de": "Neue Kommentare", "en": "New Comments", "fr": "Nouveaux commentaires", "ar": "تعليقات جديدة"}, "inbox.stat1.label": {"de": "Erwähnungen", "en": "Mentions", "fr": "Mentions", "ar": "الإشارات"}, "inbox.stat2.label": {"de": "Zu prüfen", "en": "Needs Review", "fr": "À vérifier", "ar": "بحاجة لمراجعة"}, "nav.inbox.bc": {"de": "Posteingang", "en": "Inbox", "fr": "Boîte de réception", "ar": "صندوق الوارد"}, "inbox.subtitle": {"de": "Kommentare und Erwähnungen", "en": "Comments and mentions", "fr": "Commentaires et mentions", "ar": "التعليقات والإشارات"},
            "posts.h.date": {"de": "Datum", "en": "Date", "fr": "Date", "ar": "التاريخ"}, "posts.h.platform": {"de": "Plattform", "en": "Platform", "fr": "Plateforme", "ar": "المنصة"}, "posts.h.likes": {"de": "Gefällt mir", "en": "Likes", "fr": "J'aime", "ar": "الإعجابات"}, "posts.h.comments": {"de": "Kommentare", "en": "Comments", "fr": "Commentaires", "ar": "التعليقات"}, "posts.title": {"de": "Neueste Beiträge", "en": "Latest Posts", "fr": "Dernières publications", "ar": "أحدث المنشورات"}, "posts.stat0.label": {"de": "Beiträge diesen Monat", "en": "Posts This Month", "fr": "Publications ce mois", "ar": "منشورات هذا الشهر"}, "posts.stat1.label": {"de": "Ø Interaktionen", "en": "Avg. Engagement", "fr": "Interaction moyenne", "ar": "متوسط التفاعل"}, "posts.stat2.label": {"de": "Bester Beitrag", "en": "Top Post", "fr": "Meilleure publication", "ar": "أفضل منشور"}, "nav.posts.bc": {"de": "Beiträge", "en": "Posts", "fr": "Publications", "ar": "المنشورات"}, "posts.subtitle": {"de": "Leistung deiner letzten Beiträge", "en": "Performance of your recent posts", "fr": "Performance de vos dernières publications", "ar": "أداء آخر منشوراتك"},
            "reports.rep0": {"de": "Monatsbericht August", "en": "August Monthly Report", "fr": "Rapport mensuel Août", "ar": "تقرير شهر آب"}, "common.download": {"de": "Herunterladen", "en": "Download", "fr": "Télécharger", "ar": "تحميل"}, "reports.rep1": {"de": "Kampagnenbericht Q3", "en": "Q3 Campaign Report", "fr": "Rapport campagnes T3", "ar": "تقرير الحملات - الربع الثالث"}, "reports.rep2": {"de": "Google Bewertungen - Sommer", "en": "Google Reviews - Summer", "fr": "Avis Google - Été", "ar": "تقييمات غوغل - الصيف"}, "reports.title": {"de": "Verfügbare Berichte", "en": "Available Reports", "fr": "Rapports disponibles", "ar": "التقارير المتاحة"}, "reports.stat0.label": {"de": "Berichte insgesamt", "en": "Total Reports", "fr": "Rapports au total", "ar": "إجمالي التقارير"}, "reports.stat1.label": {"de": "Letzter Bericht", "en": "Last Report", "fr": "Dernier rapport", "ar": "آخر تقرير"}, "reports.stat2.label": {"de": "Downloads", "en": "Downloads", "fr": "Téléchargements", "ar": "التحميلات"}, "nav.reports.bc": {"de": "Berichte", "en": "Reports", "fr": "Rapports", "ar": "التقارير"}, "reports.subtitle": {"de": "Deine automatisch erstellten Berichte", "en": "Your automatically generated reports", "fr": "Vos rapports générés automatiquement", "ar": "تقاريرك المولّدة تلقائياً"},
            "settings.field0": {"de": "Unternehmensname", "en": "Business Name", "fr": "Nom de l'entreprise", "ar": "اسم النشاط"}, "settings.field1": {"de": "E-Mail-Benachrichtigungen", "en": "Email Notifications", "fr": "Notifications par e-mail", "ar": "إشعارات البريد الإلكتروني"}, "settings.field2": {"de": "Automatische Berichte", "en": "Automatic Reports", "fr": "Rapports automatiques", "ar": "تقارير تلقائية"}, "settings.field3": {"de": "KI-Empfehlungen aktivieren", "en": "Enable AI Recommendations", "fr": "Activer les recommandations IA", "ar": "تفعيل توصيات الذكاء الصناعي"}, "settings.title": {"de": "Kontoeinstellungen", "en": "Account Settings", "fr": "Paramètres du compte", "ar": "إعدادات الحساب"}, "common.save": {"de": "Speichern", "en": "Save", "fr": "Enregistrer", "ar": "حفظ"}, "settings.stat0.label": {"de": "Kontoinhaber", "en": "Account Owner", "fr": "Titulaire du compte", "ar": "صاحب الحساب"}, "settings.stat1.label": {"de": "Benachrichtigungen", "en": "Notifications", "fr": "Notifications", "ar": "الإشعارات"}, "settings.stat2.label": {"de": "Sprache", "en": "Language", "fr": "Langue", "ar": "اللغة"}, "nav.settings.bc": {"de": "Einstellungen", "en": "Settings", "fr": "Paramètres", "ar": "الإعدادات"}, "settings.subtitle": {"de": "Konto- und Benachrichtigungseinstellungen", "en": "Account and notification settings", "fr": "Paramètres du compte et des notifications", "ar": "إعدادات الحساب والإشعارات"},
            "aitools.card0.title": {"de": "Beste Zeit zum Posten", "en": "Best Time to Post", "fr": "Meilleur moment pour publier", "ar": "أفضل وقت للنشر"}, "aitools.card0.text": {"de": "Poste heute um 18:00 Uhr für maximale Reichweite.", "en": "Post today at 6 PM for maximum reach.", "fr": "Publiez aujourd'hui à 18h pour une portée maximale.", "ar": "انشر اليوم الساعة 6 مساءً لأعلى وصول."}, "aitools.card1.title": {"de": "Hashtag-Vorschlag", "en": "Hashtag Suggestion", "fr": "Suggestion de hashtag", "ar": "اقتراح هاشتاغ"}, "aitools.card1.text": {"de": "#Wolfsburg und #Handwerk erzielen aktuell hohe Reichweite.", "en": "#Wolfsburg and #Handwerk are trending in your area.", "fr": "#Wolfsburg et #Handwerk génèrent une forte portée.", "ar": "#Wolfsburg و#حرفة عم يحققوا وصول عالي حالياً."}, "aitools.card2.title": {"de": "Regionale Zielgruppe", "en": "Regional Targeting", "fr": "Ciblage régional", "ar": "استهداف إقليمي"}, "aitools.card2.text": {"de": "Erhöhe dein Budget für Wolfsburg und Braunschweig.", "en": "Increase your budget for Wolfsburg and Braunschweig.", "fr": "Augmentez votre budget pour Wolfsburg et Braunschweig.", "ar": "زوّد ميزانيتك لمنطقة فولفسبورغ وبراونشفايغ."}, "aitools.title": {"de": "KI-Empfehlungen", "en": "AI Recommendations", "fr": "Recommandations IA", "ar": "توصيات الذكاء الصناعي"}, "aitools.stat0.label": {"de": "Empfehlungsgenauigkeit", "en": "Recommendation Accuracy", "fr": "Précision des recommandations", "ar": "دقة التوصيات"}, "aitools.stat1.label": {"de": "Neue Vorschläge", "en": "New Suggestions", "fr": "Nouvelles suggestions", "ar": "اقتراحات جديدة"}, "aitools.stat2.label": {"de": "Bester Zeitpunkt heute", "en": "Best Time Today", "fr": "Meilleur moment aujourd'hui", "ar": "أفضل وقت اليوم"}, "nav.aitools.bc": {"de": "KI-Tools", "en": "AI Tools", "fr": "Outils IA", "ar": "أدوات الذكاء الصناعي"}, "aitools.subtitle": {"de": "Intelligente Empfehlungen für dein Wachstum", "en": "Smart recommendations for your growth", "fr": "Recommandations intelligentes pour votre croissance", "ar": "توصيات ذكية لنمو نشاطك"},
            "templates.card0.title": {"de": "Angebot der Woche", "en": "Weekly Offer", "fr": "Offre de la semaine", "ar": "عرض الأسبوع"}, "templates.card0.text": {"de": "Vorlage für wöchentliche Sonderangebote.", "en": "Template for weekly special offers.", "fr": "Modèle pour les offres spéciales hebdomadaires.", "ar": "قالب للعروض الأسبوعية."}, "templates.card1.title": {"de": "Kundenstimme", "en": "Customer Testimonial", "fr": "Témoignage client", "ar": "رأي عميل"}, "templates.card1.text": {"de": "Vorlage zum Teilen positiver Bewertungen.", "en": "Template for sharing positive reviews.", "fr": "Modèle pour partager des avis positifs.", "ar": "قالب لمشاركة تقييمات إيجابية."}, "templates.card2.title": {"de": "Behind the Scenes", "en": "Behind the Scenes", "fr": "Coulisses", "ar": "خلف الكواليس"}, "templates.card2.text": {"de": "Vorlage für Einblicke in den Arbeitsalltag.", "en": "Template for daily work insights.", "fr": "Modèle pour un aperçu du quotidien.", "ar": "قالب لمشاركة كواليس الشغل."}, "templates.title": {"de": "Content-Vorlagen", "en": "Content Templates", "fr": "Modèles de contenu", "ar": "قوالب المحتوى"}, "templates.stat0.label": {"de": "Verfügbare Vorlagen", "en": "Available Templates", "fr": "Modèles disponibles", "ar": "القوالب المتاحة"}, "templates.stat1.label": {"de": "Meistgenutzt", "en": "Most Used", "fr": "Le plus utilisé", "ar": "الأكثر استخداماً"}, "templates.stat2.label": {"de": "KI-generiert", "en": "AI Generated", "fr": "Généré par IA", "ar": "مولّد بالذكاء الصناعي"}, "nav.templates.bc": {"de": "Content-Vorlagen", "en": "Content Templates", "fr": "Modèles de contenu", "ar": "قوالب المحتوى"}, "templates.subtitle": {"de": "Fertige Vorlagen für deine Beiträge", "en": "Ready-made templates for your posts", "fr": "Modèles prêts pour vos publications", "ar": "قوالب جاهزة لمنشوراتك"},
            "baseaccounts.acc0.status": {"de": "Verbunden", "en": "Connected", "fr": "Connecté", "ar": "متصل"}, "baseaccounts.acc1.status": {"de": "Verbunden", "en": "Connected", "fr": "Connecté", "ar": "متصل"}, "baseaccounts.acc2.status": {"de": "Verbunden", "en": "Connected", "fr": "Connecté", "ar": "متصل"}, "baseaccounts.title": {"de": "Basiskonten", "en": "Base Accounts", "fr": "Comptes de base", "ar": "الحسابات الأساسية"}, "baseaccounts.stat0.label": {"de": "Unternehmensprofile", "en": "Business Profiles", "fr": "Profils d'entreprise", "ar": "الملفات التجارية"}, "baseaccounts.stat1.label": {"de": "Verifiziert", "en": "Verified", "fr": "Vérifié", "ar": "موثّق"}, "baseaccounts.stat2.label": {"de": "Bewertung", "en": "Rating", "fr": "Note", "ar": "التقييم"}, "nav.baseaccounts.bc": {"de": "Basiskonten", "en": "Base Accounts", "fr": "Comptes de base", "ar": "الحسابات الأساسية"}, "baseaccounts.subtitle": {"de": "Deine primären Unternehmensprofile", "en": "Your primary business profiles", "fr": "Vos profils d'entreprise principaux", "ar": "حسابات نشاطك الأساسية"},
            "advanced.d1": {"de": "Reichweite", "en": "Reach", "fr": "Portée", "ar": "الوصول"}, "advanced.d2": {"de": "Interaktion", "en": "Engagement", "fr": "Interaction", "ar": "التفاعل"}, "advanced.title": {"de": "Kombinierte Leistungsentwicklung", "en": "Combined Performance Trend", "fr": "Évolution combinée des performances", "ar": "تطور الأداء المجمّع"}, "advanced.stat0.label": {"de": "Vorhersagegenauigkeit", "en": "Prediction Accuracy", "fr": "Précision des prévisions", "ar": "دقة التنبؤ"}, "advanced.stat1.label": {"de": "Prognostiziertes Wachstum", "en": "Forecasted Growth", "fr": "Croissance prévue", "ar": "النمو المتوقع"}, "advanced.stat2.label": {"de": "Segmentierte Zielgruppen", "en": "Segmented Audiences", "fr": "Audiences segmentées", "ar": "الجماهير المقسّمة"}, "nav.advanced.bc": {"de": "Erweiterte Analysen", "en": "Advanced Analytics", "fr": "Analyses avancées", "ar": "تحليلات متقدمة"}, "advanced.subtitle": {"de": "Tiefergehende Kennzahlen für Profis", "en": "In-depth metrics for advanced users", "fr": "Indicateurs approfondis pour utilisateurs avancés", "ar": "مؤشرات متقدمة للمحترفين"},
            "charts.d1": {"de": "Reichweite", "en": "Reach", "fr": "Portée", "ar": "الوصول"}, "charts.title": {"de": "Plattformvergleich", "en": "Platform Comparison", "fr": "Comparaison des plateformes", "ar": "مقارنة المنصات"}, "charts.stat0.label": {"de": "Verfügbare Diagramme", "en": "Available Charts", "fr": "Graphiques disponibles", "ar": "الرسوم المتاحة"}, "charts.stat1.label": {"de": "Live aktualisiert", "en": "Live Updated", "fr": "Mis à jour en direct", "ar": "تحديث مباشر"}, "charts.stat2.label": {"de": "Exportierbar", "en": "Exportable", "fr": "Exportable", "ar": "قابل للتصدير"}, "nav.charts.bc": {"de": "Diagramme", "en": "Charts", "fr": "Graphiques", "ar": "الرسوم البيانية"}, "charts.subtitle": {"de": "Alle wichtigen Diagramme im Überblick", "en": "All key charts at a glance", "fr": "Tous les graphiques essentiels en un coup d'œil", "ar": "كل الرسوم البيانية المهمة بلمحة"},
            "forms.field0": {"de": "Kampagnenname", "en": "Campaign Name", "fr": "Nom de la campagne", "ar": "اسم الحملة"}, "forms.field1": {"de": "Zielplattform", "en": "Target Platform", "fr": "Plateforme cible", "ar": "المنصة المستهدفة"}, "forms.field2": {"de": "Budget", "en": "Budget", "fr": "Budget", "ar": "الميزانية"}, "forms.field3": {"de": "Startdatum", "en": "Start Date", "fr": "Date de début", "ar": "تاريخ البدء"}, "forms.title": {"de": "Neue Kampagne", "en": "New Campaign", "fr": "Nouvelle campagne", "ar": "حملة جديدة"}, "forms.stat0.label": {"de": "Vorlagen verfügbar", "en": "Templates Available", "fr": "Modèles disponibles", "ar": "القوالب المتاحة"}, "forms.stat1.label": {"de": "Ø Erstellungszeit", "en": "Avg. Creation Time", "fr": "Temps de création moyen", "ar": "متوسط وقت الإنشاء"}, "forms.stat2.label": {"de": "Zuletzt gespeichert", "en": "Last Saved", "fr": "Dernier enregistrement", "ar": "آخر حفظ"}, "nav.forms.bc": {"de": "Formulare", "en": "Forms", "fr": "Formulaires", "ar": "النماذج"}, "forms.subtitle": {"de": "Neue Kampagne oder neuen Beitrag anlegen", "en": "Create a new campaign or post", "fr": "Créer une nouvelle campagne ou publication", "ar": "إنشاء حملة أو منشور جديد"},
            "tables.h.date": {"de": "Datum", "en": "Date", "fr": "Date", "ar": "التاريخ"}, "tables.h.platform": {"de": "Plattform", "en": "Platform", "fr": "Plateforme", "ar": "المنصة"}, "tables.h.likes": {"de": "Gefällt mir", "en": "Likes", "fr": "J'aime", "ar": "الإعجابات"}, "tables.h.comments": {"de": "Kommentare", "en": "Comments", "fr": "Commentaires", "ar": "التعليقات"}, "tables.title": {"de": "Alle Beiträge", "en": "All Posts", "fr": "Toutes les publications", "ar": "كل المنشورات"}, "tables.stat0.label": {"de": "Erfasste Beiträge", "en": "Tracked Posts", "fr": "Publications suivies", "ar": "المنشورات المتتبعة"}, "tables.stat1.label": {"de": "Bestperformer", "en": "Top Performer", "fr": "Meilleure publication", "ar": "الأفضل أداءً"}, "tables.stat2.label": {"de": "Ø Interaktionsrate", "en": "Avg. Engagement Rate", "fr": "Taux d'interaction moyen", "ar": "متوسط معدل التفاعل"}, "nav.tables.bc": {"de": "Tabellen", "en": "Tables", "fr": "Tableaux", "ar": "الجداول"}, "tables.subtitle": {"de": "Detaillierte Datenübersicht deiner Beiträge", "en": "Detailed data overview of your posts", "fr": "Aperçu détaillé des données de vos publications", "ar": "نظرة تفصيلية على بيانات منشوراتك"},
            "icons.title": {"de": "Plattform-Icons", "en": "Platform Icons", "fr": "Icônes de plateforme", "ar": "أيقونات المنصات"}, "icons.stat0.label": {"de": "Plattformen", "en": "Platforms", "fr": "Plateformes", "ar": "المنصات"}, "icons.stat1.label": {"de": "Markenfarben", "en": "Brand Colors", "fr": "Couleurs de marque", "ar": "ألوان العلامة"}, "icons.stat2.label": {"de": "Aktiv verbunden", "en": "Actively Connected", "fr": "Activement connecté", "ar": "متصلة فعلياً"}, "nav.icons.bc": {"de": "Plattform-Icons", "en": "Platform Icons", "fr": "Icônes de plateforme", "ar": "الأيقونات"}, "icons.subtitle": {"de": "Verbundene Plattformen im Überblick", "en": "Connected platforms at a glance", "fr": "Plateformes connectées en un coup d'œil", "ar": "المنصات المرتبطة بلمحة"},
            "map.title": {"de": "Verteilung in Deutschland", "en": "Distribution in Germany", "fr": "Répartition en Allemagne", "ar": "التوزع في ألمانيا"}, "map.stat0.label": {"de": "Städte mit Followern", "en": "Cities with Followers", "fr": "Villes avec des abonnés", "ar": "المدن التي فيها متابعون"}, "map.stat1.label": {"de": "Top Stadt", "en": "Top City", "fr": "Ville principale", "ar": "المدينة الأولى"}, "map.stat2.label": {"de": "Anteil Niedersachsen", "en": "Share in Lower Saxony", "fr": "Part en Basse-Saxe", "ar": "نسبة سكسونيا السفلى"}, "nav.map.bc": {"de": "Verteilungskarte", "en": "Distribution Map", "fr": "Carte de répartition", "ar": "خريطة التوزع"}, "map.subtitle": {"de": "Wo deine Follower in Deutschland leben", "en": "Where your followers live in Germany", "fr": "Où vivent vos abonnés en Allemagne", "ar": "وين بيعيشو متابعينك بألمانيا"},
            "analytics.stat0.label": {"de": "Follower gesamt", "en": "Total Followers", "fr": "Total abonnés", "ar": "إجمالي المتابعين"}, "analytics.stat1.label": {"de": "Klicks auf die Webseite", "en": "Website Clicks", "fr": "Clics sur le site", "ar": "نقرات الموقع الإلكتروني"}, "analytics.stat2.label": {"de": "Interaktionen gesamt", "en": "Total Engagement", "fr": "Interactions totales", "ar": "إجمالي التفاعلات"}, "analytics.stat3.label": {"de": "Google Bewertung", "en": "Google Rating", "fr": "Note Google", "ar": "تقييم غوغل"}, "analytics.d1": {"de": "Neue Follower", "en": "New Followers", "fr": "Nouveaux abonnés", "ar": "متابعون جدد"}, "analytics.d2": {"de": "Interaktion", "en": "Engagement", "fr": "Interaction", "ar": "التفاعل"}, "analytics.social.cat0": {"de": "Direkt", "en": "Direct", "fr": "Direct", "ar": "مباشر"}, "analytics.social.cat1": {"de": "Instagram", "en": "Instagram", "fr": "Instagram", "ar": "انستغرام"}, "analytics.social.cat2": {"de": "Facebook", "en": "Facebook", "fr": "Facebook", "ar": "فيسبوك"}, "analytics.social.cat3": {"de": "Google", "en": "Google", "fr": "Google", "ar": "غوغل"}, "nav.analytics.bc": {"de": "Analysen", "en": "Analytics", "fr": "Analytique", "ar": "التحليلات"}, "analytics.chartTitle": {"de": "Wachstum von Followern und Interaktion", "en": "Follower & Engagement Growth", "fr": "Croissance des abonnés et interactions", "ar": "نمو المتابعين والتفاعل"}, "common.thisMonth": {"de": "Dieser Monat", "en": "This Month", "fr": "Ce mois", "ar": "هذا الشهر"}, "analytics.reachLabel": {"de": "Gesamtreichweite", "en": "Total Reach", "fr": "Portée totale", "ar": "إجمالي الوصول"}, "analytics.sum0": {"de": "Neue Follower", "en": "New Followers", "fr": "Nouveaux abonnés", "ar": "متابعون جدد"}, "analytics.sum1": {"de": "Entfolgt", "en": "Unfollows", "fr": "Désabonnements", "ar": "إلغاء متابعة"}, "analytics.sum2": {"de": "Netto-Wachstum", "en": "Net Growth", "fr": "Croissance nette", "ar": "صافي النمو"}, "analytics.perfLabel": {"de": "Performance-Score deines Kontos", "en": "Your Account Performance Score", "fr": "Score de performance de votre compte", "ar": "نقاط أداء حسابك الرقمي"}, "analytics.bs0": {"de": "Neue Follower", "en": "New Followers", "fr": "Nouveaux abonnés", "ar": "متابعون جدد"}, "analytics.bs1": {"de": "Entfolgt", "en": "Unfollows", "fr": "Désabonnements", "ar": "إلغاء متابعة"}, "analytics.btn0": {"de": "Jetzt posten", "en": "Post Now", "fr": "Publier maintenant", "ar": "انشر الآن"}, "analytics.btn1": {"de": "Beitrag planen", "en": "Schedule Post", "fr": "Planifier", "ar": "جدولة منشور"}, "analytics.mc0": {"de": "Beiträge diesen Monat", "en": "Posts This Month", "fr": "Publications ce mois", "ar": "منشورات هذا الشهر"}, "analytics.mc0t": {"de": "60% des Plans", "en": "60% of Plan", "fr": "60% du plan", "ar": "60% من الخطة"}, "analytics.mc1": {"de": "Gesamtreichweite", "en": "Total Reach", "fr": "Portée totale", "ar": "إجمالي الوصول"}, "analytics.mc1t": {"de": "80% des Ziels", "en": "80% of Target", "fr": "80% de l’objectif", "ar": "80% من الهدف"}, "common.viewMore": {"de": "Mehr anzeigen", "en": "View More", "fr": "Voir plus", "ar": "عرض التفاصيل"}, "analytics.sourceTitle": {"de": "Traffic-Quellen", "en": "Traffic Sources", "fr": "Sources de trafic", "ar": "مصادر الزيارات"}, "analytics.sourceSub": {"de": "Gesamter Traffic diese Woche", "en": "Total Traffic This Week", "fr": "Trafic total cette semaine", "ar": "إجمالي الزيارات هذا الأسبوع"}, "analytics.donutLabel": {"de": "Neue Follower", "en": "New Followers", "fr": "Nouveaux abonnés", "ar": "متابعون جدد"}, "analytics.buyersLabel": {"de": "Neue Follower heute", "en": "New Followers Today", "fr": "Nouveaux abonnés aujourd’hui", "ar": "متابعون جدد اليوم"}, "analytics.actA": {"de": "Mehr Statistiken", "en": "More Statistics", "fr": "Plus de statistiques", "ar": "إحصائيات أكثر"}, "analytics.mapTitle": {"de": "Follower-Verteilung in Deutschland", "en": "Follower Distribution in Germany", "fr": "Répartition des abonnés en Allemagne", "ar": "توزع المتابعين في ألمانيا"}, "analytics.mapDD": {"de": "Deutschland", "en": "Germany", "fr": "Allemagne", "ar": "ألمانيا"}, "analytics.aiTitle": {"de": "Heutige KI-Empfehlung", "en": "Today’s AI Recommendation", "fr": "Recommandation IA du jour", "ar": "توصية الذكاء الصناعي اليوم"}, "analytics.aiH": {"de": "Beste Zeit zum Posten heute", "en": "Best Time to Post Today", "fr": "Meilleur moment pour publier aujourd’hui", "ar": "أفضل وقت للنشر اليوم"}, "analytics.aiP": {"de": "Basierend auf der Aktivität deiner Follower letzte Woche", "en": "Based on your followers’ activity last week", "fr": "Basé sur l’activité de vos abonnés la semaine dernière", "ar": "بناءً على تحليل نشاط متابعيك الأسبوع الماضي"}, "analytics.aiTime": {"de": "18:00 Uhr", "en": "6:00 PM", "fr": "18h00", "ar": "الساعة 6:00 مساءً"}, "analytics.aiM0": {"de": "+12% erwartete Interaktion", "en": "+12% expected engagement", "fr": "+12% d’interaction prévue", "ar": "+12% تفاعل متوقع"}, "analytics.aiM1": {"de": "3,2K Aufrufe", "en": "3.2K views", "fr": "3,2K vues", "ar": "3.2K مشاهدة"}, "analytics.aiM2": {"de": "94% Genauigkeit", "en": "94% accuracy", "fr": "94% de précision", "ar": "دقة 94%"}};
        const CHART_CONFIGS = [{"type": "line", "canvas": "chart_social", "labels": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], "sets": [{"key": "social.d1", "data": [11200, 11800, 12100, 12600, 13100, 13500, 14000, 14400, 14900, 15400, 15800, 16240], "color": "#6366f1"}, {"key": "social.d2", "data": [7200, 7350, 7500, 7650, 7800, 7950, 8050, 8150, 8280, 8400, 8500, 8614], "color": "#10b981"}]}, {"type": "line", "canvas": "chart_website", "labels": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], "sets": [{"key": "website.d1", "data": [9800, 10200, 11000, 11400, 12800, 13100, 14200, 14800, 15600, 16700, 17500, 18705], "color": "#6366f1"}, {"key": "website.d2", "data": [15200, 15900, 16800, 17200, 18600, 19100, 20200, 20800, 21600, 22700, 23500, 24705], "color": "#10b981"}]}, {"type": "doughnut", "canvas": "chart_audience", "label_keys": ["audience.cat0", "audience.cat1", "audience.cat2", "audience.cat3"], "values": [22, 38, 26, 14], "colors": ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}, {"type": "bar", "canvas": "chart_landing", "labels": ["Woche 1", "Woche 2", "Woche 3", "Woche 4"], "sets": [{"key": "landing.d1", "data": [1100, 1280, 1350, 1480], "color": "#6366f1"}, {"key": "landing.d2", "data": [68, 79, 88, 99], "color": "#10b981"}]}, {"type": "line", "canvas": "chart_followers", "labels": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], "sets": [{"key": "followers.d1", "data": [11200, 11800, 12100, 12600, 13100, 13500, 14000, 14400, 14900, 15400, 15800, 16240], "color": "#6366f1"}, {"key": "followers.d2", "data": [7200, 7350, 7500, 7650, 7800, 7950, 8050, 8150, 8280, 8400, 8500, 8614], "color": "#10b981"}]}, {"type": "bar", "canvas": "chart_engagement", "labels": ["Woche 1", "Woche 2", "Woche 3", "Woche 4"], "sets": [{"key": "engagement.d1", "data": [1400, 1520, 1680, 1640], "color": "#6366f1"}, {"key": "engagement.d2", "data": [380, 420, 510, 535], "color": "#10b981"}]}, {"type": "doughnut", "canvas": "chart_visits", "label_keys": ["visits.cat0", "visits.cat1", "visits.cat2", "visits.cat3"], "values": [35, 25, 20, 20], "colors": ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}, {"type": "line", "canvas": "chart_advanced", "labels": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], "sets": [{"key": "advanced.d1", "data": [20200, 21500, 22800, 23900, 25200, 26100, 27400, 28600, 29800, 31200, 32500, 33900], "color": "#6366f1"}, {"key": "advanced.d2", "data": [3200, 3400, 3550, 3700, 3900, 4050, 4300, 4450, 4600, 4850, 5000, 5200], "color": "#10b981"}]}, {"type": "bar", "canvas": "chart_charts", "labels": ["Instagram", "Facebook", "Google", "TikTok"], "sets": [{"key": "charts.d1", "data": [16240, 8614, 5200, 2100], "color": "#6366f1"}]}, {"type": "line", "canvas": "salesChart", "labels": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], "sets": [{"key": "analytics.d1", "data": [16500, 17200, 15800, 21000, 16800, 15500, 16200, 17000, 15800, 19000, 14200, 18800], "color": "#6366f1"}, {"key": "analytics.d2", "data": [16200, 16800, 16500, 17000, 14800, 15500, 18800, 16000, 15200, 16800, 14500, 16500], "color": "#10b981"}]}, {"type": "doughnut", "canvas": "socialChart", "label_keys": ["analytics.social.cat0", "analytics.social.cat1", "analytics.social.cat2", "analytics.social.cat3"], "values": [35, 25, 20, 20], "colors": ["#6366f1", "#3b82f6", "#10b981", "#f59e0b"]}];
        let currentLang = localStorage.getItem('sp_lang') || 'de';
        const chartInstances = {};

        function applyLanguage(lang) {
            document.documentElement.lang = lang;
            document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const tr = TRANSLATIONS[key];
                if (tr && tr[lang]) el.textContent = tr[lang];
            });
            const searchInput = document.getElementById('searchInput');
            const searchTr = {de:"Suchen...",en:"Search...",fr:"Rechercher...",ar:"ابحث..."};
            if (searchInput) searchInput.placeholder = searchTr[lang];
            rebuildAllCharts(lang);
        }

        function setLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('sp_lang', lang);
            applyLanguage(lang);
        }

        function showPage(pageId) {
            document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
            const target = document.getElementById('page-' + pageId);
            if (target) target.style.display = 'block';
            document.querySelectorAll('.nav-item[data-page]').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-item[data-page="' + pageId + '"]').forEach(el => el.classList.add('active'));
            window.scrollTo({top:0, behavior:'smooth'});
        }

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.querySelector('.fa-moon, .fa-sun');
            if (document.body.classList.contains('dark-mode')) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
            else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
            rebuildAllCharts(currentLang);
        }

        function createSparkline(canvasId, data, color) {
            const el = document.getElementById(canvasId);
            if (!el) return;
            new Chart(el.getContext('2d'), {
                type: 'bar',
                data: { labels:['S','M','T','W','T','F','S'], datasets:[{ data, backgroundColor: color, borderRadius:2, barThickness:4 }] },
                options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{display:false},y:{display:false}} }
            });
        }

        function buildChart(cfg, lang) {
            const el = document.getElementById(cfg.canvas);
            if (!el) return;
            if (chartInstances[cfg.canvas]) { chartInstances[cfg.canvas].destroy(); }
            const isDark = document.body.classList.contains('dark-mode');
            const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            const textColor = isDark ? '#9ca3af' : '#6b7280';

            if (cfg.type === 'line' || cfg.type === 'bar') {
                const datasets = cfg.sets.map(s => {
                    const label = (TRANSLATIONS[s.key] && TRANSLATIONS[s.key][lang]) || '';
                    if (cfg.type === 'line') {
                        return { label, data: s.data, borderColor: s.color, backgroundColor: s.color + '0D', borderWidth:2, tension:.4, fill:true, pointRadius:0, pointHoverRadius:6 };
                    }
                    return { label, data: s.data, backgroundColor: s.color, borderRadius:4 };
                });
                chartInstances[cfg.canvas] = new Chart(el.getContext('2d'), {
                    type: cfg.type,
                    data: { labels: cfg.labels, datasets },
                    options: {
                        responsive:true, maintainAspectRatio:false,
                        interaction:{intersect:false, mode:'index'},
                        plugins:{ legend:{display:false}, tooltip:{ backgroundColor:isDark?'#1a1d29':'#fff', titleColor:isDark?'#fff':'#1f2937', bodyColor:isDark?'#9ca3af':'#6b7280', borderColor:isDark?'#2d3748':'#e5e7eb', borderWidth:1, padding:12, usePointStyle:true } },
                        scales:{ x:{grid:{display:false}, ticks:{color:textColor,font:{size:11}}}, y:{grid:{color:gridColor,drawBorder:false}, ticks:{color:textColor,font:{size:11}}} }
                    }
                });
            } else if (cfg.type === 'doughnut') {
                const labels = cfg.label_keys.map(k => (TRANSLATIONS[k] && TRANSLATIONS[k][lang]) || '');
                chartInstances[cfg.canvas] = new Chart(el.getContext('2d'), {
                    type:'doughnut',
                    data:{ labels, datasets:[{ data: cfg.values, backgroundColor: cfg.colors, borderWidth:0, cutout:'75%' }] },
                    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#1a1d29', padding:12, cornerRadius:8 } } }
                });
            }
        }

        function rebuildAllCharts(lang) {
            CHART_CONFIGS.forEach(cfg => buildChart(cfg, lang));
        }

        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('langSelect').value = currentLang;
            applyLanguage(currentLang);
        });
    </script>
    <script src="assets/js/core.js"></script>
    <script src="assets/js/settings.js"></script>
    <script src="assets/js/crud.js"></script>
    <script src="assets/js/pages/posts.js"></script>
    <script src="assets/js/pages/campaigns.js"></script>
    <script src="assets/js/pages/templates.js"></script>
    <script src="assets/js/pages/reviews.js"></script>
    <script src="assets/js/pages/messages.js"></script>
    <script src="assets/js/pages/website.js"></script>
    <script src="assets/js/pages/social.js"></script>
    <script src="assets/js/pages/dashboard.js"></script>
    <script src="assets/js/pages/reports.js"></script>
    <script src="assets/js/pages/ai.js"></script>
    <script src="assets/js/pages/accounts.js"></script>
    <script src="assets/js/topbar.js"></script>
</body>
</html>
