<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * HostRuntime — Best-effort host runtime introspection (adapter-safe, PHP 5.6+).
 */

namespace ReportKit\Core\Support;

/**
 * Best-effort host runtime introspection (adapter-safe, PHP 5.6+).
 */
class HostRuntime
{
    /**
     * @param object|null $app Illuminate application when available.
     * @return string|null
     */
    public static function laravelVersion($app = null)
    {
        if (class_exists('Illuminate\Foundation\Application', false)) {
            $version = \Illuminate\Foundation\Application::VERSION;

            if ($version) {
                return $version;
            }
        }

        if ($app && is_object($app) && method_exists($app, 'version')) {
            return $app->version();
        }

        return null;
    }
}
