<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * AjaxResponseTest — PHPUnit tests.
 */

namespace ReportKit\Core\Tests\Http;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Http\AjaxResponse;

class AjaxResponseTest extends TestCase
{
    public function testErrorShape()
    {
        $payload = AjaxResponse::error('Invalid filter.', 422);

        $this->assertSame('Invalid filter.', $payload['error']);
        $this->assertSame(422, $payload['_status']);
        $this->assertTrue(AjaxResponse::isError($payload));
        $this->assertSame(422, AjaxResponse::status($payload));
    }

    public function testOkShape()
    {
        $payload = AjaxResponse::ok(array('weeks' => array()));

        $this->assertTrue($payload['ok']);
        $this->assertArrayHasKey('weeks', $payload);
        $this->assertFalse(AjaxResponse::isError($payload));
        $this->assertSame(200, AjaxResponse::status($payload));
    }
}
