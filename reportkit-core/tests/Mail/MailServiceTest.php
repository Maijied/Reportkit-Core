<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * MailServiceTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Mail;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Mail\MailService;

class MailServiceTest extends TestCase
{
    public function testAssessEmailRejectsTypo()
    {
        $mail = new MailService();
        $result = $mail->assessEmail('ops@gmial.com');

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('gmail.com', $result['error']);
    }

    public function testBuildCsvContent()
    {
        $mail = new MailService();
        $csv = $mail->buildCsvContent(
            array(array('id' => 1, 'name' => 'Alpha')),
            array('id', 'name')
        );

        $this->assertTrue($csv['ok']);
        $this->assertStringContainsString('id,name', $csv['content']);
        $this->assertStringContainsString('1,Alpha', $csv['content']);
    }

    public function testPlanSendBuildsZipWhenAvailable()
    {
        if (!class_exists('ZipArchive')) {
            $this->markTestSkipped('ZipArchive not available');
        }

        $mail = new MailService();
        $plan = $mail->planSend(array(
            'email' => 'demo@example.com',
            'rows' => array(array('amount' => '10.00')),
            'prefix' => 'demo',
            'zip' => true,
        ));

        $this->assertTrue($plan['ok']);
        $this->assertSame('application/zip', $plan['attachment']['mime']);
        $this->assertGreaterThan(0, $plan['attachment']['size']);
    }

    public function testParseIniBytes()
    {
        $this->assertSame(4194304, MailService::parseIniBytes('4M'));
        $this->assertSame(2048, MailService::parseIniBytes('2K'));
        $this->assertSame(100, MailService::parseIniBytes('100'));
    }

    public function testFormatBytesLabel()
    {
        $this->assertSame('1.5 MB', MailService::formatBytesLabel(1572864));
        $this->assertSame('512 B', MailService::formatBytesLabel(512));
    }

    public function testValidateUploadedReportFileRejectsMissing()
    {
        $mail = new MailService();
        $result = $mail->validateUploadedReportFile(null);

        $this->assertFalse($result['ok']);
        $this->assertSame(400, $result['code']);
    }

    public function testValidateUploadedReportFileAcceptsValidArray()
    {
        $mail = new MailService();
        $result = $mail->validateUploadedReportFile(array(
            'error' => UPLOAD_ERR_OK,
            'size' => 1024,
            'name' => 'report.zip',
        ));

        $this->assertTrue($result['ok']);
        $this->assertSame(1024, $result['size']);
    }

    public function testUploadErrorMessageFromCode()
    {
        $mail = new MailService();
        $msg = $mail->uploadErrorMessageFromCode(UPLOAD_ERR_NO_FILE);

        $this->assertStringContainsString('required', strtolower($msg));
    }

    public function testResolveMaxUploadBytesIsPositive()
    {
        $this->assertGreaterThan(0, MailService::resolveMaxUploadBytes());
        $this->assertLessThanOrEqual(MailService::HARD_ATTACH_MAX_BYTES, MailService::resolveMaxUploadBytes());
    }
}
