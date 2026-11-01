<?php

namespace App\Install\Services;

class EnvWriter
{
    public static function write(array $data)
    {
        $env = file_get_contents(base_path('.env.example'));

        $replacements = [
            'DB_HOST' => $data['DB_HOST'],
            'DB_DATABASE' => $data['DB_DATABASE'],
            'DB_USERNAME' => $data['DB_USERNAME'],
            'DB_PASSWORD' => $data['DB_PASSWORD'],

            'APP_COLOR' => $data['APP_COLOR'],

            'AWS_ACCESS_KEY_ID' => $data['AWS_ACCESS_KEY_ID'],
            'AWS_SECRET_ACCESS_KEY' => $data['AWS_SECRET_ACCESS_KEY'],
            'AWS_DEFAULT_REGION' => $data['AWS_DEFAULT_REGION'],
            'AWS_BUCKET' => $data['AWS_BUCKET'],
            'AWS_URL' => $data['AWS_URL'],
            'AWS_ENDPOINT' => $data['AWS_ENDPOINT'],
            'AWS_USE_PATH_STYLE_ENDPOINT' => $data['AWS_USE_PATH_STYLE_ENDPOINT'] ? 'true' : 'false',
        ];

        foreach ($replacements as $key => $value) {
            $env = preg_replace(
                "/^{$key}=.*/m",
                "{$key}=\"{$value}\"",
                $env
            );
        }

        file_put_contents(base_path('.env'), $env);
    }
}
