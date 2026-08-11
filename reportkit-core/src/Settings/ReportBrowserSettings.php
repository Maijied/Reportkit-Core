<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ReportBrowserSettings — Resolve browser settings for global or per-report context.
 */

namespace ReportKit\Core\Settings;

use ReportKit\Core\Report\ReportDefinition;
use ReportKit\Core\Report\ReportRegistry;

/**
 * Resolve browser settings for global or per-report context.
 */
class ReportBrowserSettings
{
    /**
     * @param object|null $app
     * @param string|null $packageConfigPath
     * @param string|null $reportId
     * @return array
     */
    public static function payload($app = null, $packageConfigPath = null, $reportId = null)
    {
        $config = ReportkitConfig::load($app, $packageConfigPath);
        $definition = null;

        if ($reportId) {
            $definition = ReportRegistry::get($reportId);
        }

        return BrowserSettingsBuilder::forReport($config, $definition);
    }
}
