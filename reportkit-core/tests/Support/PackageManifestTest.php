<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * PackageManifestTest — ReportKit core component.
 */

namespace ReportKit\Core\Tests\Support;

use PHPUnit\Framework\TestCase;
use ReportKit\Core\Support\PackageManifest;

class PackageManifestTest extends TestCase
{
    public function testLegacyAdapterMetadata()
    {
        $root = realpath(dirname(__DIR__, 2) . '/../reportkit-laravel-legacy');
        $this->assertNotFalse($root);

        $manifest = PackageManifest::fromPackageRoot($root);

        $this->assertSame('4.1 → 5.4', $manifest->laravelDisplay());
        $this->assertStringContainsString('4.1 → 5.4', $manifest->installCommandDescription());
        $this->assertSame(
            'composer require reportkit/core reportkit/laravel-legacy',
            $manifest->formatComposerRequire()
        );
        $this->assertStringContainsString(
            'laravel-legacy',
            $manifest->docsUrl('install')
        );
    }

    public function testModernAdapterMetadata()
    {
        $root = realpath(dirname(__DIR__, 2) . '/../reportkit-laravel');
        $this->assertNotFalse($root);

        $manifest = PackageManifest::fromPackageRoot($root);

        $this->assertSame('5.5 → 13', $manifest->laravelDisplay());
        $this->assertSame(
            'composer require reportkit/core reportkit/laravel',
            $manifest->formatComposerRequire()
        );
    }
}
