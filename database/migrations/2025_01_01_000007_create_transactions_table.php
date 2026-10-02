<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel transactions sebagai tabel utama pencatatan transaksi keuangan.
     * Setiap transaksi dikaitkan ke user, wallet, dan category.
     * recurring_id nullable — diisi jika transaksi dibuat otomatis oleh scheduler.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            // Referensi ke aturan recurring jika transaksi ini dibuat otomatis
            $table->foreignId('recurring_id')
                ->nullable()
                ->constrained('recurring_transactions')
                ->onDelete('set null');
            $table->enum('tipe', ['pemasukan', 'pengeluaran']);
            $table->decimal('nominal', 15, 2);                // DECIMAL, bukan FLOAT
            $table->date('tanggal');
            $table->string('catatan', 500)->nullable();
            $table->timestamps();

            // Index untuk query yang sering digunakan
            $table->index('user_id');
            $table->index(['user_id', 'tanggal']);
            $table->index(['user_id', 'tipe']);
            $table->index(['user_id', 'wallet_id']);
            $table->index(['user_id', 'category_id']);
            $table->index(['user_id', 'tanggal', 'tipe']);    // Untuk filter gabungan
            $table->index('recurring_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
