<?php

namespace App\Console\Commands\Migrate;

use App\Models\Locale;
use App\Models\User\User as UserModel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class Users extends Command
{
    protected $signature = 'migrate:users';

    protected $description = 'Migrate users from old database';

    public function handle()
    {
        $locale = Locale::find(1);

        $referralCodes = [];

        DB::table('users')
            ->where(function ($query) {
                $query->whereNull('referral_code')
                    ->orWhere('referral_code', '');
            })
            ->orderBy('id')
            ->chunkById(500, function ($users) use (&$referralCodes) {
                foreach ($users as $user) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'referral_code' => $this->generateReferralCode($referralCodes),
                        ]);
                }
            });

        DB::connection('mysql_second')
            ->table('users')
            // ->whereIn('email', function ($query) {
            //     $query->from('users')
            //         ->select('email')
            //         ->whereNotNull('email')
            //         ->where('email', '<>', '')
            //         ->groupBy('email')
            //         ->havingRaw('COUNT(*) = 1');
            // })
            // ->whereIn('whatsapp', function ($query) {
            //     $query->from('users')
            //         ->select('whatsapp')
            //         ->whereNotNull('whatsapp')
            //         ->where('whatsapp', '<>', '')
            //         ->groupBy('whatsapp')
            //         ->havingRaw('COUNT(*) = 1');
            // })
            // ->whereIn('username', function ($query) {
            //     $query->from('users')
            //         ->select('username')
            //         ->whereNotNull('username')
            //         ->where('username', '<>', '')
            //         ->groupBy('username')
            //         ->havingRaw('COUNT(*) = 1');
            // })
            ->orderBy('id')
            ->chunkById(500, function ($users) use ($locale, &$referralCodes) {

                $insert = [];

                foreach ($users as $user) {
                    info($user->id);
                    $insert[] = [
                        'id' => $user->id,
                        'user_group_id' => 1,
                        'locale_id' => 1,
                        'referral_code' => $this->generateReferralCode($referralCodes),
                        'full_name' => $user->full_name,
                        'whatsapp' => $user->whatsapp,
                        'email' => $user->email,
                        'username' => $user->username,
                        'password' => $user->password,
                        'balance' => $user->balance / $locale->usd_rate,
                        'status' => $user->status === 'active',
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,

                        'api' => $user->api,

                        'email_verified_at' => $user->email_verified_at,

                        'notification' => json_encode([
                            'order' => [
                                'email' => 0,
                                'whatsapp' => 0,
                                'telegram' => 0,
                            ],
                            'deposit' => [
                                'email' => 0,
                                'whatsapp' => 0,
                                'telegram' => 0,
                            ],
                            'ticket' => [
                                'email' => 0,
                                'whatsapp' => 0,
                                'telegram' => 0,
                            ],
                        ]),

                        'referred_by' => null,
                    ];
                }

                DB::table('users')->insertOrIgnore($insert);

                $this->info(
                    'Migrated until ID: ' . $users->last()->id
                );
            });

        $this->info('Migration completed.');

        return self::SUCCESS;
    }

    private function generateReferralCode(array &$reservedCodes): string
    {
        do {
            $code = UserModel::generateReferralCode();
        } while (isset($reservedCodes[$code]));

        $reservedCodes[$code] = true;

        return $code;
    }
}
