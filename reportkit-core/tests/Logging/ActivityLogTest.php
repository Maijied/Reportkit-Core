<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 */

namespace ReportKit\Core\Tests\Logging;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Logging\ActivityLog;

class ActivityLogTest extends TestCase
{
    protected function setUp(): void
    {
        ActivityLog::configure(false, 200);
        ActivityLog::clear();
    }

    public function testDisabledDoesNotBuffer()
    {
        ActivityLog::info('prepare', 'ignored');
        $this->assertSame(array(), ActivityLog::flushToArray());
    }

    public function testRingBufferRespectsMax()
    {
        ActivityLog::configure(true, 2);
        ActivityLog::info('prepare', 'one');
        ActivityLog::info('prepare', 'two');
        ActivityLog::info('prepare', 'three');
        $entries = ActivityLog::flushToArray();
        $this->assertCount(2, $entries);
        $this->assertSame('two', $entries[0]['message']);
        $this->assertSame('three', $entries[1]['message']);
    }
}
