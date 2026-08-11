<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ReportkitConfig — Loads merged reportkit config from host or package defaults.
 */

namespace ReportKit\Core\Settings;

/**
 * Loads merged reportkit config from host or package defaults.
 */
class ReportkitConfig
{
    /**
     * @param object|null $app Illuminate application when config() is unavailable.
     * @param string|null $packageConfigPath Absolute path to package config/reportkit.php.
     * @return array
     */
    public static function load($app = null, $packageConfigPath = null)
    {
        if (function_exists('config')) {
            $value = config('reportkit', array());

            return is_array($value) ? $value : array();
        }

        if ($app && is_object($app) && isset($app['config']) && method_exists($app['config'], 'get')) {
            $value = $app['config']->get('reportkit', array());

            return is_array($value) ? $value : array();
        }

        if ($packageConfigPath && is_file($packageConfigPath)) {
            $value = require $packageConfigPath;

            return is_array($value) ? $value : array();
        }

        return array();
    }
}
