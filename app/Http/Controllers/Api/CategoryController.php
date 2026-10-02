<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CategoryController — CRUD kategori transaksi.
 *
 * Routes (semua protected):
 *   GET    /api/v1/categories        → index()   — daftar (bisa filter tipe)
 *   POST   /api/v1/categories        → store()   — buat kategori kustom
 *   PUT    /api/v1/categories/{id}   → update()  — edit (tipe tidak bisa diubah)
 *   DELETE /api/v1/categories/{id}   → destroy() — hapus (jika tidak ada transaksi)
 */
class CategoryController extends Controller
{
    use ApiResponse;

    // =========================================================
    // GET /api/v1/categories
    // Query: ?tipe=pemasukan|pengeluaran
    // =========================================================
    public function index(Request $request): JsonResponse
    {
        $query = Category::where('user_id', $request->user()->id)
            ->orderBy('tipe')
            ->orderBy('urutan')
            ->orderBy('nama');

        // Filter opsional berdasarkan tipe
        if ($request->filled('tipe') && in_array($request->tipe, ['pemasukan', 'pengeluaran'])) {
            $query->where('tipe', $request->tipe);
        }

        $categories = $query->get();

        return $this->success(
            CategoryResource::collection($categories),
            'Daftar kategori berhasil diambil.'
        );
    }

    // =========================================================
    // POST /api/v1/categories
    // =========================================================
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id']    = $request->user()->id;
        $data['is_default'] = false; // Kategori kustom, bukan default
        $data['urutan']     = (Category::where('user_id', $data['user_id'])
            ->where('tipe', $data['tipe'])
            ->max('urutan') ?? 0) + 1;

        $category = Category::create($data);

        return $this->created(
            new CategoryResource($category),
            'Kategori berhasil dibuat.'
        );
    }

    // =========================================================
    // PUT /api/v1/categories/{id}
    // Catatan: tipe tidak bisa diubah setelah dibuat
    // =========================================================
    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::where('user_id', $request->user()->id)->find($id);

        if (! $category) {
            return $this->notFound('Kategori tidak ditemukan.');
        }

        $category->update($request->validated());

        return $this->success(
            new CategoryResource($category),
            'Kategori berhasil diperbarui.'
        );
    }

    // =========================================================
    // DELETE /api/v1/categories/{id}
    // Aturan: kategori default tidak bisa dihapus,
    //         kategori yang digunakan transaksi tidak bisa dihapus
    // =========================================================
    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::where('user_id', $request->user()->id)->find($id);

        if (! $category) {
            return $this->notFound('Kategori tidak ditemukan.');
        }

        // Kategori default tidak bisa dihapus
        if ($category->is_default) {
            return $this->error('Kategori bawaan tidak dapat dihapus.', 422);
        }

        // Cek apakah ada transaksi yang menggunakan kategori ini
        $jumlahTransaksi = $category->transactions()->count();
        if ($jumlahTransaksi > 0) {
            return $this->error(
                "Kategori tidak dapat dihapus karena digunakan oleh {$jumlahTransaksi} transaksi.",
                422
            );
        }

        $category->delete();

        return $this->success(null, 'Kategori berhasil dihapus.');
    }
}
