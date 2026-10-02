<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel budgets untuk anggaran bulanan per kategori pengeluaran.
     * Unique constraint pada (user_id, category_id, bulan) memastikan
     * tidak ada duplikat anggaran untuk bulan yang sama.
     */
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('bulan', 7);                        // Format: YYYY-MM (e.g., 2025-01)
            $table->decimal('batas_nominal', 15, 2);           // Batas anggaran maksimum
            $table->timestamps();

            // Satu kategori hanya boleh punya satu anggaran per bulan per user
            $table->unique(['user_id', 'category_id', 'bulan']);

            $table->index('user_id');
            $table->index(['user_id', 'bulan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
