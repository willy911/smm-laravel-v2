@extends('install.layout')

@section('content')
    <form method="POST" action="/install/process" class="space-y-6">
        @csrf

        {{-- DATABASE --}}
        <div>
            <h3 class="font-semibold mb-2">Database</h3>
            <div class="grid grid-cols-2 gap-4">
                <input name="DB_HOST" placeholder="DB Host" class="input" required>
                <input name="DB_DATABASE" placeholder="DB Name" class="input" required>
                <input name="DB_USERNAME" placeholder="DB User" class="input" required>
                <input name="DB_PASSWORD" placeholder="DB Password" class="input">
            </div>
        </div>

        {{-- WARNA WEB --}}
        <div>
            <h3 class="font-semibold mb-2">Warna Website</h3>
            <input type="color" name="APP_COLOR" value="#6366f1" class="h-12 w-24">
        </div>

        {{-- CLOUDFLARE R2 --}}
        <div>
            <h3 class="font-semibold mb-2">Cloudflare R2</h3>
            <p class="text-sm text-gray-500 mb-3">
                Sistem akan otomatis mendeteksi Cloudflare R2
            </p>

            <div class="grid grid-cols-2 gap-4">
                <input name="AWS_ACCESS_KEY_ID" placeholder="Access Key" class="input">
                <input name="AWS_SECRET_ACCESS_KEY" placeholder="Secret Key" class="input">
                <input name="AWS_BUCKET" placeholder="Bucket" class="input">
                <input name="AWS_ACCOUNT_ID" placeholder="Account ID" class="input">
            </div>
        </div>

        {{-- ADMIN --}}
        <div>
            <h3 class="font-semibold mb-2">Admin Account</h3>
            <div class="grid grid-cols-2 gap-4">
                <input name="ADMIN_NAME" placeholder="Nama Admin" class="input" required>
                <input name="ADMIN_EMAIL" type="email" placeholder="Email Admin" class="input" required>
                <input name="ADMIN_PASSWORD" type="password" placeholder="Password" class="input col-span-2" required>
            </div>
        </div>

        <button class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">
            Install Sekarang
        </button>
    </form>

    <style>
        .input {
            @apply w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring focus:ring-indigo-300;
        }
    </style>
@endsection
