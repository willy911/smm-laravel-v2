<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class Deposits extends Command
{
    protected $signature = 'migrate:deposits';

    protected $description = 'Migrate deposits from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        DB::connection('mysql_second')
            ->table('deposits')
            ->orderBy('id')
            ->chunkById(500, function ($deposits) use ($locale) {

                $insert = [];

                foreach ($deposits as $deposit) {
                    $insert[] = [
                        'id' => $deposit->id,
                        'user_id'           => $deposit->user_id,
                        'payment_method_id' => 0,
                        'payment_method_name' => $deposit->payment_method_name,
                        'amount' => $deposit->amount / $locale->usd_rate,
                        'bonus' => $deposit->bonus / $locale->usd_rate,
                        'admin_fee' => $deposit->admin_fee / $locale->usd_rate,
                        'unique_code' => $deposit->unique_code / $locale->usd_rate,
                        'total_payment' => $deposit->total_payment / $locale->usd_rate,
                        'total_balance' => $deposit->total_balance / $locale->usd_rate,
                        'status' => $deposit->status,
                        'payment_information' => $deposit->payment_information,
                        'payment_gateway_payment_id' => $deposit->payment_gateway_ref_id,
                        'payment_gateway_payment_token' => $deposit->payment_gateway_ref_token,
                        'payment_gateway_checkout_url' => $deposit->payment_gateway_checkout_url,
                        'payment_gateway_api_log' => $deposit->payment_gateway_api_log,
                        'ip_address' => $deposit->ip_address,
                        'user_agent' => $deposit->user_agent,
                        'initial_balance' => $deposit->initial_balance / $locale->usd_rate,
                        'final_balance' => $deposit->final_balance / $locale->usd_rate,
                        'created_at' => $deposit->created_at,
                        'updated_at' => $deposit->updated_at,
                    ];
                }

                DB::table('deposits')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $deposits->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }
}
