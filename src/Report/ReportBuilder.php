<?php

namespace ReportKit\Core\Report;

/**
 * Fluent builder for ReportDefinition.
 *
 * Usage:
 *   Report::define('demo', function (ReportBuilder $r) { $r->title('Demo'); });
 */
class ReportBuilder
{
    /** @var ReportDefinition */
    private $definition;

    public function __construct($id)
    {
        $this->definition = new ReportDefinition();
        $this->definition->id = (string) $id;
    }

    /**
     * @param string $title
     * @return $this
     */
    public function title($title)
    {
        $this->definition->title = (string) $title;

        return $this;
    }

    /**
     * @param string $kicker
     * @return $this
     */
    public function kicker($kicker)
    {
        $this->definition->kicker = (string) $kicker;

        return $this;
    }

    /**
     * @param string $subtitle
     * @return $this
     */
    public function subtitle($subtitle)
    {
        $this->definition->subtitle = (string) $subtitle;

        return $this;
    }

    /**
     * Route prefix without leading slash, e.g. admin/demo-report
     *
     * @param string $route
     * @return $this
     */
    public function route($route)
    {
        $this->definition->routePrefix = trim((string) $route, '/');

        return $this;
    }

    /**
     * Host-framework route filters / middleware map.
     * L4.1 example: ['before' => 'admin.auth']
     *
     * @param array $filters
     * @return $this
     */
    public function filters(array $filters)
    {
        $this->definition->routeFilters = $filters;

        return $this;
    }

    /**
     * @param string $class
     * @return $this
     */
    public function service($class)
    {
        $this->definition->serviceClass = (string) $class;

        return $this;
    }

    /**
     * Accepts list of flag names or associative map flag => bool.
     *
     * @param array $flags
     * @return $this
     */
    public function flags(array $flags)
    {
        $normalized = [];

        foreach ($flags as $key => $value) {
            if (is_int($key)) {
                $normalized[(string) $value] = true;
            } else {
                $normalized[(string) $key] = (bool) $value;
            }
        }

        $this->definition->flags = $normalized;

        return $this;
    }

    /**
     * @param array $config
     * @return $this
     */
    public function dateRange(array $config)
    {
        $this->definition->dateRange = $config;

        return $this;
    }

    /**
     * @param array $kpis
     * @return $this
     */
    public function kpis(array $kpis)
    {
        $this->definition->kpis = $kpis;

        return $this;
    }

    /**
     * @param mixed $table ReportTable or array definition
     * @return $this
     */
    public function table($table)
    {
        $this->definition->tables[] = $table;

        return $this;
    }

    /**
     * @param array $meta
     * @return $this
     */
    public function meta(array $meta)
    {
        $this->definition->meta = array_merge($this->definition->meta, $meta);

        return $this;
    }

    /**
     * @return ReportDefinition
     */
    public function getDefinition()
    {
        return $this->definition;
    }
}
