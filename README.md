# SocialPulse — Social Media & Website Analytics Dashboard

![PHP](https://img.shields.io/badge/PHP-8-777BB4?logo=php&logoColor=white) ![AI](https://img.shields.io/badge/AI-Claude%20API-D97757)

> Client dashboard for managing social media and analysing website traffic, with an AI assistant.

## Overview
A production project built and deployed by **Mahmoud Hasan**. This repository holds the source code only. The client's secrets,
databases, uploaded files and personal data are not included; where the code needs them, they are replaced with placeholders.

**Tech stack:** PHP 8 · JSON storage · Vanilla JS (modular) · Anthropic API (optional)

## Features
- Modules: dashboard, posts, campaigns, messages, reviews, social accounts, templates, reports, website analytics
- Own tracking script (`track.php`), no third-party trackers; visits are stored as salted, aggregated daily summaries
- AI recommendations through the Anthropic API; the key stays on the server in `includes/ai-config.php`
- Login with hashed password, rate limiting, setup wizard
- Front-end split into modules, one per dashboard page

## Project structure
```
index.php / login.php / setup.php
api.php             JSON API
track.php           tracking endpoint
includes/           bootstrap, collections, tracking, AI config
assets/js/pages/    one module per dashboard page
data/               runtime data (not in repo)
```

## Getting started
Upload to a PHP 8 host and open `setup.php` once to create the account. Optionally set the AI key in `includes/ai-config.php`. Example config: `data/config.example.json`.

## Security & privacy
- No credentials in the repository. API keys, passwords and database settings are placeholders (`CHANGE_ME`, `YOUR_…`, `your_db_password`).
- Runtime data (customers, messages, appointments, logs, uploads) is left out.
- Personal names, phone numbers and addresses in the default content are replaced with sample data (e.g. Max Mustermann, +49 151 00000000, Musterstraße 1).

## Author
**Mahmoud Hasan** · [GitHub](https://github.com/MahmoudHasan2)
