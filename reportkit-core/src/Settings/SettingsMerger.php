<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * SettingsMerger — Deep-merge report-level settings overrides into global config.
 */

namespace ReportKit\Core\Settings;

/**
 * Deep-merge report-level settings overrides into global config.
 */
class SettingsMerger
{
    /**
     * @param array $base
     * @param array $overrides
     * @return array
     */
    public static function merge(array $base, array $overrides)
    {
        if (!$overrides) {
            return $base;
        }

        return array_replace_recursive($base, $overrides);
    }
}
