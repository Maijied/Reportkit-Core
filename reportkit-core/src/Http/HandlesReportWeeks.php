<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * HandlesReportWeeks — shared HTTP/controller behavior.
 */

namespace ReportKit\Core\Http;

/**
 * Weeks / rows / trace AJAX handlers (Phase B5).
 */
trait HandlesReportWeeks
{
    use ResolvesReportService;

    /**
     * @param string $slug
     * @param array $inputs
     * @param array $config
     * @return array
     */
    protected function reportWeeksPayload($slug, array $inputs, array $config = array())
    {
        $resolved = $this->resolveReportService($slug, $config);

        if (isset($resolved['error'])) {
            return $resolved;
        }

        $validation = $this->validateReportFilters(
            $inputs,
            $this->maxMonthsForReport($slug, $config)
        );

        if ($validation !== null) {
            return $validation;
        }

        $service = $resolved['service'];
        $weeks = method_exists($service, 'getWeeks') ? $service->getWeeks($inputs) : array();

        return array('weeks' => is_array($weeks) ? $weeks : array());
    }

    /**
     * @param string $slug
     * @param array $inputs
     * @param array $config
     * @return array
     */
    protected function reportRowsPayload($slug, array $inputs, array $config = array())
    {
        $resolved = $this->resolveReportService($slug, $config);

        if (isset($resolved['error'])) {
            return $resolved;
        }

        $validation = $this->validateReportFilters(
            $inputs,
            $this->maxMonthsForReport($slug, $config)
        );

        if ($validation !== null) {
            return $validation;
        }

        $service = $resolved['service'];
        $rows = method_exists($service, 'getRows') ? $service->getRows($inputs) : array();
        $rows = is_array($rows) ? array_values($rows) : array();

        $shape = 'array';
        if (isset($config['export']['rows_response_shape'])) {
            $shape = $config['export']['rows_response_shape'];
        }

        if ($shape === 'array') {
            return $rows;
        }

        return array(
            'rows' => $rows,
            'count' => count($rows),
        );
    }

    /**
     * @param string $slug
     * @param array $inputs
     * @param array $config
     * @param bool $traceEnabled
     * @return array
     */
    protected function reportTracePayload($slug, array $inputs, array $config = array(), $traceEnabled = false)
    {
        if (!$traceEnabled) {
            return AjaxResponse::error('Trace disabled.', 404);
        }

        $resolved = $this->resolveReportService($slug, $config);

        if (isset($resolved['error'])) {
            return $resolved;
        }

        $service = $resolved['service'];
        $rows = method_exists($service, 'getRows') ? $service->getRows($inputs) : array();
        $trace = method_exists($service, 'getTrace') ? $service->getTrace() : array();

        return array(
            'count' => is_array($rows) ? count($rows) : 0,
            'trace' => is_array($trace) ? $trace : array(),
        );
    }
}
