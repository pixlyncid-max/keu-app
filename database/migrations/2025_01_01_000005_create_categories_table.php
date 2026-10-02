<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel categories untuk kategori transaksi.
     * Bisa berupa kategori default (dibuat saat registrasi) atau
     * kategori kustom buatan pengguna.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nama', 100);
            $table->enum('tipe', ['pemasukan', 'pengeluaran']);
            $table->string('ikon', 50)->default('tag');        // Nama ikon dari Lucide
            $table->string('warna', 7)->default('#6366f1');    // Hex color
            $table->boolean('is_default')->default(false);     // true = kategori bawaan sistem
            $table->integer('urutan')->default(0);             // Urutan tampilan
            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'tipe']);
            $table->index(['user_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
