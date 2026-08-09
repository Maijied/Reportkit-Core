<?php

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
