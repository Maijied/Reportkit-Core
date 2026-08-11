<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * ExportReportCornerCaseTest — static LLDP contract + capacity math (no live DB).
 */

namespace ReportKit\Core\Tests\Acceptance;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Export\ExportHelper;
use ReportKit\Core\Mail\MailService;

class ExportReportCornerCaseTest extends TestCase
{
    const EXCEL_SOFT_MAX = 25000;
    const PDF_CHUNK_ROWS = 80;
    const CSV_CHUNK_ROWS = 400;
    const SESSION_PERSIST_MAX_BYTES = 1500000;

    protected function monorepoRoot()
    {
        return dirname(dirname(dirname(__DIR__)));
    }

    protected function readUiJs($file)
    {
        $path = $this->monorepoRoot() . '/reportkit-ui/js/' . $file;
        $this->assertFileExists($path);

        return file_get_contents($path);
    }

    protected function readLegacyPartial($name)
    {
        $path = $this->monorepoRoot() . '/reportkit-laravel-legacy/resources/views/ui/' . $name;
        $this->assertFileExists($path);

        return file_get_contents($path);
    }

    public function testConfigExcelSoftMaxMatchesCeiling()
    {
        $configPath = $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertFileExists($configPath);
        $config = include $configPath;
        $this->assertSame(self::EXCEL_SOFT_MAX, (int) $config['export']['excel_soft_max_rows']);
    }

    public function testPdfPagesEqualCeilRowsOverChunk()
    {
        $this->assertSame(2, (int) ceil(81 / self::PDF_CHUNK_ROWS));
        $this->assertSame(1317, (int) ceil(105303 / self::PDF_CHUNK_ROWS));
    }

    public function testSessionPersistGateMatchesJs()
    {
        $js = $this->readUiJs('lldp-core.js');
        $this->assertStringContainsString('1500000', $js);
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame(self::SESSION_PERSIST_MAX_BYTES, (int) $config['store']['session_persist_max_bytes']);
    }

    public function testPrepareRunnerAndSecureStoreExported()
    {
        $core = $this->readUiJs('lldp-core.js');
        $this->assertStringContainsString('createPrepareRunner', $core);
        $this->assertStringContainsString('createSecurePreparedStore', $core);
        $this->assertStringContainsString('AES-GCM', $core);
        $this->assertStringContainsString('beforeunload.reportkitPreparedStore', $core);
        $this->assertStringContainsString('PREPARED_DEFAULT_TTL_MS', $core);
    }

    public function testDownloadRunnerAndPdfMergeExported()
    {
        $dl = $this->readUiJs('lldp-download.js');
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('createDownloadRunner', $dl);
        $this->assertStringContainsString('mergePdfPartsToSingleBlob', $dl);
        $this->assertStringContainsString('buildPdfDownload', $dl);
        $this->assertStringContainsString('shouldStreamCsvDownload', $dl);
        $this->assertStringContainsString('ensureJsPdf', $dl);
        $this->assertStringContainsString('ReportKit.pdf', $kit);
        $this->assertStringNotContainsString('win.print()', $kit);
    }

    public function testSendUsesFileFieldAndUploadProgress()
    {
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString("formData.append('file'", $kit);
        $this->assertStringContainsString('xhr.upload.addEventListener', $kit);
        $this->assertStringContainsString('bindSendPanel', $kit);
        $this->assertStringContainsString('sendStep', $kit);
    }

    public function testBladePartialsExposeDownloadAndSendControls()
    {
        $async = $this->readLegacyPartial('async-loader.blade.php');
        $status = $this->readLegacyPartial('download-status.blade.php');
        $send = $this->readLegacyPartial('send-panel.blade.php');
        $this->assertStringContainsString('rkPrepareCancelBtn', $async);
        $this->assertStringContainsString('rk-async-loading-eta', $async);
        $this->assertStringContainsString('rkDownloadCancelBtn', $status);
        $this->assertStringContainsString('rkNotifyPingBtn', $status);
        $this->assertStringContainsString('rkSendUploadProgress', $send);
        $this->assertStringContainsString('rkNotifyBell', $send);
    }

    public function testHybridExportStubLoadsLldpScripts()
    {
        $stub = file_get_contents(
            $this->monorepoRoot() . '/reportkit-laravel-legacy/resources/stubs/report.blade.hybrid-export.stub'
        );
        $this->assertStringContainsString('lldp-core.js', $stub);
        $this->assertStringContainsString('ReportKitPageConfig', $stub);
    }

    public function testMailServiceUploadValidationPresent()
    {
        $mail = new MailService();
        $this->assertTrue(method_exists($mail, 'validateUploadedReportFile'));
        $this->assertTrue(method_exists($mail, 'resolveMaxUploadBytes'));
        $bad = $mail->validateUploadedReportFile(null);
        $this->assertFalse($bad['ok']);
    }

    public function testExportHelperTitleCaseUserTypeAlias()
    {
        $helper = new ExportHelper();
        $this->assertSame('Agent', $helper->titleCaseUserType('agent'));
        $name = $helper->buildDownloadFilename(array(
            'prefix' => 'demo',
            'user_type' => 'agent',
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-31',
            'extension' => 'csv',
        ));
        $this->assertStringContainsString('demo_Agent', $name);
        $this->assertStringContainsString('.csv', $name);
    }

    public function testPdfVolumeSplitMath()
    {
        $perVolume = 25000;
        $this->assertSame(12, (int) ceil(275214 / $perVolume));
        $this->assertSame(5, (int) ceil(105303 / $perVolume));
    }

    public function testCsvChunkDefaultInConfig()
    {
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame(self::CSV_CHUNK_ROWS, (int) $config['export']['csv_chunk_rows']);
    }

    public function testRowsResponseShapeDefaultsToArray()
    {
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame('array', $config['export']['rows_response_shape']);
        $kit = $this->readUiJs('lldp-core.js');
        $this->assertStringContainsString('normalizeWeekRows', $kit);
    }

    public function testAjaxGuardPresentInKit()
    {
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('parseAjaxJson', $kit);
        $this->assertStringContainsString('isHtmlAjaxBody', $kit);
        $this->assertStringContainsString('ajax_timeout_ms', $kit);
    }

    public function testMakeCommandSupportsHybridExportPreset()
    {
        $cmd = file_get_contents(
            $this->monorepoRoot() . '/reportkit-laravel-legacy/src/Console/MakeReportCommand.php'
        );
        $this->assertStringContainsString('hybrid-export', $cmd);
        $this->assertStringContainsString('datatables-sync', $cmd);
        $this->assertStringContainsString('hybrid-kpi', $cmd);
    }
}
