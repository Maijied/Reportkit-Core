#!/usr/bin/env php
<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * add-file-headers.php — inject standard Lorapok file headers into source files.
 */

if (php_sapi_name() !== 'cli') {
    exit(1);
}

$root = dirname(__DIR__);
$license = 'Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)';
$marker = 'Copyright (c) 2026 Lorapok Labs';

$dirs = array(
    $root . '/reportkit-core/src',
    $root . '/reportkit-core/tests',
    $root . '/reportkit-ui/js',
    $root . '/reportkit-ui/css',
    $root . '/reportkit-laravel-legacy/src',
    $root . '/reportkit-laravel-legacy/config',
    $root . '/reportkit-laravel-legacy/resources',
    $root . '/reportkit-laravel/src',
    $root . '/reportkit-laravel/config',
    $root . '/reportkit-laravel/resources',
    $root . '/scripts',
);

$extensions = array('php', 'js', 'css');
$updated = 0;
$skipped = 0;

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        continue;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {
        /** @var SplFileInfo $file */
        if (!$file->isFile()) {
            continue;
        }

        $path = $file->getPathname();
        $ext = strtolower($file->getExtension());

        if (!in_array($ext, $extensions, true)) {
            continue;
        }

        if (strpos($path, '/vendor/') !== false || strpos($path, '/node_modules/') !== false) {
            continue;
        }

        $content = file_get_contents($path);
        if ($content === false || strpos($content, $marker) !== false) {
            $skipped++;
            continue;
        }

        $description = describeSourceFile($path, $content);
        $header = buildHeader($path, $description, $license);
        $newContent = insertHeader($path, $content, $header);

        if ($newContent !== null && $newContent !== $content) {
            file_put_contents($path, $newContent);
            $updated++;
            echo "Updated: {$path}\n";
        } else {
            $skipped++;
        }
    }
}

echo "\nDone. Updated {$updated}, skipped {$skipped}.\n";

function describeSourceFile($path, $content)
{
    if (preg_match('/^\s*(?:abstract\s+|final\s+)?class\s+(\w+)/m', $content, $m)) {
        return classDescription($m[1], $content);
    }

    if (preg_match('/^\s*interface\s+(\w+)/m', $content, $m)) {
        return $m[1] . ' — ReportKit contract interface.';
    }

    if (preg_match('/^\s*trait\s+(\w+)/m', $content, $m)) {
        return $m[1] . ' — shared HTTP/controller behavior.';
    }

    $base = basename($path);

    if (preg_match('/\.blade\.php$/', $base)) {
        $slug = preg_replace('/\.blade\.php$/', '', $base);

        return $slug . ' — Blade UI partial.';
    }

    if (preg_match('/\.stub$/', $base)) {
        return basename($base) . ' — report scaffold stub.';
    }

    if (preg_match('/Test\.php$/', $base)) {
        return basename($base, '.php') . ' — PHPUnit tests.';
    }

    if (substr($base, -3) === '.js') {
        return $base . ' — ReportKit browser module.';
    }

    if (substr($base, -4) === '.css') {
        return $base . ' — ReportKit stylesheet.';
    }

    if ($base === 'reportkit.php') {
        return 'reportkit.php — package configuration defaults.';
    }

    if ($base === 'routes.php') {
        return 'routes.php — package HTTP routes.';
    }

    return $base . ' — ReportKit source file.';
}

function classDescription($className, $content)
{
    if (preg_match('/\/\*\*\s*\n\s*\*\s*([^*\n]+)/', $content, $m)) {
        $line = trim($m[1]);
        if ($line !== '' && stripos($line, 'lorapok reportkit') === false) {
            return $className . ' — ' . rtrim($line, '.') . '.';
        }
    }

    return $className . ' — ReportKit core component.';
}

function buildHeader($path, $description, $license)
{
    $lines = array(
        ' * Lorapok ReportKit',
        ' * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)',
        ' * ' . $license,
        ' *',
        ' * ' . $description,
    );

    if (preg_match('/\.blade\.php$/', $path)) {
        return "{{--\n" . implode("\n", $lines) . "\n--}}\n\n";
    }

    return "/**\n" . implode("\n", $lines) . "\n */\n\n";
}

function insertHeader($path, $content, $header)
{
    if (preg_match('/\.blade\.php$/', $path)) {
        return $header . ltrim($content, "\n");
    }

    if (preg_match('/\.(js|css)$/', $path)) {
        return $header . ltrim($content, "\n");
    }

    if (preg_match('/\.php$/', $path)) {
        if (strncmp($content, '<?php', 5) === 0) {
            $rest = substr($content, 5);
            $rest = ltrim($rest, "\r\n");

            return "<?php\n\n" . $header . $rest;
        }

        return $header . ltrim($content, "\n");
    }

    return null;
}
