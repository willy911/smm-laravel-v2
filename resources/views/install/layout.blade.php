<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Installer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">

    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="px-8 py-6 border-b">
            <h1 class="text-2xl font-bold text-gray-800">
                Laravel App Installer
            </h1>
            <p class="text-sm text-gray-500 mt-1">
                Setup aplikasi hanya dalam beberapa langkah
            </p>
        </div>

        <div class="p-8">
            @yield('content')
        </div>
    </div>

</body>

</html>
