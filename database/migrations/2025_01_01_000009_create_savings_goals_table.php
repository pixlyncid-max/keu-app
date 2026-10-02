<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel savings_goals untuk target tabungan.
     * Status berubah otomatis menjadi 'tercapai' saat total kontribusi >= target_nominal.
     */
    public function up(): void
    {
        Schema::create('savings_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Dompet opsional — jika diisi, setoran akan memotong saldo dompet ini
            $table->foreignId('wallet_id')
                ->nullable()
                ->constrained('wallets')
                ->onDelete('set null');
            $table->string('nama', 150);
            $table->decimal('target_nominal', 15, 2);
            $table->date('tanggal_target')->nullable();         // Tenggat opsional
            $table->string('ikon', 50)->default('piggy-bank');
            $table->string('warna', 7)->default('#10b981');     // Hex color
            $table->enum('status', ['aktif', 'tercapai', 'dibatalkan'])->default('aktif');
            $table->string('catatan', 500)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_goals');
    }
};
