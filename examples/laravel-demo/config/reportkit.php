<?php

$config = require __DIR__.'/../../../reportkit-laravel-legacy/config/reportkit.php';

$config['routes']['enabled'] = true;
$config['logging']['enabled'] = env('REPORTKIT_LOG', true);

return $config;
