@extends('install.layout')

@section('content')
    <h2 class="text-xl font-bold mb-4">Server Requirements</h2>

    <ul class="space-y-3 mb-6">
        @foreach ($requirements as $label => $status)
            <li class="flex justify-between items-center">
                <span>{{ $label }}</span>
                <span class="{{ $status ? 'text-green-600' : 'text-red-600' }}">
                    {{ $status ? 'OK' : 'FAILED' }}
                </span>
            </li>
        @endforeach
    </ul>

    <a href="/install/setup" class="block text-center bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700">
        Lanjut Setup
    </a>
@endsection
