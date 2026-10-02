<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;
use App\Http\Resources\WalletResource;
use App\Models\Wallet;
use App\Services\WalletService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * WalletController — CRUD dompet + perhitungan saldo.
 *
 * Routes (semua protected):
 *   GET    /api/v1/wallets           → index()   — daftar dompet + saldo aktual
 *   POST   /api/v1/wallets           → store()   — buat dompet baru
 *   GET    /api/v1/wallets/{id}      → show()    — detail dompet
 *   PUT    /api/v1/wallets/{id}      → update()  — edit dompet
 *   DELETE /api/v1/wallets/{id}      → destroy() — hapus atau arsipkan
 *   POST   /api/v1/wallets/{id}/archive → archive() — arsipkan paksa
 */
class WalletController extends Controller
{
    use ApiResponse;

    public function __construct(private WalletService $walletService) {}

    // =========================================================
    // GET /api/v1/wallets
    // Query: ?termasuk_arsip=1 (default: 0)
    // =========================================================
    public function index(Request $request): JsonResponse
    {
        $query = Wallet::where('user_id', $request->user()->id)
            ->orderBy('urutan')
            ->orderBy('nama');

        // Secara default, hanya tampilkan dompet aktif
        if (! $request->boolean('termasuk_arsip')) {
            $query->where('is_archived', false);
        }

        $wallets = $query->get();

        // Hitung saldo semua dompet sekaligus (5 query total, bukan N+1)
        $wallets = $this->walletService->computeBalances($wallets);

        // Hitung total saldo (hanya dompet aktif)
        $totalSaldo = $wallets
            ->where('is_archived', false)
            ->sum('saldo_aktual');

        return $this->success([
            'wallets'     => WalletResource::collection($wallets),
            'total_saldo' => round($totalSaldo, 2),
        ], 'Daftar dompet berhasil diambil.');
    }

    // =========================================================
    // POST /api/v1/wallets
    // =========================================================
    public function store(StoreWalletRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['urutan']  = $this->walletService->getNextUrutan($data['user_id']);
        $data['saldo_awal'] = $data['saldo_awal'] ?? 0;

        $wallet = Wallet::create($data);
        $wallet->saldo_aktual = (float) $wallet->saldo_awal;

        return $this->created(
            new WalletResource($wallet),
            'Dompet berhasil dibuat.'
        );
    }

    // =========================================================
    // GET /api/v1/wallets/{id}
    // =========================================================
    public function show(Request $request, int $id): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->find($id);

        if (! $wallet) {
            return $this->notFound('Dompet tidak ditemukan.');
        }

        $wallet->saldo_aktual = $this->walletService->computeSingleBalance($wallet);

        return $this->success(
            new WalletResource($wallet),
            'Detail dompet berhasil diambil.'
        );
    }

    // =========================================================
    // PUT /api/v1/wallets/{id}
    // =========================================================
    public function update(UpdateWalletRequest $request, int $id): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->find($id);

        if (! $wallet) {
            return $this->notFound('Dompet tidak ditemukan.');
        }

        $wallet->update($request->validated());
        $wallet->saldo_aktual = $this->walletService->computeSingleBalance($wallet);

        return $this->success(
            new WalletResource($wallet),
            'Dompet berhasil diperbarui.'
        );
    }

    // =========================================================
    // DELETE /api/v1/wallets/{id}
    // Logika: hapus permanen jika tidak ada transaksi, arsipkan jika ada
    // =========================================================
    public function destroy(Request $request, int $id): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->find($id);

        if (! $wallet) {
            return $this->notFound('Dompet tidak ditemukan.');
        }

        if ($this->walletService->canDelete($wallet)) {
            // Aman untuk dihapus permanen
            $wallet->delete();
            return $this->success(null, 'Dompet berhasil dihapus.');
        }

        // Ada transaksi — arsipkan saja (tidak dihapus)
        $wallet->update(['is_archived' => true]);

        return $this->success(
            new WalletResource($wallet),
            'Dompet memiliki transaksi dan telah diarsipkan (bukan dihapus).'
        );
    }

    // =========================================================
    // POST /api/v1/wallets/{id}/archive
    // Arsipkan dompet secara eksplisit
    // =========================================================
    public function archive(Request $request, int $id): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->find($id);

        if (! $wallet) {
            return $this->notFound('Dompet tidak ditemukan.');
        }

        if ($wallet->is_archived) {
            return $this->error('Dompet sudah diarsipkan.', 422);
        }

        $wallet->update(['is_archived' => true]);

        return $this->success(
            new WalletResource($wallet),
            'Dompet berhasil diarsipkan.'
        );
    }

    // =========================================================
    // POST /api/v1/wallets/{id}/unarchive
    // Pulihkan dompet dari arsip
    // =========================================================
    public function unarchive(Request $request, int $id): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->find($id);

        if (! $wallet) {
            return $this->notFound('Dompet tidak ditemukan.');
        }

        if (! $wallet->is_archived) {
            return $this->error('Dompet tidak dalam status diarsipkan.', 422);
        }

        $wallet->update(['is_archived' => false]);
        $wallet->saldo_aktual = $this->walletService->computeSingleBalance($wallet);

        return $this->success(
            new WalletResource($wallet),
            'Dompet berhasil dipulihkan dari arsip.'
        );
    }
}
