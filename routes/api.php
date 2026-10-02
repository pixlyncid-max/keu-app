<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DataController;
use App\Http\Controllers\Api\RecurringController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SavingsController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Middleware\EnsureAccessToken;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Keuangan Pribadi App
| Base prefix: /api  (dari bootstrap/app.php)
| Semua route di sini di-prefix /v1 secara manual
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==================================================================
    // HEALTH CHECK — Publik, tanpa autentikasi
    // ==================================================================
    Route::get('/health', function () {
        $dbStatus  = 'ok';
        $dbMessage = null;

        try {
            \Illuminate\Support\Facades\DB::connection()->getPdo();
            \Illuminate\Support\Facades\DB::statement('SELECT 1');
        } catch (\Exception $e) {
            $dbStatus  = 'error';
            $dbMessage = config('app.debug') ? $e->getMessage() : 'Database connection failed';
        }

        $status = $dbStatus === 'ok' ? 'ok' : 'degraded';

        return response()->json([
            'status'       => $status,
            'message'      => $status === 'ok' ? 'Semua sistem berjalan normal' : 'Ada masalah pada salah satu layanan',
            'waktu_server' => now()->toIso8601String(),
            'timezone'     => config('app.timezone'),
            'versi'        => '1.0.0',
            'services'     => [
                'api'      => 'ok',
                'database' => ['status' => $dbStatus, 'message' => $dbMessage],
            ],
        ], $status === 'ok' ? 200 : 503);
    });

    // ==================================================================
    // AUTH — Publik (Dengan Rate Limiting Protection)
    // ==================================================================
    Route::prefix('auth')->group(function () {
        Route::middleware(['throttle:10,1'])->post('/register', [AuthController::class, 'register']);
        Route::middleware(['throttle:6,1'])->post('/login',    [AuthController::class, 'login']);
        Route::middleware(['throttle:20,1'])->post('/refresh',  [AuthController::class, 'refresh']);
    });


    // ==================================================================
    // AUTH — Protected (Sanctum + EnsureAccessToken)
    // ==================================================================
    Route::prefix('auth')
        ->middleware(['auth:sanctum', EnsureAccessToken::class])
        ->group(function () {
            Route::post('/logout',   [AuthController::class, 'logout']);
            Route::get('/me',        [AuthController::class, 'me']);
            Route::put('/password',  [AuthController::class, 'changePassword']);
            Route::delete('/account', [AuthController::class, 'deleteAccount']);
        });

    // ==================================================================
    // SEMUA ROUTE PROTECTED — Wajib auth:sanctum + token access
    // ==================================================================
    Route::middleware(['auth:sanctum', EnsureAccessToken::class])->group(function () {

        // ----------------------------------------------------------------
        // DOMPET (Wallets)
        // ----------------------------------------------------------------
        Route::prefix('wallets')->group(function () {
            Route::get('/',                [WalletController::class, 'index']);
            Route::post('/',               [WalletController::class, 'store']);
            Route::get('/{id}',            [WalletController::class, 'show']);
            Route::put('/{id}',            [WalletController::class, 'update']);
            Route::delete('/{id}',         [WalletController::class, 'destroy']);
            Route::post('/{id}/archive',   [WalletController::class, 'archive']);
            Route::post('/{id}/unarchive', [WalletController::class, 'unarchive']);
        });

        // ----------------------------------------------------------------
        // KATEGORI (Categories)
        // ----------------------------------------------------------------
        Route::prefix('categories')->group(function () {
            Route::get('/',         [CategoryController::class, 'index']);
            Route::post('/',        [CategoryController::class, 'store']);
            Route::put('/{id}',     [CategoryController::class, 'update']);
            Route::delete('/{id}',  [CategoryController::class, 'destroy']);
        });

        // ----------------------------------------------------------------
        // TRANSAKSI (Transactions)
        // ----------------------------------------------------------------
        Route::prefix('transactions')->group(function () {
            Route::get('/summary',  [TransactionController::class, 'summary']);
            Route::get('/',         [TransactionController::class, 'index']);
            Route::post('/',        [TransactionController::class, 'store']);
            Route::get('/{id}',     [TransactionController::class, 'show']);
            Route::put('/{id}',     [TransactionController::class, 'update']);
            Route::delete('/{id}',  [TransactionController::class, 'destroy']);
        });

        // ----------------------------------------------------------------
        // TRANSFER ANTAR DOMPET
        // ----------------------------------------------------------------
        Route::prefix('transfers')->group(function () {
            Route::get('/',        [TransferController::class, 'index']);
            Route::post('/',       [TransferController::class, 'store']);
            Route::get('/{id}',    [TransferController::class, 'show']);
            Route::delete('/{id}', [TransferController::class, 'destroy']);
        });

        // ----------------------------------------------------------------
        // TRANSAKSI BERULANG (Recurring Transactions)
        // ----------------------------------------------------------------
        Route::prefix('recurring')->group(function () {
            Route::get('/upcoming', [RecurringController::class, 'upcoming']);
            Route::post('/process', [RecurringController::class, 'process']);
            Route::get('/',         [RecurringController::class, 'index']);
            Route::post('/',        [RecurringController::class, 'store']);
            Route::get('/{id}',     [RecurringController::class, 'show']);
            Route::put('/{id}',     [RecurringController::class, 'update']);
            Route::delete('/{id}',  [RecurringController::class, 'destroy']);
        });

        // ----------------------------------------------------------------
        // TARGET TABUNGAN (Savings Goals)
        // ----------------------------------------------------------------
        Route::prefix('savings')->group(function () {
            Route::get('/',                                         [SavingsController::class, 'index']);
            Route::post('/',                                        [SavingsController::class, 'store']);
            Route::get('/{id}',                                     [SavingsController::class, 'show']);
            Route::put('/{id}',                                     [SavingsController::class, 'update']);
            Route::delete('/{id}',                                  [SavingsController::class, 'destroy']);
            Route::post('/{id}/contributions',                      [SavingsController::class, 'storeContribution']);
            Route::delete('/{id}/contributions/{contributionId}',   [SavingsController::class, 'destroyContribution']);
        });

        // ----------------------------------------------------------------
        // ANGGARAN BULANAN (Budgets)
        // ----------------------------------------------------------------
        Route::prefix('budgets')->group(function () {
            Route::get('/summary',  [BudgetController::class, 'summary']);
            Route::get('/',         [BudgetController::class, 'index']);
            Route::post('/',        [BudgetController::class, 'store']);
            Route::put('/{id}',     [BudgetController::class, 'update']);
            Route::delete('/{id}',  [BudgetController::class, 'destroy']);
        });

        // ----------------------------------------------------------------
        // LAPORAN & RINGKASAN DASHBOARD (Reports)
        // ----------------------------------------------------------------
        Route::prefix('reports')->group(function () {
            Route::get('/summary',        [ReportController::class, 'summary']);
            Route::get('/categories',     [ReportController::class, 'categories']);
            Route::get('/monthly-trend',  [ReportController::class, 'monthlyTrend']);
            Route::get('/bank-statement', [ReportController::class, 'bankStatement']);
        });

        // ----------------------------------------------------------------
        // EKSPOR & IMPOR DATA (Data Backup & Restore)
        // ----------------------------------------------------------------
        Route::prefix('data')->group(function () {
            Route::get('/export/csv',  [DataController::class, 'exportCsv']);
            Route::get('/export/json', [DataController::class, 'exportJson']);
            Route::post('/import/json',[DataController::class, 'importJson']);
        });

    }); // end middleware group

}); // end prefix v1
