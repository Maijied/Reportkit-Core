<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * JsContractTest — static LLDP browser API contract checks.
 */

namespace ReportKit\Core\Tests\Acceptance;

use PHPUnit\Framework\TestCase;

class JsContractTest extends TestCase
{
    protected function uiJsPath($file)
    {
        return dirname(dirname(dirname(__DIR__))) . '/reportkit-ui/js/' . $file;
    }

    public function testReportkitJsExposesLldpApis()
    {
        $path = $this->uiJsPath('reportkit.js');

        if (!is_file($path)) {
            $this->markTestSkipped('reportkit-ui/js/reportkit.js not found');
        }

        $source = file_get_contents($path);

        foreach (array(
            'createPrepareRunner',
            'createSecurePreparedStore',
            'formatReportError',
            'normalizeWeekRows',
            'parseAjaxJson',
            'bindSendPanel',
            'setSendUploadProgress',
            'ReportKit.notify',
        ) as $needle) {
            $this->assertStringContainsString($needle, $source, 'Missing JS contract: ' . $needle);
        }
    }

    public function testLldpCoreJsExists()
    {
        $path = $this->uiJsPath('lldp-core.js');
        $this->assertFileExists($path);
        $source = file_get_contents($path);
        $this->assertStringContainsString('createSecurePreparedStore', $source);
        $this->assertStringContainsString('AES-GCM', $source);
    }

    public function testMailSendUsesFileFormField()
    {
        $path = $this->uiJsPath('reportkit.js');
        $source = file_get_contents($path);
        $this->assertStringContainsString("formData.append('file'", $source);
        $this->assertStringNotContainsString("formData.append('report_file'", $source);
    }
}
