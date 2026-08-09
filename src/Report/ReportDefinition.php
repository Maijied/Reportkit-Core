<?php

namespace ReportKit\Core\Report;

/**
 * Immutable-ish report definition built via ReportBuilder.
 */
class ReportDefinition
{
    /** @var string */
    public $id;

    /** @var string */
    public $title = 'Report';

    /** @var string */
    public $kicker = 'REPORT';

    /** @var string */
    public $subtitle = '';

    /** @var string */
    public $routePrefix = '';

    /** @var array */
    public $routeFilters = [];

    /** @var string|null */
    public $serviceClass;

    /** @var array */
    public $flags = [];

    /** @var array */
    public $dateRange = [];

    /** @var array */
    public $kpis = [];

    /** @var array */
    public $tables = [];

    /** @var array */
    public $meta = [];

    /**
     * @param string $flag
     * @return bool
     */
    public function hasFlag($flag)
    {
        return !empty($this->flags[$flag]);
    }

    /**
     * @return array
     */
    public function enabledEndpointSuffixes()
    {
        $suffixes = [''];

        if ($this->hasFlag('datatables')) {
            $suffixes[] = '/data';
        }

        if ($this->hasFlag('async_prepare')) {
            $suffixes[] = '/weeks';
            $suffixes[] = '/rows';
        }

        if ($this->hasFlag('excel') || $this->hasFlag('csv') || $this->hasFlag('pdf')) {
            $suffixes[] = '/export';
        }

        if ($this->hasFlag('email')) {
            $suffixes[] = '/send';
        }

        if ($this->hasFlag('kpi')) {
            $suffixes[] = '/summary';
        }

        return $suffixes;
    }
}
