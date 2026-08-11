<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * PseudoPaginatorTest — ReportKit core component.
 */

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
        $this->assertEquals('b', $unique[1]['n']);
        $this->assertEquals('orphan', $unique[2]['n']);
    }

    public function testSortByDescStable()
    {
        $rows = array(
            array('id' => 1, 'v' => 10),
            array('id' => 2, 'v' => 30),
            array('id' => 3, 'v' => 20),
        );
        $sorted = $this->paginator->sortBy($rows, 'v', 'desc');
        $this->assertEquals(30, $sorted[0]['v']);
        $this->assertEquals(20, $sorted[1]['v']);
        $this->assertEquals(10, $sorted[2]['v']);
    }

    public function testSearchBy()
    {
        $rows = array(
            array('operator' => 'Hanif', 'route' => 'DHK-CTG'),
            array('operator' => 'Green Line', 'route' => 'DHK-SYL'),
        );
        $found = $this->paginator->searchBy($rows, 'hanif', array('operator', 'route'));
        $this->assertCount(1, $found);
        $this->assertEquals('Hanif', $found[0]['operator']);
    }
}

