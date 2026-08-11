<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ArraySettingsStoreTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Settings;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Settings\ArraySettingsStore;

class ArraySettingsStoreTest extends TestCase
{
    public function testGetSetAll()
    {
        $store = new ArraySettingsStore(array('brand' => 'ReportKit'));
        $this->assertEquals('ReportKit', $store->get('brand'));
        $this->assertEquals('fallback', $store->get('missing', 'fallback'));
        $this->assertNull($store->get('missing'));

        $store->set('accent', '#123');
        $this->assertEquals('#123', $store->get('accent'));
        $all = $store->all();
        $this->assertEquals('ReportKit', $all['brand']);
        $this->assertEquals('#123', $all['accent']);
    }
}
