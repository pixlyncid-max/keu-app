<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportJsonRequest;
use App\Services\ExportImportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected ExportImportService $exportImportService
    ) {}

    /**
     * Ekspor data transaksi ke file CSV.
     */
    public function exportCsv(Request $request)
    {
        $filters    = $request->only(['tipe', 'wallet_id', 'category_id', 'bulan', 'search']);
        $csvContent = $this->exportImportService->exportTransactionsCsv($request->user(), $filters);

        $filename = 'Laporan_Transaksi_' . now()->format('Ymd_His') . '.csv';

        return response($csvContent, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ]);
    }

    /**
     * Ekspor seluruh data user ke file JSON (Backup).
     */
    public function exportJson(Request $request): JsonResponse
    {
        $data = $this->exportImportService->exportUserDataJson($request->user());
        $filename = 'backup_keuangan_' . now()->format('Ymd_His') . '.json';

        return response()->json($data, 200, [
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Impor data user dari file JSON backup.
     */
    public function importJson(ImportJsonRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $jsonContent = json_decode(file_get_contents($file->getRealPath()), true);

        if (!$jsonContent) {
            return $this->error('File JSON tidak dapat dibaca atau format tidak valid', 422);
        }

        $modeOverwrite = $request->boolean('mode_overwrite', false);
        $result = $this->exportImportService->importUserDataJson($request->user(), $jsonContent, $modeOverwrite);

        return $this->success($result, 'Impor data dari backup JSON berhasil diproses');
    }
}
