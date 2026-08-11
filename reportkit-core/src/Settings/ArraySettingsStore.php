<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ArraySettingsStore — In-memory settings store (tests + default).
 */

namespace ReportKit\Core\Settings;

/**
 * In-memory settings store (tests + default).
 */
class ArraySettingsStore implements SettingsStore
{
    /** @var array */
    private $items = [];

    public function __construct(array $items = [])
    {
        $this->items = $items;
    }

    public function get($key, $default = null)
    {
        return array_key_exists($key, $this->items) ? $this->items[$key] : $default;
    }

    public function set($key, $value)
    {
        $this->items[$key] = $value;
    }

    public function all()
    {
        return $this->items;
    }
}
