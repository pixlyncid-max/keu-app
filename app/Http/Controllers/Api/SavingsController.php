<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSavingsContributionRequest;
use App\Http\Requests\StoreSavingsGoalRequest;
use App\Http\Requests\UpdateSavingsGoalRequest;
use App\Http\Resources\SavingsContributionResource;
use App\Http\Resources\SavingsGoalResource;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Services\SavingsService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavingsController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected SavingsService $savingsService
    ) {}

    /**
     * List semua target tabungan user beserta statistik progress.
     */
    public function index(Request $request): JsonResponse
    {
        $goals = $this->savingsService->getUserGoals($request->user());
        return $this->success(SavingsGoalResource::collection($goals));
    }

    /**
     * Buat target tabungan baru.
     */
    public function store(StoreSavingsGoalRequest $request): JsonResponse
    {
        $goal = $this->savingsService->createGoal($request->user(), $request->validated());
        return $this->created(new SavingsGoalResource($goal), 'Target tabungan berhasil dibuat');
    }

    /**
     * Detail satu target tabungan.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $goal = SavingsGoal::where('user_id', $request->user()->id)->findOrFail($id);
        $goalDetail = $this->savingsService->getGoalDetail($goal);

        return $this->success(new SavingsGoalResource($goalDetail));
    }

    /**
     * Update target tabungan.
     */
    public function update(UpdateSavingsGoalRequest $request, int $id): JsonResponse
    {
        $goal = SavingsGoal::where('user_id', $request->user()->id)->findOrFail($id);
        $updatedGoal = $this->savingsService->updateGoal($goal, $request->validated());

        return $this->success(new SavingsGoalResource($updatedGoal), 'Target tabungan berhasil diperbarui');
    }

    /**
     * Hapus target tabungan.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $goal = SavingsGoal::where('user_id', $request->user()->id)->findOrFail($id);
        $this->savingsService->deleteGoal($goal);

        return $this->success(null, 'Target tabungan berhasil dihapus');
    }

    /**
     * Tambah setoran (kontribusi) ke target tabungan.
     */
    public function storeContribution(StoreSavingsContributionRequest $request, int $goalId): JsonResponse
    {
        $goal = SavingsGoal::where('user_id', $request->user()->id)->findOrFail($goalId);
        $contribution = $this->savingsService->addContribution($goal, $request->user(), $request->validated());

        return $this->created(
            new SavingsContributionResource($contribution),
            'Setoran tabungan berhasil ditambahkan'
        );
    }

    /**
     * Hapus setoran (kontribusi) tabungan.
     */
    public function destroyContribution(Request $request, int $goalId, int $contributionId): JsonResponse
    {
        $goal = SavingsGoal::where('user_id', $request->user()->id)->findOrFail($goalId);
        $contribution = SavingsContribution::where('user_id', $request->user()->id)
            ->where('goal_id', $goalId)
            ->findOrFail($contributionId);

        $this->savingsService->deleteContribution($goal, $contribution);

        return $this->success(null, 'Setoran tabungan berhasil dihapus');
    }
}
