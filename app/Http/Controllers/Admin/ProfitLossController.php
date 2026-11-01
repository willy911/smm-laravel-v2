<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott
| * Whatsapp : https://wa.me/6285349680016
| * Telegram : https://t.me/jhonroott
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfitLossController extends Controller
{
    /**
     * Laporan Laba/Rugi berbasis transaksi nyata.
     *
     * Ringkasan dihitung dari order berstatus 'completed':
     *   - pendapatan = SUM(orders.price)
     *   - modal      = SUM(orders.price - orders.profit)
     *   - laba       = SUM(orders.profit)
     *   - margin     = laba / pendapatan * 100
     * plus breakdown per hari (GROUP BY DATE(created_at)).
     */
    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);

        if ($request->has('page')) {
            return response()->json([
                'status' => true,
                'data'   => $this->report($request),
            ]);
        }

        return inertia('admin/profit-loss/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'report' => $this->report(request()),
                ],
            ),
        ]);
    }

    /**
     * Export laporan laba rugi ke berkas CSV (streaming).
     */
    public function export(Request $request)
    {
        abort_unless(auth('admin')->user()->group->is_primary, 403);

        $report = $this->report($request);

        return response()->streamDownload(function () use ($report) {
            $handle = fopen('php://output', 'w');
            // BOM UTF-8 agar karakter Indonesia tampil benar di Excel.
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'Tanggal',
                'Jumlah Pesanan',
                'Pendapatan',
                'Modal',
                'Laba',
                'Margin (%)',
            ]);
            foreach ($report['per_day'] as $row) {
                fputcsv($handle, [
                    $row['date'],
                    (string) $row['orders'],
                    $this->formatNumber($row['revenue']),
                    $this->formatNumber($row['modal']),
                    $this->formatNumber($row['profit']),
                    $this->formatNumber($row['margin']),
                ]);
            }
            fputcsv($handle, [
                'TOTAL',
                (string) $report['summary']['transactions'],
                $this->formatNumber($report['summary']['revenue']),
                $this->formatNumber($report['summary']['modal']),
                $this->formatNumber($report['summary']['profit']),
                $this->formatNumber($report['summary']['margin']),
            ]);
            fclose($handle);
        }, 'profit-loss-' . date('Y-m-d') . '.csv', [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Cache-Control'       => 'no-store, no-cache, must-revalidate',
            'Pragma'              => 'no-cache',
        ]);
    }

    /**
     * Data laporan: ringkasan + breakdown per hari untuk rentang tanggal terpilih.
     * Dipakai bersama index() dan export() agar logika filter identik.
     */
    private function report(Request $request): array
    {
        $base = Order::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(price), 0) as revenue, COALESCE(SUM(price - profit), 0) as modal, COALESCE(SUM(profit), 0) as profit')
            ->where('status', 'completed');

        if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
            $base->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
            $base->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
        } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
            $base->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
        }

        $perDay = $base->groupBy(DB::raw('DATE(created_at)'))->orderBy('date')->get()->map(function ($row) {
            $revenue = round((float) $row->revenue, 2);
            $profit  = round((float) $row->profit, 2);

            return [
                'date'    => (string) $row->date,
                'orders'  => (int) $row->orders,
                'revenue' => $revenue,
                'modal'   => round((float) $row->modal, 2),
                'profit'  => $profit,
                'margin'  => $revenue > 0 ? round($profit / $revenue * 100, 2) : 0,
            ];
        })->values()->all();

        $revenue = round(array_sum(array_column($perDay, 'revenue')), 2);
        $modal   = round(array_sum(array_column($perDay, 'modal')), 2);
        $profit  = round(array_sum(array_column($perDay, 'profit')), 2);

        return [
            'summary' => [
                'revenue'      => $revenue,
                'modal'        => $modal,
                'profit'       => $profit,
                'margin'       => $revenue > 0 ? round($profit / $revenue * 100, 2) : 0,
                'transactions' => array_sum(array_column($perDay, 'orders')),
            ],
            'per_day' => $perDay,
        ];
    }

    /**
     * Format angka untuk CSV (tanpa pemisah ribuan agar dapat diolah Excel).
     */
    private function formatNumber($value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
