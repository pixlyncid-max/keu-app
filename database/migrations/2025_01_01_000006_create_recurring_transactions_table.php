<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel recurring_transactions untuk aturan transaksi berulang.
     * Backend scheduler akan membuat transaksi otomatis berdasarkan aturan ini.
     * Dibuat sebelum transactions agar bisa menjadi foreign key.
     */
    public function up(): void
    {
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->enum('tipe', ['pemasukan', 'pengeluaran']);
            $table->decimal('nominal', 15, 2);
            $table->string('catatan', 500)->nullable();
            $table->enum('frekuensi', ['harian', 'mingguan', 'bulanan', 'tahunan']);
            $table->unsignedSmallInteger('interval')->default(1); // Setiap N frekuensi
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();          // null = tidak ada akhir
            $table->date('next_run_date');                        // Kapan jadwal berikutnya berjalan
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'is_active']);
            $table->index(['is_active', 'next_run_date']);        // Untuk query penjadwal
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};
