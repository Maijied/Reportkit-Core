<?php

namespace ReportKit\Core\Tests\Date;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Date\DateRangeChunker;

class DateRangeChunkerTest extends TestCase
{
    /** @var DateRangeChunker */
    private $chunker;

    protected function setUp(): void
    {
        if (method_exists('PHPUnit\\Framework\\TestCase', 'setUp')) {
            parent::setUp();
        }
        $this->chunker = new DateRangeChunker();
    }

    public function testIsValidYmdDateAcceptsValidDates()
    {
        $this->assertTrue($this->chunker->isValidYmdDate('2024-02-29'));
        $this->assertTrue($this->chunker->isValidYmdDate('2024-01-01'));
    }

    public function testIsValidYmdDateRejectsInvalid()
    {
        $this->assertFalse($this->chunker->isValidYmdDate('2023-02-29'));
        $this->assertFalse($this->chunker->isValidYmdDate('01-01-2024'));
        $this->assertFalse($this->chunker->isValidYmdDate(null));
        $this->assertFalse($this->chunker->isValidYmdDate(123));
        $this->assertFalse($this->chunker->isValidYmdDate(''));
    }

    public function testValidateDateRangeOk()
    {
        $this->assertNull($this->chunker->validateDateRange('2024-01-01', '2024-01-31'));
    }

    public function testValidateDateRangeReversed()
    {
        $error = $this->chunker->validateDateRange('2024-02-01', '2024-01-01');
        $this->assertNotNull($error);
        $this->assertStringHas($error, 'earlier');
    }

    public function testValidateDateRangeExceedsMaxMonths()
    {
        $error = $this->chunker->validateDateRange('2024-01-01', '2024-08-01', 6);
        $this->assertNotNull($error);
        $this->assertStringHas($error, '6 months');
    }

    public function testGetWeeklyRangesSingleDay()
    {
        $ranges = $this->chunker->getWeeklyRanges('2024-03-15', '2024-03-15');
        $this->assertCount(1, $ranges);
        $this->assertEquals('2024-03-15', $ranges[0]['start']);
        $this->assertEquals('2024-03-15', $ranges[0]['end']);
    }

    public function testGetWeeklyRangesMultiWeek()
    {
        $ranges = $this->chunker->getWeeklyRanges('2024-01-01', '2024-01-20');
        $this->assertCount(3, $ranges);
        $this->assertEquals('2024-01-01', $ranges[0]['start']);
        $this->assertEquals('2024-01-07', $ranges[0]['end']);
        $this->assertEquals('2024-01-15', $ranges[2]['start']);
        $this->assertEquals('2024-01-20', $ranges[2]['end']);
    }

    public function testGetWeeklyRangesMonthBoundary()
    {
        $ranges = $this->chunker->getWeeklyRanges('2024-01-28', '2024-02-05');
        $this->assertCount(2, $ranges);
        $this->assertEquals('2024-01-28', $ranges[0]['start']);
        $this->assertEquals('2024-02-03', $ranges[0]['end']);
        $this->assertEquals('2024-02-04', $ranges[1]['start']);
        $this->assertEquals('2024-02-05', $ranges[1]['end']);
    }

    public function testValidateWeekWithinRange()
    {
        $this->assertNull($this->chunker->validateWeekWithinRange(
            '2024-01-01',
            '2024-01-31',
            '2024-01-08',
            '2024-01-14'
        ));
        $this->assertNotNull($this->chunker->validateWeekWithinRange(
            '2024-01-01',
            '2024-01-31',
            '2024-01-08',
            null
        ));
        $this->assertNotNull($this->chunker->validateWeekWithinRange(
            '2024-01-01',
            '2024-01-31',
            '2023-12-25',
            '2024-01-01'
        ));
    }

    public function testInclusiveDayCount()
    {
        $this->assertEquals(1, $this->chunker->getInclusiveDayCount('2024-01-01', '2024-01-01'));
        $this->assertEquals(7, $this->chunker->getInclusiveDayCount('2024-01-01', '2024-01-07'));
    }

    /**
     * @param string $haystack
     * @param string $needle
     */
    private function assertStringHas($haystack, $needle)
    {
        if (method_exists($this, 'assertStringContainsString')) {
            $this->assertStringContainsString($needle, $haystack);
            return;
        }
        $this->assertTrue(strpos($haystack, $needle) !== false, "Failed asserting that '$haystack' contains '$needle'");
    }
}
