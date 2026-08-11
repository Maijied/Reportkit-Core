<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin/operator-export');
});

Route::get('admin/operator-export', 'OperatorExportController@index');

ReportKit::routes();
