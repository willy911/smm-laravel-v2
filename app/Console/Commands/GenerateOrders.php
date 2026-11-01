<?php

namespace App\Console\Commands;

use App\Models\Order\Order;
use App\Models\Service\Service;
use Illuminate\Console\Command;

class GenerateOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:order';

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
        if (Order::count() < 5000000) {
            Order::factory()->count(3000)->create();
        }
    }
}
