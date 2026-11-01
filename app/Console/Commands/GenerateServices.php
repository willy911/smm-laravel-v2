<?php

namespace App\Console\Commands;

use App\Models\Service\Service;
use Illuminate\Console\Command;

class GenerateServices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:service';

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
        if (Service::count() < 2000000) {
            Service::factory()->count(10000)->create();
        }
    }
}
