<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * SettingsStore — ReportKit contract interface.
 */

namespace ReportKit\Core\Settings;

/**
 * Runtime settings (brand, accents, ceilings) — not report definitions.
 */
interface SettingsStore
{
    /**
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function get($key, $default = null);

    /**
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public function set($key, $value);

    /**
     * @return array
     */
    public function all();
}
