<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecurringRequest;
use App\Http\Requests\UpdateRecurringRequest;
use App\Http\Resources\RecurringResource;
use App\Models\RecurringTransaction;
use App\Services\RecurringService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected RecurringService $recurringService
    ) {}

    /**
     * List semua aturan transaksi berulang user.
     */
    public function index(Request $request): JsonResponse
    {
        $rules = $this->recurringService->getUserRules($request->user());
        return $this->success(RecurringResource::collection($rules));
    }

    /**
     * Buat aturan transaksi berulang baru.
     */
    public function store(StoreRecurringRequest $request): JsonResponse
    {
        $rule = $this->recurringService->createRule($request->user(), $request->validated());
        return $this->created(new RecurringResource($rule), 'Aturan transaksi berulang berhasil dibuat');
    }

    /**
     * Detail satu aturan transaksi berulang.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $rule = RecurringTransaction::where('user_id', $request->user()->id)
            ->with(['wallet', 'category'])
            ->findOrFail($id);

        return $this->success(new RecurringResource($rule));
    }

    /**
     * Update aturan transaksi berulang.
     */
    public function update(UpdateRecurringRequest $request, int $id): JsonResponse
    {
        $rule = RecurringTransaction::where('user_id', $request->user()->id)->findOrFail($id);
        $updatedRule = $this->recurringService->updateRule($rule, $request->validated());

        return $this->success(new RecurringResource($updatedRule), 'Aturan transaksi berulang berhasil diperbarui');
    }

    /**
     * Hapus aturan transaksi berulang.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $rule = RecurringTransaction::where('user_id', $request->user()->id)->findOrFail($id);
        $this->recurringService->deleteRule($rule);

        return $this->success(null, 'Aturan transaksi berulang berhasil dihapus');
    }

    /**
     * Dapatkan daftar tagihan / transaksi mendatang (30 hari ke depan).
     */
    public function upcoming(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);
        $upcoming = $this->recurringService->getUpcomingBills($request->user(), $days);

        return $this->success($upcoming, 'Daftar transaksi mendatang berhasil diambil');
    }

    /**
     * Manual Trigger untuk memproses transaksi berulang yang jatuh tempo (Pengujian instant).
     */
    public function process(Request $request): JsonResponse
    {
        $result = $this->recurringService->processDueRecurring($request->user()->id);
        return $this->success($result, 'Pemrosesan transaksi berulang berhasil dijalankan');
    }
}
