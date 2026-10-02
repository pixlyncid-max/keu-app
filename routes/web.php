<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Keuangan Pribadi App
|--------------------------------------------------------------------------
| Menyajikan antarmuka React (public/index.html) langsung di http://127.0.0.1:8000
| Seluruh rute non-API diarahkan ke React Single Page Application (SPA).
|
*/

Route::get('/{any?}', function () {
    $possiblePaths = [
        public_path('index.html'),
        base_path('index.html'),
        base_path('public/index.html'),
        __DIR__ . '/../public/index.html',
        dirname(__DIR__) . '/index.html',
    ];

    foreach ($possiblePaths as $path) {
        if (File::exists($path)) {
            return response()->file($path, [
                'Content-Type' => 'text/html; charset=UTF-8',
            ]);
        }
    }

    return response('File index.html tidak ditemukan. Pastikan folder assets dan index.html sudah diupload.', 404);
})->where('any', '^(?!api).*$');
