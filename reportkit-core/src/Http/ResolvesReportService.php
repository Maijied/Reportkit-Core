<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ResolvesReportService — shared HTTP/controller behavior.
 */

namespace ReportKit\Core\Http;

use ReportKit\Core\Contracts\RowSource;
use ReportKit\Core\Filter\FilterValidator;
use ReportKit\Core\Report\ReportRegistry;
use ReportKit\Core\Settings\ReportSettingsResolver;

/**
 * Resolve registered report services for AJAX handlers (Phase B5).
 */
trait ResolvesReportService
{
    /**
     * @param string $slug
     * @param array $config
     * @return array service|error payload
     */
    protected function resolveReportService($slug, array $config = array())
    {
        $definition = ReportRegistry::get($slug);

        if (!$definition || empty($definition->serviceClass)) {
            return AjaxResponse::error('Unknown report.', 404);
        }

        $serviceClass = $definition->serviceClass;

        if (!class_exists($serviceClass)) {
            return AjaxResponse::error('Report service missing.', 500);
        }

        $service = $this->instantiateReportService($serviceClass);

        if (!$service instanceof RowSource && !method_exists($service, 'getRows')) {
            return AjaxResponse::error('Report service invalid.', 500);
        }

        return array(
            'service' => $service,
            'definition' => $definition,
            'config' => $config,
        );
    }

    /**
     * @param string $serviceClass
     * @return object
     */
    protected function instantiateReportService($serviceClass)
    {
        if (method_exists($this, 'makeReportService')) {
            return $this->makeReportService($serviceClass);
        }

        return new $serviceClass();
    }

    /**
     * @param string $slug
     * @param array $config
     * @return int
     */
    protected function maxMonthsForReport($slug, array $config = array())
    {
        return (int) ReportSettingsResolver::get($slug, $config, 'date.max_months', 6);
    }

    /**
     * @param array $inputs
     * @param int $maxMonths
     * @return array|null error payload or null when valid
     */
    protected function validateReportFilters(array $inputs, $maxMonths)
    {
        $error = (new FilterValidator())->validateDateAndOptionalWeek($inputs, (int) $maxMonths);

        if ($error) {
            return AjaxResponse::error($error, 422);
        }

        return null;
    }
}
