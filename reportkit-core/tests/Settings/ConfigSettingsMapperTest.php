<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ConfigSettingsMapperTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Settings;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Settings\ConfigSettingsMapper;

class ConfigSettingsMapperTest extends TestCase
{
    public function testFlattensNestedAssocAndPreservesLists()
    {
        $config = array(
            'brand' => array(
                'name' => 'ReportKit',
                'accent' => '#0b7a4b',
            ),
            'table' => array(
                'length_menu' => array(10, 25, 50),
                'default_page_length' => 25,
            ),
            'definitions_path' => 'app/Reports',
        );

        $items = ConfigSettingsMapper::fromReportkitConfig($config);

        $this->assertSame('ReportKit', $items['brand.name']);
        $this->assertSame(array(10, 25, 50), $items['table.length_menu']);
        $this->assertSame('app/Reports', $items['definitions_path']);
    }
}
