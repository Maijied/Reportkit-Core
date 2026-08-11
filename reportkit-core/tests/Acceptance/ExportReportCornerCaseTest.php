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
use ReportKit\Core\Filter\FilterValidator;
use ReportKit\Core\Http\AjaxResponse;
use ReportKit\Core\Date\DateRangeChunker;
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

    protected function readLegacyStub($name)
    {
        $path = $this->monorepoRoot() . '/reportkit-laravel-legacy/resources/stubs/' . $name;
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
        $this->assertStringContainsString('buildStreamCsvDownload', $dl);
        $this->assertStringContainsString('zipNamedBlobs', $dl);
        $this->assertStringContainsString('ensureStreamSaver', $dl);
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
        $this->assertStringContainsString('lldp-download.js', $stub);
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

    public function testFilterRejectsEndBeforeStart()
    {
        $validator = new FilterValidator();
        $error = $validator->validateDateAndOptionalWeek(array(
            'start_date' => '2026-02-01',
            'end_date' => '2026-01-01',
        ));
        $this->assertNotNull($error);
        $this->assertStringContainsString('Start Date', $error);
    }

    public function testFilterRejectsOverSixMonths()
    {
        $validator = new FilterValidator();
        $error = $validator->validateDateAndOptionalWeek(array(
            'start_date' => '2026-01-01',
            'end_date' => '2026-08-15',
        ), 6);
        $this->assertNotNull($error);
        $this->assertStringContainsString('6 months', $error);
    }

    public function testFilterRejectsMissingCompany()
    {
        $validator = new FilterValidator();
        $error = $validator->requirePositiveIntId(null);
        $this->assertNotNull($error);
    }

    public function testMailServiceDetectsGmialTypo()
    {
        $mail = new MailService();
        $result = $mail->assessEmail('ops@gmial.com');
        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('gmail.com', $result['error']);
    }

    public function testMailHardAttachMaxBytesConfig()
    {
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame(26214400, (int) $config['mail']['hard_attach_max_bytes']);
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('mail.hard_attach_max_bytes', $kit);
    }

    public function testPrepareConcurrencyDefaultThree()
    {
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame(3, (int) $config['prepare']['concurrency']);
        $core = $this->readUiJs('lldp-core.js');
        $this->assertStringContainsString('concurrency = 3', $core);
    }

    public function testStreamCsvThresholdConfig()
    {
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame(50000, (int) $config['export']['stream_csv_row_threshold']);
        $dl = $this->readUiJs('lldp-download.js');
        $this->assertStringContainsString('stream_csv_row_threshold', $dl);
    }

    public function testPdfSinglePassMaxRowsConfig()
    {
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame(105303, (int) $config['export']['pdf_single_pass_max_rows']);
        $this->assertSame(40000, (int) $config['export']['pdf_single_file_max_rows']);
    }

    public function testSixMonthRangeWeekCount()
    {
        $chunker = new DateRangeChunker();
        $weeks = $chunker->getWeeklyRanges('2026-01-01', '2026-06-30');
        $this->assertGreaterThanOrEqual(26, count($weeks));
        $this->assertLessThanOrEqual(27, count($weeks));
    }

    public function testPdfProvenScalePageCount()
    {
        $provenRows = 287214;
        $this->assertSame(3591, (int) ceil($provenRows / self::PDF_CHUNK_ROWS));
    }

    public function testAjaxErrorContractShape()
    {
        $payload = AjaxResponse::error('Validation failed.', 422);
        $this->assertArrayHasKey('error', $payload);
        $this->assertSame('Validation failed.', $payload['error']);
        $this->assertTrue(AjaxResponse::isError($payload));
        $ok = AjaxResponse::ok(array('message' => 'Sent.'));
        $this->assertTrue($ok['ok']);
        $this->assertFalse(AjaxResponse::isError($ok));
    }

    public function testExcelFallbackContractInJs()
    {
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('excel_soft_max_rows', $kit);
        $this->assertStringContainsString("result.fallback = 'csv'", $kit);
        $this->assertStringContainsString('falling back to CSV', $kit);
    }

    public function testReloadClearsStoreOnBoot()
    {
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('C12', $kit);
        $this->assertStringContainsString('resetOnReload', $kit);
        $this->assertStringContainsString('ReportKit.store.clear', $kit);
        $this->assertStringContainsString("setActionsEnabled('#rkActionBar', false)", $kit);
    }

    public function testNotifyMuteAndPingControls()
    {
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('ReportKit.notify', $kit);
        $this->assertStringContainsString('sound_muted_key', $kit);
        $this->assertStringContainsString('ping:', $kit);
        $status = $this->readLegacyPartial('download-status.blade.php');
        $this->assertStringContainsString('rkNotifyMuteBtn', $status);
    }

    public function testFeaturesPatternIsLldp()
    {
        $config = include $this->monorepoRoot() . '/reportkit-laravel-legacy/config/reportkit.php';
        $this->assertSame('lldp', $config['features']['pattern']);
    }

    public function testReadmeLogoPointsAtKitLarvaBrandPng()
    {
        $readme = file_get_contents($this->monorepoRoot() . '/README.md');
        $this->assertStringContainsString('brand/png/reportkit-mark-1024.png', $readme);
        $this->assertStringContainsString('reportkit-mark-dark-1024.png', $readme);
        $this->assertFileExists($this->monorepoRoot() . '/brand/png/reportkit-mark-1024.png');
        $this->assertFileExists($this->monorepoRoot() . '/brand/png/reportkit-mark-dark-1024.png');
        $legacy = file_get_contents($this->monorepoRoot() . '/brand/reportkit-mark.svg');
        $this->assertStringContainsString('8ef0c4', $legacy);
        $dark = file_get_contents($this->monorepoRoot() . '/brand/reportkit-mark-dark.svg');
        $this->assertStringContainsString('rx="96"', $dark);
    }

    public function testSendPipelineExportsZipAndAssessSendEmail()
    {
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('assessSendEmail', $kit);
        $this->assertStringContainsString('zipCsvBlob', $kit);
        $this->assertStringContainsString('canSend', $kit);
        $this->assertStringContainsString('@gmial.com', $kit);
        $this->assertStringContainsString('.csv.zip', $kit);
    }

    public function testActionBarUsesFetchAndPrepareLabel()
    {
        $bar = $this->readLegacyPartial('action-bar.blade.php');
        $this->assertStringContainsString('Fetch &amp; Prepare', $bar);
        $this->assertStringContainsString('rkPrepareBtn', $bar);
    }

    public function testKpiRowHasExportAnchorId()
    {
        $kpi = $this->readLegacyPartial('kpi-row.blade.php');
        $this->assertStringContainsString('id="rkKpiRow"', $kpi);
        $this->assertStringContainsString('row_count', $kpi);
    }

    public function testPdfComposeHasStatementHeaderWatermarkAndProgress()
    {
        $js = $this->readUiJs('lldp-download.js');
        $this->assertStringContainsString('drawPdfStatementHeader', $js);
        $this->assertStringContainsString('applyPdfWatermark', $js);
        $this->assertStringContainsString('updatePdfDownloadUi', $js);
        $this->assertStringContainsString('Prepared rows:', $js);
    }

    public function testHybridBrowseStubWiresLedgerBrowseAndLldp()
    {
        $blade = $this->readLegacyStub('report.blade.hybrid-browse.stub');
        $js = $this->readLegacyStub('report.js.hybrid-browse.stub');
        $this->assertStringContainsString('browse_prepared', $blade);
        $this->assertStringContainsString('ui.ledger-panel', $blade);
        $this->assertStringContainsString('lldp-core.js', $blade);
        $this->assertStringContainsString('fromPreparedStore', $js);
        $this->assertStringContainsString('renderTxnPill', $js);
    }

    public function testLedgerSyncStubUsesSyncDatatables()
    {
        $blade = $this->readLegacyStub('report.blade.ledger-sync.stub');
        $this->assertStringContainsString("'sync' => true", $blade);
        $this->assertStringContainsString('ui.ledger-panel', $blade);
    }

    public function testPrepareLoaderPartialExists()
    {
        $partial = $this->readLegacyPartial('prepare-loader.blade.php');
        $this->assertStringContainsString('async-loader', $partial);
        $this->assertStringContainsString('rkAsyncLoading', $partial);
    }

    public function testActivityLogPhpRingBuffer()
    {
        $this->assertFileExists($this->monorepoRoot() . '/reportkit-core/src/Logging/ActivityLog.php');
        \ReportKit\Core\Logging\ActivityLog::configure(true, 3);
        \ReportKit\Core\Logging\ActivityLog::clear();
        \ReportKit\Core\Logging\ActivityLog::info('prepare', 'Week 1 done');
        $entries = \ReportKit\Core\Logging\ActivityLog::flushToArray();
        $this->assertCount(1, $entries);
        $this->assertSame('prepare', $entries[0]['category']);
        \ReportKit\Core\Logging\ActivityLog::configure(false, 200);
        \ReportKit\Core\Logging\ActivityLog::clear();
    }

    public function testSimulationDriverAndPlaylistExist()
    {
        $kit = $this->readUiJs('reportkit.js');
        $this->assertStringContainsString('ReportKit.simulation', $kit);
        $this->assertStringContainsString('resume:', $kit);
        $playlist = $this->monorepoRoot() . '/reportkit-website/src/data/simulation-playlist.json';
        $this->assertFileExists($playlist);
        $this->assertStringContainsString('hybrid-browse-no-sql', file_get_contents($playlist));
    }

    public function testLaravelDemoAppScaffoldIsRunnable()
    {
        $root = $this->monorepoRoot() . '/examples/laravel-demo';
        $this->assertFileExists($root . '/public/index.php');
        $this->assertFileExists($root . '/app/Reports/OperatorExportReport.php');
        $this->assertFileExists($root . '/app/Reports/LedgerBrowseReport.php');
        $this->assertFileExists($root . '/app/Repositories/Reports/OperatorExportReportRepository.php');
        $this->assertFileExists($root . '/app/Repositories/Reports/LedgerBrowseReportRepository.php');
        $this->assertFileExists($root . '/public/js/reports/ledger-browse.js');
        $this->assertFileExists($root . '/bin/setup-demo.sh');
        $operator = file_get_contents($root . '/app/Reports/OperatorExportReport.php');
        $ledger = file_get_contents($root . '/app/Reports/LedgerBrowseReport.php');
        $this->assertStringContainsString('operator-export', $operator);
        $this->assertStringContainsString('async_prepare', $operator);
        $this->assertStringContainsString('ledger-browse', $ledger);
        $this->assertStringContainsString('browse_prepared', $ledger);
    }

    public function testSimulationPlaywrightConfigExists()
    {
        $root = $this->monorepoRoot();
        $this->assertFileExists($root . '/reportkit-website/playwright.config.ts');
        $this->assertFileExists($root . '/reportkit-website/e2e/simulation.spec.ts');
        $this->assertFileExists($root . '/.github/workflows/quality.yml');
        $this->assertFileExists($root . '/reportkit-website/src/components/marketing/PrepareSequenceAnimation.astro');
        $sim = file_get_contents($root . '/reportkit-website/src/pages/simulation.astro');
        $this->assertStringContainsString('PrepareSequenceAnimation', $sim);
    }
}
