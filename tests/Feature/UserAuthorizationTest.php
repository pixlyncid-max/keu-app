<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_other_users_wallet(): void
    {
        /** @var User $userA */
        $userA = User::factory()->create();
        /** @var User $userB */
        $userB = User::factory()->create();

        $walletB = Wallet::create([
            'user_id'    => $userB->id,
            'nama'       => 'Dompet User B',
            'tipe'       => 'tunai',
            'saldo_awal' => 500000,
        ]);

        // Buat access token valid untuk userA
        $token = $userA->createToken('access', ['*']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token->plainTextToken)
            ->getJson("/api/v1/wallets/{$walletB->id}");

        $response->assertStatus(404);
    }
}
