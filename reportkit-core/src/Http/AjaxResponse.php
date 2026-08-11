<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * AjaxResponse — Standard AJAX JSON shapes for report endpoints (Phase B4).
 */

namespace ReportKit\Core\Http;

/**
 * Standard AJAX JSON shapes for report endpoints (Phase B4).
 */
class AjaxResponse
{
    /**
     * @param string $message
     * @param int $status
     * @return array
     */
    public static function error($message, $status = 422)
    {
        return array(
            'error' => (string) $message,
            '_status' => (int) $status,
        );
    }

    /**
     * @param array $payload
     * @return array
     */
    public static function ok(array $payload = array())
    {
        return array_merge(array('ok' => true), $payload);
    }

    /**
     * @param array $payload
     * @return bool
     */
    public static function isError(array $payload)
    {
        return isset($payload['error']) || (isset($payload['_status']) && (int) $payload['_status'] >= 400);
    }

    /**
     * @param array $payload
     * @return int
     */
    public static function status(array $payload)
    {
        return isset($payload['_status']) ? (int) $payload['_status'] : 200;
    }
}
