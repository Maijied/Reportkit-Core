<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('demo-home');
});

Route::get('admin/operator-export', 'OperatorExportController@index');
Route::get('admin/ledger-browse', 'LedgerBrowseController@index');

ReportKit::routes();
