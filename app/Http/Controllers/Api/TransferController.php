<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransferRequest;
use App\Http\Resources\TransferResource;
use App\Models\Transfer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * TransferController — Transfer antar dompet.
 *
 * Catatan penting: Transfer TIDAK dicatat sebagai pemasukan/pengeluaran.
 * Ini memastikan total keuangan tidak terganggu oleh pergerakan dana internal.
 * Saldo dompet sudah memperhitungkan transfer via WalletService.
 *
 * Routes (semua protected):
 *   GET    /api/v1/transfers         → index()   — daftar transfer
 *   POST   /api/v1/transfers         → store()   — buat transfer
 *   GET    /api/v1/transfers/{id}    → show()    — detail transfer
 *   DELETE /api/v1/transfers/{id}    → destroy() — hapus transfer
 */
class TransferController extends Controller
{
    use ApiResponse;

    // =========================================================
    // GET /api/v1/transfers
    // Query: dari_tanggal, sampai_tanggal, wallet_id, per_halaman
    // =========================================================
    public function index(Request $request): JsonResponse
    {
        $query = Transfer::with(['dariWallet:id,nama,ikon,warna', 'keWallet:id,nama,ikon,warna'])
            ->where('user_id', $request->user()->id);

        // Filter tanggal
        if ($request->filled('dari_tanggal')) {
            $query->where('tanggal', '>=', $request->dari_tanggal);
        }
        if ($request->filled('sampai_tanggal')) {
            $query->where('tanggal', '<=', $request->sampai_tanggal);
        }

        // Filter dompet (dari atau ke)
        if ($request->filled('wallet_id')) {
            $walletId = (int) $request->wallet_id;
            $query->where(function ($q) use ($walletId) {
                $q->where('dari_wallet_id', $walletId)
                    ->orWhere('ke_wallet_id', $walletId);
            });
        }

        // Filter bulan
        if ($request->filled('bulan') && preg_match('/^\d{4}-\d{2}$/', $request->bulan)) {
            $query->whereRaw("DATE_FORMAT(tanggal, '%Y-%m') = ?", [$request->bulan]);
        }

        $query->orderBy('tanggal', 'desc')->orderBy('created_at', 'desc');

        $perHalaman = min((int) ($request->per_halaman ?? 15), 100);
        $paginator  = $query->paginate($perHalaman);

        return $this->paginated($paginator, TransferResource::class, 'Daftar transfer berhasil diambil.');
    }

    // =========================================================
    // POST /api/v1/transfers
    // =========================================================
    public function store(StoreTransferRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id']    = $request->user()->id;
        $data['biaya_admin'] = $data['biaya_admin'] ?? 0;

        $transfer = Transfer::create($data);
        $transfer->load(['dariWallet:id,nama,ikon,warna', 'keWallet:id,nama,ikon,warna']);

        return $this->created(
            new TransferResource($transfer),
            'Transfer berhasil dicatat.'
        );
    }

    // =========================================================
    // GET /api/v1/transfers/{id}
    // =========================================================
    public function show(Request $request, int $id): JsonResponse
    {
        $transfer = Transfer::with(['dariWallet:id,nama,ikon,warna', 'keWallet:id,nama,ikon,warna'])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $transfer) {
            return $this->notFound('Transfer tidak ditemukan.');
        }

        return $this->success(
            new TransferResource($transfer),
            'Detail transfer berhasil diambil.'
        );
    }

    // =========================================================
    // DELETE /api/v1/transfers/{id}
    // =========================================================
    public function destroy(Request $request, int $id): JsonResponse
    {
        $transfer = Transfer::where('user_id', $request->user()->id)->find($id);

        if (! $transfer) {
            return $this->notFound('Transfer tidak ditemukan.');
        }

        $transfer->delete();

        return $this->success(null, 'Transfer berhasil dihapus.');
    }
}
