<?php

namespace ReportKit\Core\Tests\Report;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Report\Report;
use ReportKit\Core\Report\ReportBuilder;
use ReportKit\Core\Report\ReportDefinition;
use ReportKit\Core\Report\ReportRegistry;
use ReportKit\Core\Table\ReportTable;

class ReportRegistryTest extends TestCase
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

    public function testDefineAndGetViaReportFacade()
    {
        $def = Report::define('demo', function (ReportBuilder $r) {
            $r->title('Demo Report')
                ->kicker('DEMO')
                ->subtitle('Sample')
                ->route('admin/demo-report')
                ->filters(array('before' => 'admin.auth'))
                ->service('App\\Services\\Reports\\DemoReportService')
                ->flags(array('datatables', 'kpi' => true, 'excel' => false))
                ->dateRange(array('max_months' => 6))
                ->kpis(array(array('key' => 'rows', 'label' => 'Rows')))
                ->table(ReportTable::make('demoTable'))
                ->meta(array('preset' => 'hybrid'));
        });

        $this->assertInstanceOf('ReportKit\\Core\\Report\\ReportDefinition', $def);
        $this->assertSame($def, Report::get('demo'));
        $this->assertEquals('Demo Report', $def->title);
        $this->assertEquals('admin/demo-report', $def->routePrefix);
        $this->assertEquals('App\\Services\\Reports\\DemoReportService', $def->serviceClass);
        $this->assertTrue($def->hasFlag('datatables'));
        $this->assertTrue($def->hasFlag('kpi'));
        $this->assertFalse($def->hasFlag('excel'));
        $this->assertEquals('hybrid', $def->meta['preset']);
        $this->assertCount(1, Report::all());
    }

    public function testDuplicateSlugOverwrites()
    {
        Report::define('x', function (ReportBuilder $r) {
            $r->title('First');
        });
        Report::define('x', function (ReportBuilder $r) {
            $r->title('Second');
        });
        $this->assertEquals('Second', Report::get('x')->title);
        $this->assertCount(1, Report::all());
    }

    public function testEnabledEndpointSuffixes()
    {
        $def = new ReportDefinition();
        $def->flags = array(
            'datatables' => true,
            'async_prepare' => true,
            'excel' => true,
            'email' => true,
            'kpi' => true,
        );
        $suffixes = $def->enabledEndpointSuffixes();
        $this->assertTrue(in_array('', $suffixes, true));
        $this->assertTrue(in_array('/data', $suffixes, true));
        $this->assertTrue(in_array('/weeks', $suffixes, true));
        $this->assertTrue(in_array('/rows', $suffixes, true));
        $this->assertTrue(in_array('/export', $suffixes, true));
        $this->assertTrue(in_array('/send', $suffixes, true));
        $this->assertTrue(in_array('/summary', $suffixes, true));
    }

    public function testGetMissingReturnsNull()
    {
        $this->assertNull(Report::get('missing'));
    }
}
