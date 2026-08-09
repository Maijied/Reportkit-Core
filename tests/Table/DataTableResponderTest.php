<?php

namespace ReportKit\Core\Tests\Table;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Table\DataTableResponder;

class DataTableResponderTest extends TestCase
{
    public function testRespondBasic()
    {
        $responder = new DataTableResponder();
        $payload = $responder->respond(
            array('draw' => '3'),
            array(array('id' => 1)),
            100,
            50
        );

        $this->assertEquals(3, $payload['draw']);
        $this->assertEquals(100, $payload['recordsTotal']);
        $this->assertEquals(50, $payload['recordsFiltered']);
        $this->assertEquals(array(array('id' => 1)), $payload['data']);
        $this->assertFalse(isset($payload['summary']));
    }

    public function testRespondDefaultsFilteredAndSummary()
    {
        $responder = new DataTableResponder();
        $payload = $responder->respond(
            array(),
            array(),
            10,
            null,
            array('total' => 99)
        );

        $this->assertEquals(0, $payload['draw']);
        $this->assertEquals(10, $payload['recordsFiltered']);
        $this->assertEquals(array('total' => 99), $payload['summary']);
    }
}
