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
    $indexPath = public_path('index.html');

    if (File::exists($indexPath)) {
        return response()->file($indexPath, [
            'Content-Type' => 'text/html',
        ]);
    }

    return view('welcome');
})->where('any', '^(?!api).*$');
