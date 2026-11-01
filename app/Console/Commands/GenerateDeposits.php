<?php

namespace App\Console\Commands;

use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Service\Service;
use Illuminate\Console\Command;

class GenerateDeposits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:deposit';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (Deposit::count() < 1000000) {
            Deposit::factory()->count(3000)->create();
        }
    }
}
