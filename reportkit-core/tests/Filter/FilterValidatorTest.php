<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * FilterValidatorTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Filter;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Filter\FilterValidator;

class FilterValidatorTest extends TestCase
{
    /** @var FilterValidator */
    private $validator;

    protected function setUp(): void
    {
        if (method_exists('PHPUnit\\Framework\\TestCase', 'setUp')) {
            parent::setUp();
        }
        $this->validator = new FilterValidator();
    }

    public function testRequireKeysMissing()
    {
        $error = $this->validator->requireKeys(array('a' => '1'), array('a', 'b'));
        $this->assertNotNull($error);
    }

    public function testRequireKeysOk()
    {
        $this->assertNull($this->validator->requireKeys(
            array('a' => '1', 'b' => '2'),
            array('a', 'b')
        ));
    }

    public function testRequireEnumWhitelist()
    {
        $this->assertNull($this->validator->requireEnum('excel', array('excel', 'csv'), 'bad'));
        $this->assertNotNull($this->validator->requireEnum('pdf', array('excel', 'csv'), 'bad'));
        $this->assertNull($this->validator->requireEnum('', array('excel'), 'bad', true));
        $this->assertNotNull($this->validator->requireEnum('', array('excel'), 'bad', false));
    }

    public function testRequirePositiveIntId()
    {
        $this->assertNull($this->validator->requirePositiveIntId(5));
        $this->assertNotNull($this->validator->requirePositiveIntId(0));
        $this->assertNotNull($this->validator->requirePositiveIntId(''));
        $this->assertNotNull($this->validator->requirePositiveIntId(null));
    }

    public function testValidateDateAndOptionalWeek()
    {
        $this->assertNull($this->validator->validateDateAndOptionalWeek(array(
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-15',
        )));

        $error = $this->validator->validateDateAndOptionalWeek(array(
            'start_date' => 'not-a-date',
            'end_date' => '2024-01-15',
        ));
        $this->assertNotNull($error);

        $this->assertNull($this->validator->validateDateAndOptionalWeek(array(
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-31',
            'week_start' => '2024-01-08',
            'week_end' => '2024-01-14',
        )));
    }

    public function testGetDateRangeChunker()
    {
        $this->assertInstanceOf('ReportKit\\Core\\Date\\DateRangeChunker', $this->validator->getDateRangeChunker());
    }
}
