---
title: "Installation"
description: "Composer install for modern and legacy Laravel."
order: 3
group: "Getting started"
---

## Modern Laravel (5.5–13)

```bash
composer require reportkit/core reportkit/laravel
php artisan reportkit:install --publish-assets --with-config
```

Provider/alias auto-discovery is enabled via `extra.laravel` in `composer.json`.

## Legacy Laravel (4.1–5.4)

```bash
composer require reportkit/core reportkit/laravel-legacy
php artisan reportkit:install
```

Register the service provider manually on hosts without package discovery.

## UI assets

Prefer `php artisan reportkit:install --publish-assets`. Manual copy from `@lorapok-labs/reportkit-ui`:

```bash
mkdir -p public/vendor/reportkit
# css/reportkit.css, css/reportkit-compat.css, js/reportkit.js
```
