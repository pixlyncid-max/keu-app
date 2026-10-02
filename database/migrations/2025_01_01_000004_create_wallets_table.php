<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel wallets (dompet) untuk menyimpan informasi sumber dana.
     * Tipe: tunai, bank, e-wallet.
     * Saldo dihitung secara dinamis dari saldo_awal + transaksi + transfer.
     */
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nama', 100);
            $table->enum('tipe', ['tunai', 'bank', 'e-wallet'])->default('tunai');
            $table->decimal('saldo_awal', 15, 2)->default(0); // Saldo awal saat dompet dibuat
            $table->string('warna', 7)->default('#6366f1');    // Hex color, e.g., #6366f1
            $table->string('ikon', 50)->default('wallet');     // Nama ikon dari Lucide/Heroicons
            $table->boolean('is_archived')->default(false);    // Arsip jika sudah tidak aktif
            $table->integer('urutan')->default(0);             // Urutan tampilan
            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'is_archived']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
