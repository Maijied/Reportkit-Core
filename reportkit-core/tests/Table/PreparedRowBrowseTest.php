<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * PreparedRowBrowseTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Table;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Table\PreparedRowBrowse;
use ReportKit\Core\Table\SummaryBuilder;

class PreparedRowBrowseTest extends TestCase
{
    public function testBrowseReturnsSummaryAndPagedRows()
    {
        $rows = array(
            array('credit_amount' => '100.00', 'debit_amount' => '10.00', 'name' => 'Alpha'),
            array('credit_amount' => '50.00', 'debit_amount' => '5.00', 'name' => 'Beta'),
        );

        $browse = new PreparedRowBrowse();
        $payload = $browse->respond(
            array('draw' => 1, 'start' => 0, 'length' => 1, 'search' => array('value' => '')),
            $rows,
            array('credit_amount', 'debit_amount', 'name')
        );

        $this->assertSame(1, $payload['draw']);
        $this->assertSame(2, $payload['recordsTotal']);
        $this->assertCount(1, $payload['data']);
        $this->assertSame('150.00', $payload['summary']['total_credit']);
        $this->assertSame('15.00', $payload['summary']['total_debit']);
    }

    public function testSummaryBuilderWarningLevel()
    {
        $builder = new SummaryBuilder();
        $summary = $builder->build(array(
            array('credit_amount' => '10', 'debit_amount' => '50'),
        ));

        $this->assertSame('warn', $summary['warning_level']);
    }

    public function testBrowseCapsNegativeLengthAtPageLimitMax()
    {
        $rows = array();
        for ($i = 0; $i < 50; $i++) {
            $rows[] = array('credit_amount' => '1.00', 'debit_amount' => '0.00', 'name' => 'Row ' . $i);
        }

        $browse = new PreparedRowBrowse();
        $payload = $browse->respond(
            array('draw' => 1, 'start' => 0, 'length' => -1),
            $rows,
            array('credit_amount', 'debit_amount', 'name'),
            10
        );

        $this->assertCount(10, $payload['data']);
    }

    public function testBrowsePostPrepareUsesNoSqlContract()
    {
        $browse = new PreparedRowBrowse();
        $payload = $browse->respond(
            array('draw' => 1, 'start' => 0, 'length' => 5),
            array(array('credit_amount' => '10', 'debit_amount' => '1')),
            array('credit_amount', 'debit_amount')
        );

        $this->assertArrayHasKey('summary', $payload);
        $this->assertSame(1, $payload['recordsTotal']);
    }
}
