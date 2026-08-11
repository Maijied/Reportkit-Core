<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * BrowserSettingsBuilder — Public-safe subset of reportkit config for browser bootstrap and settings.json.
 */

namespace ReportKit\Core\Settings;

use ReportKit\Core\Report\ReportDefinition;

/**
 * Public-safe subset of reportkit config for browser bootstrap and settings.json.
 */
class BrowserSettingsBuilder
{
    /** @var array */
    protected static $publicSections = array(
        'brand',
        'date',
        'prepare',
        'store',
        'export',
        'mail',
        'notifications',
        'table',
        'design',
        'features',
    );

    /** @var array */
    protected static $loggingPublicKeys = array('enabled', 'panel');

    /**
     * @param array $config Full reportkit config array.
     * @return array
     */
    public static function fromConfig(array $config)
    {
        $out = array();

        foreach (self::$publicSections as $section) {
            if (isset($config[$section]) && is_array($config[$section])) {
                $out[$section] = $config[$section];
            }
        }

        if (isset($config['logging']) && is_array($config['logging'])) {
            $logging = array();

            foreach (self::$loggingPublicKeys as $key) {
                if (array_key_exists($key, $config['logging'])) {
                    $logging[$key] = $config['logging'][$key];
                }
            }

            if ($logging) {
                $out['logging'] = $logging;
            }
        }

        return $out;
    }

    /**
     * Browser payload with optional per-report overrides and flag context.
     *
     * @param array $config Global reportkit config.
     * @param ReportDefinition|null $definition
     * @return array
     */
    public static function forReport(array $config, $definition = null)
    {
        $overrides = array();

        if ($definition instanceof ReportDefinition && !empty($definition->settings)) {
            $overrides = $definition->settings;
        }

        $payload = self::fromConfig(SettingsMerger::merge($config, $overrides));

        if ($definition instanceof ReportDefinition) {
            $payload['report'] = array(
                'id' => $definition->id,
                'flags' => $definition->flags,
            );
            $payload['bundles'] = self::resolveBundles($definition->flags);
        } else {
            $payload['bundles'] = self::resolveBundles(isset($config['features']) ? $config['features'] : array());
        }

        return $payload;
    }

    /**
     * Browser script bundle gates (Phase A3 — flags control JS splits).
     *
     * @param array $flags
     * @return array
     */
    public static function resolveBundles(array $flags)
    {
        return array(
            'core' => true,
            'lldp' => !empty($flags['async_prepare']),
            'datatables' => !empty($flags['datatables']),
            'export' => !empty($flags['excel']) || !empty($flags['csv']) || !empty($flags['pdf']),
            'mail' => !empty($flags['email']),
            'ledger' => !empty($flags['ledger']) || !empty($flags['browse_prepared']),
            'activity_log' => !empty($flags['activity_log']),
        );
    }

    /**
     * @param array $config
     * @return string
     */
    public static function toJson(array $config)
    {
        return self::encode(self::fromConfig($config));
    }

    /**
     * @param array $payload Already filtered browser settings.
     * @return string
     */
    public static function encode(array $payload)
    {
        return json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        );
    }
}
