<?php

namespace ReportKit\Core\Tests\Table;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Table\PseudoPaginator;

class PseudoPaginatorTest extends TestCase
{
    /** @var PseudoPaginator */
    private $paginator;

    protected function setUp(): void
    {
        if (method_exists('PHPUnit\\Framework\\TestCase', 'setUp')) {
            parent::setUp();
        }
        $this->paginator = new PseudoPaginator();
    }

    public function testSlicePage()
    {
        $rows = array(array('id' => 1), array('id' => 2), array('id' => 3), array('id' => 4));
        $page = $this->paginator->slice($rows, 1, 2);
        $this->assertCount(2, $page);
        $this->assertEquals(2, $page[0]['id']);
        $this->assertEquals(3, $page[1]['id']);
    }

    public function testSliceNegativeLengthMeansAllRemaining()
    {
        $rows = array(array('id' => 1), array('id' => 2), array('id' => 3));
        $page = $this->paginator->slice($rows, 1, -1);
        $this->assertCount(2, $page);
    }

    public function testSliceZeroLength()
    {
        $rows = array(array('id' => 1), array('id' => 2));
        $page = $this->paginator->slice($rows, 0, 0);
        $this->assertCount(0, $page);
    }

    public function testSliceBeyondCount()
    {
        $rows = array(array('id' => 1));
        $page = $this->paginator->slice($rows, 10, 25);
        $this->assertCount(0, $page);
    }

    public function testDedupeByKey()
    {
        $rows = array(
            array('id' => 1, 'n' => 'a'),
            array('id' => 2, 'n' => 'b'),
            array('id' => 1, 'n' => 'c'),
            array('n' => 'orphan'),
        );
        $unique = $this->paginator->dedupeByKey($rows, 'id');
        $this->assertCount(3, $unique);
        $this->assertEquals('a', $unique[0]['n']);
    }
}
