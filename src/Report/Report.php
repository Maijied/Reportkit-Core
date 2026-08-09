<?php

namespace ReportKit\Core\Report;

/**
 * Static facade-style entry for defining reports without Laravel.
 *
 * Host Laravel adapters may wrap this with a real Facade.
 */
class Report
{
    /**
     * @param string $id
     * @param callable|null $callback
     * @return ReportDefinition
     */
    public static function define($id, $callback = null)
    {
        return ReportRegistry::define($id, $callback);
    }

    /**
     * @param string $id
     * @return ReportDefinition|null
     */
    public static function get($id)
    {
        return ReportRegistry::get($id);
    }

    /**
     * @return ReportDefinition[]
     */
    public static function all()
    {
        return ReportRegistry::all();
    }
}
