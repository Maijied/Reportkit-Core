<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ConfigSettingsMapper — Maps config/reportkit.php arrays into dot-key SettingsStore items.
 */

namespace ReportKit\Core\Settings;

/**
 * Maps config/reportkit.php arrays into dot-key SettingsStore items.
 */
class ConfigSettingsMapper
{
    /**
     * @param array $config
     * @return array
     */
    public static function fromReportkitConfig(array $config)
    {
        $items = array();

        foreach ($config as $section => $value) {
            if (!is_array($value)) {
                $items[$section] = $value;
                continue;
            }

            if (self::isList($value)) {
                $items[$section] = $value;
                continue;
            }

            foreach ($value as $key => $nested) {
                $path = $section . '.' . $key;

                if (is_array($nested) && !self::isList($nested)) {
                    foreach ($nested as $subKey => $subValue) {
                        $items[$path . '.' . $subKey] = $subValue;
                    }
                } else {
                    $items[$path] = $nested;
                }
            }
        }

        return $items;
    }

    /**
     * @param array $value
     * @return bool
     */
    protected static function isList(array $value)
    {
        if ($value === array()) {
            return true;
        }

        return array_keys($value) === range(0, count($value) - 1);
    }
}
