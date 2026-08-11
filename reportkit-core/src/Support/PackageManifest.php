<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * PackageManifest — Reads package metadata from composer.json (extra.reportkit + require).
 */

namespace ReportKit\Core\Support;

/**
 * Reads package metadata from composer.json (extra.reportkit + require).
 */
class PackageManifest
{
    /** @var string */
    protected $root;

    /** @var array */
    protected $composer;

    /**
     * @param string $packageRoot Absolute path to package root (contains composer.json).
     */
    public function __construct($packageRoot)
    {
        $this->root = rtrim($packageRoot, '/\\');
        $this->composer = $this->loadComposer();
    }

    /**
     * @param string $packageRoot
     * @return self
     */
    public static function fromPackageRoot($packageRoot)
    {
        return new self($packageRoot);
    }

    /**
     * @return array
     */
    protected function loadComposer()
    {
        $path = $this->root . '/composer.json';

        if (!is_file($path)) {
            return array();
        }

        $json = json_decode(file_get_contents($path), true);

        return is_array($json) ? $json : array();
    }

    /**
     * @param string|null $key
     * @param mixed $default
     * @return mixed
     */
    public function extra($key = null, $default = null)
    {
        $extra = isset($this->composer['extra']['reportkit'])
            ? $this->composer['extra']['reportkit']
            : array();

        if ($key === null) {
            return $extra;
        }

        return array_key_exists($key, $extra) ? $extra[$key] : $default;
    }

    /**
     * Human-readable Laravel support range for CLI output and docs.
     *
     * @return string
     */
    public function laravelDisplay()
    {
        $laravel = $this->extra('laravel', array());

        if (!empty($laravel['display'])) {
            return (string) $laravel['display'];
        }

        $min = isset($laravel['min']) ? $laravel['min'] : null;
        $max = isset($laravel['max']) ? $laravel['max'] : $this->illuminateMaxFromRequire();

        if ($min && $max) {
            return $min . ' → ' . $max;
        }

        if ($min) {
            return $min . ' → current';
        }

        return 'supported versions';
    }

    /**
     * @return string|null
     */
    protected function illuminateMaxFromRequire()
    {
        $req = isset($this->composer['require']['illuminate/support'])
            ? $this->composer['require']['illuminate/support']
            : '';

        if (preg_match('/<(\d+)/', $req, $matches)) {
            return (string) ((int) $matches[1] - 1);
        }

        return null;
    }

    /**
     * @return string
     */
    public function installCommandDescription()
    {
        return 'Install ReportKit checklist / publish assets & config (Laravel ' . $this->laravelDisplay() . ')';
    }

    /**
     * @param string|null $hostVersion Detected host Laravel version.
     * @return string
     */
    public function installBanner($hostVersion = null)
    {
        $range = $this->laravelDisplay();

        if ($hostVersion) {
            return 'ReportKit install — host Laravel ' . $hostVersion . ' (package supports ' . $range . ')';
        }

        return 'ReportKit install (Laravel ' . $range . ')';
    }

    /**
     * @param string $key
     * @return string
     */
    public function docsUrl($key = 'install')
    {
        $docs = $this->extra('docs', array());

        if (isset($docs[$key])) {
            return (string) $docs[$key];
        }

        return 'https://reportkit.lorapok.tech/docs';
    }

    /**
     * @return string
     */
    public function packageName()
    {
        return isset($this->composer['name']) ? $this->composer['name'] : 'reportkit/unknown';
    }

    /**
     * @return string
     */
    public function formatComposerRequire()
    {
        $install = $this->extra('install', array());
        $packages = isset($install['composer_require']) ? $install['composer_require'] : array();

        if (!$packages) {
            return 'composer require ' . $this->packageName();
        }

        return 'composer require ' . implode(' ', $packages);
    }

    /**
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function installMeta($key, $default = null)
    {
        $install = $this->extra('install', array());

        return array_key_exists($key, $install) ? $install[$key] : $default;
    }
}
