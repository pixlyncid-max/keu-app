<?php

namespace App\Providers;

use App\Models\PersonalAccessToken;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     * Daftarkan custom PersonalAccessToken model ke Sanctum.
     */
    public function boot(): void
    {
        // Gunakan custom token model yang mendukung field 'revoked'
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
}
