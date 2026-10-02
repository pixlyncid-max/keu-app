<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel savings_contributions untuk setoran ke target tabungan.
     * Setiap setoran bisa opsional memotong saldo dari wallet tertentu.
     */
    public function up(): void
    {
        Schema::create('savings_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')
                ->constrained('savings_goals')
                ->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Jika diisi, setoran ini memotong saldo dari wallet tersebut
            $table->foreignId('wallet_id')
                ->nullable()
                ->constrained('wallets')
                ->onDelete('set null');
            $table->decimal('nominal', 15, 2);
            $table->date('tanggal');
            $table->string('catatan', 500)->nullable();
            $table->timestamps();

            $table->index('goal_id');
            $table->index('user_id');
            $table->index(['goal_id', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_contributions');
    }
};
