<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ExportHelper — Filename sanitization and download naming helpers.
 */

namespace ReportKit\Core\Export;

/**
 * Filename sanitization and download naming helpers.
 */
class ExportHelper
{
    /**
     * @param string $value
     * @return string
     */
    public function sanitizeFilenamePart($value)
    {
        $safe = preg_replace('/[^A-Za-z0-9]+/', '_', (string) $value);
        $safe = preg_replace('/_+/', '_', $safe);

        return trim($safe, '_');
    }

    /**
     * @param string $value
     * @return string
     */
    public function titleCaseLabel($value)
    {
        $value = trim((string) $value);

        if ($value === '') {
            return '';
        }

        return strtoupper(substr($value, 0, 1)) . strtolower(substr($value, 1));
    }

    /**
     * @param string $value
     * @return string
     */
    public function titleCaseUserType($value)
    {
        return $this->titleCaseLabel($value);
    }

    /**
     * Build a consistent download filename.
     *
     * Keys: prefix, user_type, company_id, company_name, start_date, end_date, extension
     *
     * @param array $parts
     * @return string
     */
    public function buildDownloadFilename(array $parts)
    {
        $chunks = [];

        if (!empty($parts['prefix'])) {
            $chunks[] = $this->sanitizeFilenamePart($parts['prefix']);
        }

        if (!empty($parts['user_type'])) {
            $chunks[] = $this->sanitizeFilenamePart(
                $this->titleCaseLabel($parts['user_type'])
            );
        }

        if (!empty($parts['company_id'])) {
            $companyPart = $this->sanitizeFilenamePart($parts['company_id']);

            if (!empty($parts['company_name'])) {
                $companyPart .= '_' . $this->sanitizeFilenamePart($parts['company_name']);
            }

            $chunks[] = $companyPart;
        } elseif (!empty($parts['company_name'])) {
            $chunks[] = $this->sanitizeFilenamePart($parts['company_name']);
        }

        if (!empty($parts['start_date']) && !empty($parts['end_date'])) {
            $chunks[] = $parts['start_date'] . '_to_' . $parts['end_date'];
        }

        $extension = !empty($parts['extension']) ? ltrim($parts['extension'], '.') : 'csv';

        return implode('_', array_filter($chunks)) . '.' . $extension;
    }

    /**
     * Raise PHP limits for long-running report jobs (host may ignore).
     *
     * @return void
     */
    public function prepareLongRunningReport()
    {
        @ini_set('memory_limit', '1024M');
        @ini_set('max_execution_time', '0');
        @set_time_limit(0);
    }
}
