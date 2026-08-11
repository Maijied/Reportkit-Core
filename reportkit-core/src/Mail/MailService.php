<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * MailService — Email export validation + ZIP attachment builder (Phase B1).
 */

namespace ReportKit\Core\Mail;

use ReportKit\Core\Export\ExportHelper;

/**
 * Email export validation + ZIP attachment builder (Phase B1).
 *
 * Adapters dispatch mail; this class validates and builds attachments only.
 */
class MailService
{
    /** Hard ceiling for the final attachment (bytes). */
    const HARD_ATTACH_MAX_BYTES = 26214400;

    /** RFC practical max local@domain length. */
    const EMAIL_MAX_LENGTH = 254;

    /** @var ExportHelper */
    protected $exportHelper;

    public function __construct(ExportHelper $exportHelper = null)
    {
        $this->exportHelper = $exportHelper ?: new ExportHelper();
    }

    /**
     * @param string $email
     * @param int $maxLength
     * @return array
     */
    public function assessEmail($email, $maxLength = 254)
    {
        $email = trim((string) $email);
        $maxLength = (int) $maxLength;

        if ($email === '') {
            return array('ok' => false, 'error' => 'Email is required.');
        }

        if (strlen($email) > $maxLength) {
            return array('ok' => false, 'error' => 'Email is too long.');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return array('ok' => false, 'error' => 'Invalid email format.');
        }

        $typo = $this->detectCommonTypo($email);

        if ($typo) {
            return array('ok' => false, 'error' => 'Did you mean ' . $typo . '?', 'suggestion' => $typo);
        }

        return array('ok' => true, 'email' => $email);
    }

    /**
     * Parse php.ini size values (e.g. 40M, 2K) to bytes.
     *
     * @param mixed $value
     * @return int
     */
    public static function parseIniBytes($value)
    {
        $value = trim((string) $value);

        if ($value === '' || $value === '-1') {
            return PHP_INT_MAX;
        }

        $last = strtolower(substr($value, -1));
        $number = (float) $value;

        if ($last === 'g') {
            return (int) round($number * 1073741824);
        }

        if ($last === 'm') {
            return (int) round($number * 1048576);
        }

        if ($last === 'k') {
            return (int) round($number * 1024);
        }

        return (int) $number;
    }

    /**
     * Effective upload ceiling (min of mail cap and PHP ini limits).
     *
     * @return int
     */
    public static function resolveMaxUploadBytes()
    {
        return (int) min(
            self::HARD_ATTACH_MAX_BYTES,
            self::parseIniBytes(ini_get('upload_max_filesize')),
            self::parseIniBytes(ini_get('post_max_size'))
        );
    }

    /**
     * @param int $bytes
     * @return string
     */
    public static function formatBytesLabel($bytes)
    {
        $bytes = (int) $bytes;

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }

        return $bytes . ' B';
    }

    /**
     * @return string
     */
    public static function resolveMissingUploadError()
    {
        $contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
        $postMax = self::parseIniBytes(ini_get('post_max_size'));

        if ($contentLength > 0 && $postMax > 0 && $postMax < PHP_INT_MAX && $contentLength > $postMax) {
            return 'Request body exceeds server limit (post_max_size ' . ini_get('post_max_size') .
                '). Try a shorter date range or download CSV instead.';
        }

        return 'Report file is required.';
    }

    /**
     * Validate multipart upload before email checks (LLDP Deliver).
     *
     * Accepts Symfony UploadedFile, Laravel UploadedFile-like objects, or $_FILES-shaped arrays.
     *
     * @param mixed $upload
     * @return array
     */
    public function validateUploadedReportFile($upload)
    {
        if ($upload === null || $upload === '') {
            return array(
                'ok' => false,
                'message' => self::resolveMissingUploadError(),
                'code' => 400,
            );
        }

        if (is_array($upload)) {
            $error = isset($upload['error']) ? (int) $upload['error'] : UPLOAD_ERR_NO_FILE;
            $size = isset($upload['size']) ? (int) $upload['size'] : 0;

            if ($error !== UPLOAD_ERR_OK) {
                return array(
                    'ok' => false,
                    'message' => $this->uploadErrorMessageFromCode($error),
                    'code' => 400,
                );
            }

            if ($size <= 0) {
                return array(
                    'ok' => false,
                    'message' => 'Report file is required.',
                    'code' => 400,
                );
            }

            if ($size > self::resolveMaxUploadBytes()) {
                return array(
                    'ok' => false,
                    'message' => 'Attachment exceeds server upload limit (max ' .
                        ini_get('upload_max_filesize') . ').',
                    'code' => 400,
                );
            }

            return array('ok' => true, 'file' => $upload, 'size' => $size);
        }

        if (is_object($upload) && method_exists($upload, 'isValid')) {
            if (!$upload->isValid()) {
                $code = method_exists($upload, 'getError') ? (int) $upload->getError() : UPLOAD_ERR_NO_FILE;

                return array(
                    'ok' => false,
                    'message' => $this->uploadErrorMessageFromCode($code),
                    'code' => 400,
                );
            }

            $size = method_exists($upload, 'getSize') ? (int) $upload->getSize() : 0;

            if ($size > self::resolveMaxUploadBytes()) {
                return array(
                    'ok' => false,
                    'message' => 'Attachment exceeds server upload limit (max ' .
                        ini_get('upload_max_filesize') . ').',
                    'code' => 400,
                );
            }

            return array('ok' => true, 'file' => $upload, 'size' => $size);
        }

        return array(
            'ok' => false,
            'message' => self::resolveMissingUploadError(),
            'code' => 400,
        );
    }

    /**
     * @param int $code UPLOAD_ERR_* constant
     * @return string
     */
    public function uploadErrorMessageFromCode($code)
    {
        $maxUpload = ini_get('upload_max_filesize');
        $code = (int) $code;

        switch ($code) {
            case UPLOAD_ERR_INI_SIZE:
                return 'Attachment exceeds server upload limit (max ' . $maxUpload .
                    '). Try a shorter date range or download CSV instead.';
            case UPLOAD_ERR_FORM_SIZE:
                return 'Attachment exceeds form upload limit. Try a shorter date range or download CSV instead.';
            case UPLOAD_ERR_PARTIAL:
                return 'Upload was interrupted. Please try again.';
            case UPLOAD_ERR_NO_FILE:
                return 'Report file is required.';
            case UPLOAD_ERR_NO_TMP_DIR:
            case UPLOAD_ERR_CANT_WRITE:
            case UPLOAD_ERR_EXTENSION:
                return 'Server could not accept the upload. Please contact support or download CSV instead.';
            default:
                return 'Report file is required.';
        }
    }

    /**
     * @param mixed $upload object with getError() or array with error key
     * @return string
     */
    public function uploadErrorMessage($upload)
    {
        if (is_object($upload) && method_exists($upload, 'getError')) {
            return $this->uploadErrorMessageFromCode((int) $upload->getError());
        }

        if (is_array($upload) && isset($upload['error'])) {
            return $this->uploadErrorMessageFromCode((int) $upload['error']);
        }

        return 'Report file is required.';
    }

    /**
     * Optional DNS MX check when available on host.
     *
     * @param string $email
     * @return array
     */
    public function assessDns($email)
    {
        $assessment = $this->assessEmail($email);

        if (!$assessment['ok']) {
            return $assessment;
        }

        if (!function_exists('checkdnsrr')) {
            return array('ok' => true, 'skipped' => true, 'email' => $assessment['email']);
        }

        $domain = substr(strrchr($assessment['email'], '@'), 1);

        if ($domain === false || $domain === '') {
            return array('ok' => false, 'error' => 'Invalid email domain.');
        }

        if (!@checkdnsrr($domain, 'MX') && !@checkdnsrr($domain, 'A')) {
            return array('ok' => false, 'error' => 'Email domain could not be verified.');
        }

        return array('ok' => true, 'email' => $assessment['email']);
    }

    /**
     * @param array $rows
     * @param array $columns list of keys or ['key'=>,'label'=>]
     * @return array
     */
    public function buildCsvContent(array $rows, array $columns = array())
    {
        if (!$columns && !empty($rows[0]) && is_array($rows[0])) {
            $columns = array_keys($rows[0]);
        }

        $normalized = array();

        foreach ($columns as $col) {
            if (is_array($col) && isset($col['key'])) {
                $normalized[] = array(
                    'key' => $col['key'],
                    'label' => isset($col['label']) ? $col['label'] : $col['key'],
                );
            } else {
                $normalized[] = array('key' => (string) $col, 'label' => (string) $col);
            }
        }

        $lines = array();
        $header = array();

        foreach ($normalized as $col) {
            $header[] = $this->escapeCsv($col['label']);
        }

        $lines[] = implode(',', $header);

        foreach ($rows as $row) {
            $row = (array) $row;
            $cells = array();

            foreach ($normalized as $col) {
                $key = $col['key'];
                $cells[] = $this->escapeCsv(isset($row[$key]) ? $row[$key] : '');
            }

            $lines[] = implode(',', $cells);
        }

        $content = implode("\r\n", $lines);

        return array(
            'ok' => true,
            'content' => $content,
            'bytes' => strlen($content),
        );
    }

    /**
     * @param string $filename
     * @param string $content
     * @return array
     */
    public function buildZipBytes($filename, $content)
    {
        if (!class_exists('ZipArchive')) {
            return array('ok' => false, 'error' => 'ZipArchive extension is not available.');
        }

        $zip = new \ZipArchive();
        $tmp = tempnam(sys_get_temp_dir(), 'rkzip');

        if ($tmp === false) {
            return array('ok' => false, 'error' => 'Could not create temporary file.');
        }

        $opened = $zip->open($tmp, \ZipArchive::OVERWRITE);

        if ($opened !== true) {
            @unlink($tmp);

            return array('ok' => false, 'error' => 'Could not open ZIP archive.');
        }

        $zip->addFromString($filename, $content);
        $zip->close();

        $bytes = file_get_contents($tmp);
        @unlink($tmp);

        if ($bytes === false) {
            return array('ok' => false, 'error' => 'Could not read ZIP archive.');
        }

        return array(
            'ok' => true,
            'bytes' => $bytes,
            'size' => strlen($bytes),
            'filename' => preg_replace('/\.zip$/i', '', $filename) . '.zip',
        );
    }

    /**
     * Build a send plan for host mailer dispatch.
     *
     * @param array $options
     * @return array
     */
    public function planSend(array $options)
    {
        $maxLength = isset($options['email_max_length']) ? (int) $options['email_max_length'] : 254;
        $emailCheck = $this->assessEmail(isset($options['email']) ? $options['email'] : '', $maxLength);

        if (!$emailCheck['ok']) {
            return $emailCheck;
        }

        if (!empty($options['dns_check'])) {
            $dns = $this->assessDns($emailCheck['email']);

            if (!$dns['ok']) {
                return $dns;
            }
        }

        $rows = isset($options['rows']) && is_array($options['rows']) ? $options['rows'] : array();

        if (!$rows) {
            return array('ok' => false, 'error' => 'No prepared rows to send.');
        }

        $columns = isset($options['columns']) && is_array($options['columns']) ? $options['columns'] : array();
        $csv = $this->buildCsvContent($rows, $columns);

        if (!$csv['ok']) {
            return $csv;
        }

        $maxBytes = isset($options['hard_attach_max_bytes']) ? (int) $options['hard_attach_max_bytes'] : 26214400;
        $useZip = !isset($options['zip']) || $options['zip'];

        $baseName = $this->exportHelper->buildDownloadFilename(array(
            'prefix' => isset($options['prefix']) ? $options['prefix'] : 'report',
            'start_date' => isset($options['start_date']) ? $options['start_date'] : null,
            'end_date' => isset($options['end_date']) ? $options['end_date'] : null,
            'extension' => 'csv',
        ));

        if ($useZip) {
            $zip = $this->buildZipBytes($baseName . '.zip', $csv['content']);

            if (!$zip['ok']) {
                return $zip;
            }

            if ($zip['size'] > $maxBytes) {
                return array('ok' => false, 'error' => 'Attachment exceeds maximum size.');
            }

            return array(
                'ok' => true,
                'email' => $emailCheck['email'],
                'attachment' => array(
                    'filename' => $zip['filename'],
                    'mime' => 'application/zip',
                    'bytes' => $zip['bytes'],
                    'size' => $zip['size'],
                ),
                'row_count' => count($rows),
            );
        }

        if ($csv['bytes'] > $maxBytes) {
            return array('ok' => false, 'error' => 'Attachment exceeds maximum size.');
        }

        return array(
            'ok' => true,
            'email' => $emailCheck['email'],
            'attachment' => array(
                'filename' => $baseName,
                'mime' => 'text/csv',
                'bytes' => $csv['content'],
                'size' => $csv['bytes'],
            ),
            'row_count' => count($rows),
        );
    }

    /**
     * @param mixed $value
     * @return string
     */
    protected function escapeCsv($value)
    {
        $text = $value === null ? '' : (string) $value;

        if (strpos($text, '"') !== false || strpos($text, ',') !== false || strpos($text, "\n") !== false) {
            return '"' . str_replace('"', '""', $text) . '"';
        }

        return $text;
    }

    /**
     * @param string $email
     * @return string|null
     */
    protected function detectCommonTypo($email)
    {
        $map = array(
            '@gmial.com' => '@gmail.com',
            '@gmai.com' => '@gmail.com',
            '@yahooo.com' => '@yahoo.com',
            '@hotmial.com' => '@hotmail.com',
        );

        foreach ($map as $bad => $good) {
            if (substr($email, -strlen($bad)) === $bad) {
                return substr($email, 0, -strlen($bad)) . $good;
            }
        }

        return null;
    }
}
