<?php

namespace App\Console\Commands;

use App\Services\RecurringService;
use Illuminate\Console\Command;

class ProcessRecurringTransactions extends Command
{
    /**
     * Nama dan signature command di terminal.
     *
     * @var string
     */
    protected $signature = 'recurring:process {--user= : ID user spesifik (opsional)}';

    /**
     * Deskripsi command.
     *
     * @var string
     */
    protected $description = 'Proses aturan transaksi berulang yang jatuh tempo dan buat transaksi otomatis secara idempoten';

    /**
     * Eksekusi command.
     */
    public function handle(RecurringService $recurringService): int
    {
        $userId = $this->option('user') ? (int) $this->option('user') : null;

        $this->info('Memulai pemrosesan transaksi berulang...');

        $result = $recurringService->processDueRecurring($userId);

        $this->info("Selesai! Rules diproses: {$result['processed_rules']}, Transaksi dibuat: {$result['created_transactions']}");

        return Command::SUCCESS;
    }
}
