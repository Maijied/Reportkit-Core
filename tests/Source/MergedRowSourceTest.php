<?php

namespace ReportKit\Core\Tests\Source;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Source\ArrayRowSource;
use ReportKit\Core\Source\MergedRowSource;

class MergedRowSourceTest extends TestCase
{
    public function testMergeDedupeAndOrder()
    {
        $live = new ArrayRowSource(array(
            array('trip_id' => 'T1', 'booked_at' => '2026-01-02', 'src' => 'live'),
            array('trip_id' => 'T2', 'booked_at' => '2026-01-03', 'src' => 'live'),
        ));
        $archive = new ArrayRowSource(array(
            array('trip_id' => 'T1', 'booked_at' => '2026-01-02', 'src' => 'archive'),
            array('trip_id' => 'T0', 'booked_at' => '2025-12-01', 'src' => 'archive'),
        ));

        $merged = new MergedRowSource(array($live, $archive), 'trip_id', 'booked_at', 'desc');
        $rows = $merged->getRows(array());

        $this->assertCount(3, $rows);
        $this->assertEquals('T2', $rows[0]['trip_id']);
        $this->assertEquals('live', $rows[1]['src']); // T1 keeps live
        $this->assertEquals('T0', $rows[2]['trip_id']);

        $trace = $merged->getTrace();
        $this->assertEquals(4, $trace['merged']);
        $this->assertEquals(3, $trace['deduped']);
        $this->assertEquals(1, $trace['dropped']);
    }

    public function testFluentBuilders()
    {
        $a = new ArrayRowSource(array(array('id' => 1, 'n' => 'a')));
        $b = new ArrayRowSource(array(array('id' => 1, 'n' => 'b'), array('id' => 2, 'n' => 'c')));
        $merged = (new MergedRowSource(array($a, $b)))->dedupeBy('id')->orderBy('id', 'asc');
        $rows = $merged->getRows(array());
        $this->assertCount(2, $rows);
        $this->assertEquals('a', $rows[0]['n']);
    }
}
