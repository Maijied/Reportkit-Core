<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ColumnAndReportTableTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Table;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Table\Column;
use ReportKit\Core\Table\ReportTable;

class ColumnAndReportTableTest extends TestCase
{
    public function testColumnFluentBuilder()
    {
        $col = Column::make('status', 'Status')
            ->sortable()
            ->align('center')
            ->badge(array('ok' => 'good'));

        $arr = $col->toArray();
        $this->assertEquals('status', $arr['key']);
        $this->assertEquals('Status', $arr['label']);
        $this->assertTrue($arr['sortable']);
        $this->assertEquals('center', $arr['align']);
        $this->assertEquals(array('ok' => 'good'), $arr['badgeMap']);
    }

    public function testColumnDefaultsLabelToKey()
    {
        $col = Column::make('fare');
        $this->assertEquals('fare', $col->label);
    }

    public function testReportTableFluentBuilder()
    {
        $table = ReportTable::make('demoTable')
            ->title('Demo')
            ->serverSide()
            ->pageLength(50)
            ->lengthMenu(array(10, 50, -1))
            ->columns(array(
                Column::make('id', 'ID'),
                array('key' => 'name', 'label' => 'Name'),
            ));

        $arr = $table->toArray();
        $this->assertEquals('demoTable', $arr['id']);
        $this->assertEquals('Demo', $arr['title']);
        $this->assertTrue($arr['serverSide']);
        $this->assertEquals(50, $arr['pageLength']);
        $this->assertCount(2, $arr['columns']);
        $this->assertEquals('id', $arr['columns'][0]['key']);
        $this->assertEquals('name', $arr['columns'][1]['key']);
    }
}
