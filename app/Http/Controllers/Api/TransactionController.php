<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\TransactionService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * TransactionController — CRUD transaksi dengan filter & pagination.
 *
 * Routes (semua protected):
 *   GET    /api/v1/transactions           → index()   — daftar + filter
 *   POST   /api/v1/transactions           → store()   — buat transaksi
 *   GET    /api/v1/transactions/{id}      → show()    — detail
 *   PUT    /api/v1/transactions/{id}      → update()  — edit
 *   DELETE /api/v1/transactions/{id}      → destroy() — hapus
 *   GET    /api/v1/transactions/summary   → summary() — ringkasan periode
 */
class TransactionController extends Controller
{
    use ApiResponse;

    public function __construct(private TransactionService $transactionService) {}

    // =========================================================
    // GET /api/v1/transactions
    // Query params: tipe, category_id, wallet_id, bulan, dari_tanggal,
    //              sampai_tanggal, cari, urutkan, arah, per_halaman
    // =========================================================
    public function index(Request $request): JsonResponse
    {
        $paginator = $this->transactionService->getFiltered(
            $request->user()->id,
            $request->only([
                'tipe', 'category_id', 'wallet_id',
                'bulan', 'dari_tanggal', 'sampai_tanggal',
                'cari', 'urutkan', 'arah', 'per_halaman',
            ])
        );

        return $this->paginated($paginator, TransactionResource::class, 'Daftar transaksi berhasil diambil.');
    }

    // =========================================================
    // GET /api/v1/transactions/summary
    // Query: dari_tanggal, sampai_tanggal, bulan
    // =========================================================
    public function summary(Request $request): JsonResponse
    {
        // Tentukan rentang tanggal dari parameter
        $dariTanggal   = null;
        $sampaiTanggal = null;

        if ($request->filled('bulan') && preg_match('/^\d{4}-\d{2}$/', $request->bulan)) {
            $dariTanggal   = $request->bulan . '-01';
            $sampaiTanggal = date('Y-m-t', strtotime($dariTanggal));
        } else {
            $dariTanggal   = $request->dari_tanggal;
            $sampaiTanggal = $request->sampai_tanggal;
        }

        $summary = $this->transactionService->getSummary(
            $request->user()->id,
            $dariTanggal,
            $sampaiTanggal
        );

        return $this->success($summary, 'Ringkasan transaksi berhasil diambil.');
    }

    // =========================================================
    // POST /api/v1/transactions
    // =========================================================
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $transaction = Transaction::create($data);
        $transaction->load(['wallet:id,nama,ikon,warna', 'category:id,nama,ikon,warna']);

        return $this->created(
            new TransactionResource($transaction),
            'Transaksi berhasil dicatat.'
        );
    }

    // =========================================================
    // GET /api/v1/transactions/{id}
    // =========================================================
    public function show(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::with(['wallet:id,nama,ikon,warna', 'category:id,nama,ikon,warna'])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $transaction) {
            return $this->notFound('Transaksi tidak ditemukan.');
        }

        return $this->success(
            new TransactionResource($transaction),
            'Detail transaksi berhasil diambil.'
        );
    }

    // =========================================================
    // PUT /api/v1/transactions/{id}
    // =========================================================
    public function update(UpdateTransactionRequest $request, int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->find($id);

        if (! $transaction) {
            return $this->notFound('Transaksi tidak ditemukan.');
        }

        $transaction->update($request->validated());
        $transaction->load(['wallet:id,nama,ikon,warna', 'category:id,nama,ikon,warna']);

        return $this->success(
            new TransactionResource($transaction),
            'Transaksi berhasil diperbarui.'
        );
    }

    // =========================================================
    // DELETE /api/v1/transactions/{id}
    // =========================================================
    public function destroy(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)->find($id);

        if (! $transaction) {
            return $this->notFound('Transaksi tidak ditemukan.');
        }

        $transaction->delete();

        return $this->success(null, 'Transaksi berhasil dihapus.');
    }
}
