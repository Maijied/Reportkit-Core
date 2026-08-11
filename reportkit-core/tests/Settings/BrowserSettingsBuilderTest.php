<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * BrowserSettingsBuilderTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Settings;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Settings\BrowserSettingsBuilder;

class BrowserSettingsBuilderTest extends TestCase
{
    public function testIncludesPublicSectionsAndStripsSecrets()
    {
        $config = array(
            'brand' => array('name' => 'ReportKit', 'accent' => '#0b7a4b'),
            'export' => array('excel_soft_max_rows' => 25000),
            'routes' => array('enabled' => true, 'prefix' => 'secret-ish'),
            'definitions_path' => 'app/Reports',
            'logging' => array(
                'enabled' => true,
                'panel' => 'local',
                'redact' => array('password'),
                'buffer_max' => 200,
            ),
        );

        $browser = BrowserSettingsBuilder::fromConfig($config);

        $this->assertSame('ReportKit', $browser['brand']['name']);
        $this->assertSame(25000, $browser['export']['excel_soft_max_rows']);
        $this->assertArrayNotHasKey('routes', $browser);
        $this->assertArrayNotHasKey('definitions_path', $browser);
        $this->assertSame(true, $browser['logging']['enabled']);
        $this->assertSame('local', $browser['logging']['panel']);
        $this->assertArrayNotHasKey('redact', $browser['logging']);
        $this->assertArrayNotHasKey('buffer_max', $browser['logging']);
    }

    public function testResolveBundlesFromFlags()
    {
        $bundles = BrowserSettingsBuilder::resolveBundles(array(
            'async_prepare' => true,
            'datatables' => false,
            'excel' => true,
            'csv' => false,
            'pdf' => true,
            'email' => true,
            'ledger' => false,
            'browse_prepared' => true,
            'activity_log' => true,
        ));

        $this->assertTrue($bundles['core']);
        $this->assertTrue($bundles['lldp']);
        $this->assertFalse($bundles['datatables']);
        $this->assertTrue($bundles['export']);
        $this->assertTrue($bundles['mail']);
        $this->assertTrue($bundles['ledger']);
        $this->assertTrue($bundles['activity_log']);
    }
}
