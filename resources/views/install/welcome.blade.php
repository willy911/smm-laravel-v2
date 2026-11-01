@extends('install.layout')

@section('content')
    <div class="text-center space-y-6">
        <h2 class="text-3xl font-bold text-gray-800">Welcome 👋</h2>
        <p class="text-gray-600">
            Installer ini akan membantu kamu menyiapkan aplikasi secara otomatis.
        </p>

        <a href="/install/requirements"
            class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
            Mulai Install
        </a>
    </div>
@endsection
