<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ReportSettingsResolver — Merged config values for a registered report (server-side).
 */

namespace ReportKit\Core\Settings;

use ReportKit\Core\Report\ReportDefinition;
use ReportKit\Core\Report\ReportRegistry;

/**
 * Merged config values for a registered report (server-side).
 */
class ReportSettingsResolver
{
    /**
     * @param string $reportId
     * @param array $globalConfig
     * @return array
     */
    public static function configForReport($reportId, array $globalConfig)
    {
        $definition = ReportRegistry::get($reportId);
        $overrides = ($definition && !empty($definition->settings)) ? $definition->settings : array();

        return SettingsMerger::merge($globalConfig, $overrides);
    }

    /**
     * @param string $reportId
     * @param array $globalConfig
     * @param string $path Dot path, e.g. date.max_months
     * @param mixed $default
     * @return mixed
     */
    public static function get($reportId, array $globalConfig, $path, $default = null)
    {
        $config = self::configForReport($reportId, $globalConfig);
        $segments = explode('.', $path);
        $value = $config;

        foreach ($segments as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    /**
     * @param string $reportId
     * @param array $globalConfig
     * @return ReportDefinition|null
     */
    public static function definition($reportId)
    {
        return ReportRegistry::get($reportId);
    }
}
