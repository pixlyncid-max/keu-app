<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel transfers untuk mencatat perpindahan dana antar dompet.
     * Transfer TIDAK dicatat sebagai pemasukan/pengeluaran agar tidak merusak
     * total keuangan. Saldo dompet dihitung dengan menyertakan transfer ini.
     */
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('dari_wallet_id')
                ->constrained('wallets')
                ->onDelete('cascade');
            $table->foreignId('ke_wallet_id')
                ->constrained('wallets')
                ->onDelete('cascade');
            $table->decimal('nominal', 15, 2);             // Jumlah yang dipindahkan
            $table->decimal('biaya_admin', 15, 2)->default(0); // Biaya transfer (dipotong dari saldo)
            $table->date('tanggal');
            $table->string('catatan', 500)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'tanggal']);
            $table->index('dari_wallet_id');
            $table->index('ke_wallet_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
