<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ActivityLog — fixed-size ring buffer for optional AJAX tails (Phase J).
 */

namespace ReportKit\Core\Logging;

class ActivityLog
{
    /** @var array<int, array<string, mixed>> */
    protected static $buffer = array();

    /** @var int */
    protected static $max = 200;

    /** @var bool */
    protected static $enabled = false;

    /**
     * @param bool $enabled
     * @param int  $max
     */
    public static function configure($enabled, $max)
    {
        self::$enabled = (bool) $enabled;
        self::$max = max(1, (int) $max);
    }

    /**
     * @param string               $category
     * @param string               $message
     * @param array<string, mixed> $meta
     */
    public static function info($category, $message, array $meta = array())
    {
        self::push('info', $category, $message, $meta);
    }

    /**
     * @param string               $category
     * @param string               $message
     * @param array<string, mixed> $meta
     */
    public static function warn($category, $message, array $meta = array())
    {
        self::push('warn', $category, $message, $meta);
    }

    /**
     * @param string               $category
     * @param string               $message
     * @param array<string, mixed> $meta
     */
    public static function error($category, $message, array $meta = array())
    {
        self::push('error', $category, $message, $meta);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function flushToArray()
    {
        return self::$buffer;
    }

    public static function clear()
    {
        self::$buffer = array();
    }

    /**
     * @param string               $level
     * @param string               $category
     * @param string               $message
     * @param array<string, mixed> $meta
     */
    protected static function push($level, $category, $message, array $meta)
    {
        if (!self::$enabled) {
            return;
        }

        self::$buffer[] = array(
            'ts' => gmdate('c'),
            'level' => $level,
            'category' => $category,
            'message' => $message,
            'meta' => $meta,
        );

        if (count(self::$buffer) > self::$max) {
            self::$buffer = array_slice(self::$buffer, -self::$max);
        }
    }
}
