<?php

namespace ReportKit\Core\Report;

/**
 * In-memory registry of report definitions.
 */
class ReportRegistry
{
    /** @var ReportDefinition[] */
    private static $definitions = [];

    /**
     * @param string $id
     * @param callable|null $callback function (ReportBuilder $builder)
     * @return ReportDefinition
     */
    public static function define($id, $callback = null)
    {
        $builder = new ReportBuilder($id);

        if (is_callable($callback)) {
            call_user_func($callback, $builder);
        }

        $definition = $builder->getDefinition();
        self::$definitions[$definition->id] = $definition;

        return $definition;
    }

    /**
     * @param string $id
     * @return ReportDefinition|null
     */
    public static function get($id)
    {
        return isset(self::$definitions[$id]) ? self::$definitions[$id] : null;
    }

    /**
     * @return ReportDefinition[]
     */
    public static function all()
    {
        return self::$definitions;
    }

    /**
     * @return void
     */
    public static function flush()
    {
        self::$definitions = [];
    }
}
