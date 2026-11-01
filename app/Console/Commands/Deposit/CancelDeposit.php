<?php

namespace App\Console\Commands\Deposit;

use App\Models\Deposit\Deposit;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CancelDeposit extends Command
{
    protected $signature = 'deposit:cancel-deposit';

    protected $description = 'Membatalkan deposit yang melebihi 3 jam';

    public function handle()
    {
        DB::statement("
            UPDATE deposits d
            JOIN (
                SELECT id
                FROM deposits
                WHERE status = 'pending'
                AND created_at <= NOW() - INTERVAL 3 HOUR
                LIMIT 100
            ) x ON x.id = d.id
            SET d.status = 'expired',
                d.updated_at = NOW()
        ");
    }
}
