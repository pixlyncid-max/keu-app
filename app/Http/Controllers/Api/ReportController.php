<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Ringkasan keuangan per periode (Pemasukan, Pengeluaran, Net Cashflow, Total Saldo Dompet).
     */
    public function summary(Request $request): JsonResponse
    {
        $startDate = $request->query('tanggal_mulai');
        $endDate   = $request->query('tanggal_selesai');

        $summary = $this->reportService->getSummary($request->user(), $startDate, $endDate);
        return $this->success($summary, 'Laporan ringkasan berhasil diambil');
    }

    /**
     * Pengeluaran per kategori untuk Grafik Donat.
     */
    public function categories(Request $request): JsonResponse
    {
        $startDate = $request->query('tanggal_mulai');
        $endDate   = $request->query('tanggal_selesai');

        $data = $this->reportService->getExpensesByCategory($request->user(), $startDate, $endDate);
        return $this->success($data, 'Laporan pengeluaran per kategori berhasil diambil');
    }

    /**
     * Tren bulanan Pemasukan vs Pengeluaran untuk Grafik Batang.
     */
    public function monthlyTrend(Request $request): JsonResponse
    {
        $months = (int) $request->query('months', 6);
        $trend  = $this->reportService->getMonthlyTrend($request->user(), $months);

        return $this->success($trend, 'Laporan tren bulanan berhasil diambil');
    }
}
