<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * SettingsMergerTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Settings;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Report\Report;
use ReportKit\Core\Report\ReportBuilder;
use ReportKit\Core\Report\ReportRegistry;
use ReportKit\Core\Settings\BrowserSettingsBuilder;
use ReportKit\Core\Settings\ReportSettingsResolver;
use ReportKit\Core\Settings\SettingsMerger;

class SettingsMergerTest extends TestCase
{
    protected function setUp(): void
    {
        if (method_exists('PHPUnit\\Framework\\TestCase', 'setUp')) {
            parent::setUp();
        }
        ReportRegistry::flush();
    }

    protected function tearDown(): void
    {
        ReportRegistry::flush();
        if (method_exists('PHPUnit\\Framework\\TestCase', 'tearDown')) {
            parent::tearDown();
        }
    }

    public function testReportSettingsMergeIntoBrowserPayload()
    {
        $global = array(
            'date' => array('max_months' => 6, 'ledger_max_days' => 31),
            'export' => array('excel_soft_max_rows' => 25000),
            'routes' => array('enabled' => true),
        );

        Report::define('ledger', function (ReportBuilder $r) {
            $r->settings(array(
                'date' => array('ledger_max_days' => 14),
            ))->flags(array('async_prepare' => true));
        });

        $def = Report::get('ledger');
        $payload = BrowserSettingsBuilder::forReport($global, $def);

        $this->assertSame(14, $payload['date']['ledger_max_days']);
        $this->assertSame(6, $payload['date']['max_months']);
        $this->assertArrayNotHasKey('routes', $payload);
        $this->assertSame('ledger', $payload['report']['id']);
        $this->assertTrue($payload['report']['flags']['async_prepare']);
    }

    public function testResolverReadsMergedDotPath()
    {
        $global = array('date' => array('max_months' => 6));

        Report::define('billing', function (ReportBuilder $r) {
            $r->settings(array('date' => array('max_months' => 3)));
        });

        $this->assertSame(
            3,
            ReportSettingsResolver::get('billing', $global, 'date.max_months', 6)
        );
    }

    public function testDeepMergePreservesSiblingKeys()
    {
        $merged = SettingsMerger::merge(
            array('export' => array('csv_chunk_rows' => 400, 'pdf_chunk_rows' => 80)),
            array('export' => array('pdf_chunk_rows' => 100))
        );

        $this->assertSame(400, $merged['export']['csv_chunk_rows']);
        $this->assertSame(100, $merged['export']['pdf_chunk_rows']);
    }
}
