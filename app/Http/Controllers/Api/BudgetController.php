<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Services\BudgetService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BudgetService $budgetService
    ) {}

    /**
     * Ringkasan anggaran bulanan beserta statistik pemakaian dari transaksi.
     */
    public function summary(Request $request): JsonResponse
    {
        $bulan = $request->query('bulan');
        $summary = $this->budgetService->getSummary($request->user(), $bulan);

        return $this->success($summary, 'Ringkasan anggaran berhasil diambil');
    }

    /**
     * List anggaran untuk bulan tertentu.
     */
    public function index(Request $request): JsonResponse
    {
        $bulan = $request->query('bulan');
        $budgets = $this->budgetService->getBudgetsForMonth($request->user(), $bulan);

        return $this->success(BudgetResource::collection($budgets));
    }

    /**
     * Buat / set anggaran per kategori.
     */
    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $budget = $this->budgetService->setBudget($request->user(), $request->validated());
        return $this->created(new BudgetResource($budget), 'Anggaran berhasil diatur');
    }

    /**
     * Update batas nominal anggaran.
     */
    public function update(UpdateBudgetRequest $request, int $id): JsonResponse
    {
        $budget = Budget::where('user_id', $request->user()->id)->findOrFail($id);
        $updatedBudget = $this->budgetService->updateBudget($budget, $request->validated());

        return $this->success(new BudgetResource($updatedBudget), 'Anggaran berhasil diperbarui');
    }

    /**
     * Hapus anggaran.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $budget = Budget::where('user_id', $request->user()->id)->findOrFail($id);
        $this->budgetService->deleteBudget($budget);

        return $this->success(null, 'Anggaran berhasil dihapus');
    }
}
