<?php

namespace ReportKit\Core\Tests\Export;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Export\ExportHelper;

class ExportHelperTest extends TestCase
{
    /** @var ExportHelper */
    private $helper;

    protected function setUp(): void
    {
        if (method_exists('PHPUnit\\Framework\\TestCase', 'setUp')) {
            parent::setUp();
        }
        $this->helper = new ExportHelper();
    }

    public function testSanitizeFilenamePart()
    {
        $this->assertEquals('Hello_World', $this->helper->sanitizeFilenamePart('Hello World!'));
        $this->assertEquals('a_b', $this->helper->sanitizeFilenamePart('a___b'));
        $this->assertEquals('', $this->helper->sanitizeFilenamePart('!!!'));
    }

    public function testTitleCaseLabel()
    {
        $this->assertEquals('Agent', $this->helper->titleCaseLabel('AGENT'));
        $this->assertEquals('', $this->helper->titleCaseLabel(''));
    }

    public function testBuildDownloadFilename()
    {
        $name = $this->helper->buildDownloadFilename(array(
            'prefix' => 'Sales Report',
            'user_type' => 'agent',
            'company_id' => 12,
            'company_name' => 'Acme Co',
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-31',
            'extension' => 'xlsx',
        ));

        $this->assertEquals(
            'Sales_Report_Agent_12_Acme_Co_2024-01-01_to_2024-01-31.xlsx',
            $name
        );
    }

    public function testBuildDownloadFilenameDefaultsCsv()
    {
        $name = $this->helper->buildDownloadFilename(array(
            'prefix' => 'demo',
        ));
        $this->assertEquals('demo.csv', $name);
    }

    public function testPrepareLongRunningReportDoesNotThrow()
    {
        $this->helper->prepareLongRunningReport();
        $this->assertTrue(true);
    }
}
