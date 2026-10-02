<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletBalanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_wallet_balance_calculation_with_transactions(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $wallet = Wallet::create([
            'user_id'    => $user->id,
            'nama'       => 'Bank Mandiri',
            'tipe'       => 'bank',
            'saldo_awal' => 1000000,
            'warna'      => '#3b82f6',
            'ikon'       => 'wallet',
        ]);

        $walletService = new WalletService();
        $balance = $walletService->computeSingleBalance($wallet);

        $this->assertEquals(1000000, $balance);
    }
}
