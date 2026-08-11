<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * HandlesReportSend — shared HTTP/controller behavior.
 */

namespace ReportKit\Core\Http;

use ReportKit\Core\Mail\MailService;
use ReportKit\Core\Settings\ReportSettingsResolver;

/**
 * POST send endpoint handler — builds ZIP plan from prepared rows (Phase B5).
 */
trait HandlesReportSend
{
    use ResolvesReportService;
    use HandlesReportBrowse;

    /**
     * @param string $slug
     * @param array $inputs
     * @param array $config
     * @param array $sessionRows optional prepared rows from session
     * @return array
     */
    protected function reportSendPayload($slug, array $inputs, array $config = array(), array $sessionRows = array())
    {
        if (empty($config['mail_enabled']) && isset($config['mail']['enabled'])) {
            $config['mail_enabled'] = $config['mail']['enabled'];
        }

        if (isset($config['mail_enabled']) && !$config['mail_enabled']) {
            return AjaxResponse::error('Email export is disabled.', 403);
        }

        $resolved = $this->resolveReportService($slug, $config);

        if (isset($resolved['error'])) {
            return $resolved;
        }

        $email = isset($inputs['email']) ? $inputs['email'] : '';
        $rows = $sessionRows;

        if (!$rows && !empty($inputs['rows']) && is_array($inputs['rows'])) {
            $rows = $inputs['rows'];
        }

        $maxBytes = (int) ReportSettingsResolver::get(
            $slug,
            $config,
            'mail.hard_attach_max_bytes',
            isset($config['mail']['hard_attach_max_bytes']) ? $config['mail']['hard_attach_max_bytes'] : 26214400
        );
        $maxEmailLen = (int) ReportSettingsResolver::get(
            $slug,
            $config,
            'mail.email_max_length',
            254
        );
        $dnsCheck = (bool) ReportSettingsResolver::get($slug, $config, 'mail.dns_check', false);

        $mail = new MailService();
        $plan = $mail->planSend(array(
            'email' => $email,
            'rows' => $rows,
            'columns' => $this->browseColumnKeys($resolved['definition']),
            'prefix' => $slug,
            'start_date' => isset($inputs['start_date']) ? $inputs['start_date'] : null,
            'end_date' => isset($inputs['end_date']) ? $inputs['end_date'] : null,
            'hard_attach_max_bytes' => $maxBytes,
            'email_max_length' => $maxEmailLen,
            'dns_check' => $dnsCheck,
            'zip' => true,
        ));

        if (empty($plan['ok'])) {
            return array(
                'ok' => false,
                'error' => isset($plan['error']) ? $plan['error'] : 'Send failed.',
                '_status' => 422,
            );
        }

        return array(
            'ok' => true,
            'message' => 'Send plan ready.',
            'email' => $plan['email'],
            'row_count' => $plan['row_count'],
            'attachment' => array(
                'filename' => $plan['attachment']['filename'],
                'mime' => $plan['attachment']['mime'],
                'size' => $plan['attachment']['size'],
            ),
            '_mail_plan' => $plan,
        );
    }

    /**
     * LLDP Deliver — validate multipart file upload before email (file-before-email order).
     *
     * @param string $slug
     * @param array $inputs
     * @param array $config
     * @param mixed $upload Symfony/Laravel UploadedFile or $_FILES-shaped array
     * @return array
     */
    protected function reportSendFromUpload($slug, array $inputs, array $config = array(), $upload = null)
    {
        if (empty($config['mail_enabled']) && isset($config['mail']['enabled'])) {
            $config['mail_enabled'] = $config['mail']['enabled'];
        }

        if (isset($config['mail_enabled']) && !$config['mail_enabled']) {
            return AjaxResponse::error('Email export is disabled.', 403);
        }

        $resolved = $this->resolveReportService($slug, $config);

        if (isset($resolved['error'])) {
            return $resolved;
        }

        $mail = new MailService();
        $fileCheck = $mail->validateUploadedReportFile($upload);

        if (empty($fileCheck['ok'])) {
            return AjaxResponse::error(
                isset($fileCheck['message']) ? $fileCheck['message'] : 'Invalid upload.',
                isset($fileCheck['code']) ? (int) $fileCheck['code'] : 400
            );
        }

        $maxEmailLen = (int) ReportSettingsResolver::get(
            $slug,
            $config,
            'mail.email_max_length',
            MailService::EMAIL_MAX_LENGTH
        );
        $dnsCheck = (bool) ReportSettingsResolver::get($slug, $config, 'mail.dns_check', false);

        $email = isset($inputs['email']) ? $inputs['email'] : '';
        $emailCheck = $mail->assessEmail($email, $maxEmailLen);

        if (empty($emailCheck['ok'])) {
            return AjaxResponse::error(
                isset($emailCheck['error']) ? $emailCheck['error'] : 'Invalid email.',
                422
            );
        }

        if ($dnsCheck && method_exists($mail, 'checkDomainMx')) {
            $mx = $mail->checkDomainMx($emailCheck['email']);

            if (empty($mx['ok'])) {
                return AjaxResponse::error(isset($mx['error']) ? $mx['error'] : 'Invalid email domain.', 422);
            }
        }

        return array(
            'ok' => true,
            'message' => 'Upload validated — wire host mailer to attach file and dispatch.',
            'email' => $emailCheck['email'],
            'attachment' => array(
                'size' => isset($fileCheck['size']) ? (int) $fileCheck['size'] : 0,
            ),
            '_upload' => isset($fileCheck['file']) ? $fileCheck['file'] : null,
        );
    }
}
