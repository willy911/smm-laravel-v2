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

namespace App\Http\Controllers\Admin\Service\Category;

use Exception;
use Inertia\Inertia;
use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Service\ServiceCategoryGroup;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Service\ServiceCategory;
use App\Services\General\Service\CategoryService;
use App\Services\Admin\Service\CategoryGroupService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request, CategoryGroupService $categoryGroupService)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category.access'), 403);
        if ($request->has('page')) {
            $tableItems = ServiceCategory::withTrashed()->withCount(['services'])->with(['serviceCategoryGroup'])->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.updated_at.start') && $request->filled('filter.updated_at.end')) {
                    $query->whereDate('updated_at', '>=', date('Y-m-d', strtotime($request->input('filter.updated_at.start'))));
                    $query->whereDate('updated_at', '<=', date('Y-m-d', strtotime($request->input('filter.updated_at.end'))));
                } elseif ($request->filled('filter.updated_at.start') && !$request->filled('filter.updated_at.end')) {
                    $query->whereDate('updated_at', date('Y-m-d', strtotime($request->input('filter.updated_at.start'))));
                }
                if ($request->filled('filter.deleted_at.start') && $request->filled('filter.deleted_at.end')) {
                    $query->whereDate('deleted_at', '>=', date('Y-m-d', strtotime($request->input('filter.deleted_at.start'))));
                    $query->whereDate('deleted_at', '<=', date('Y-m-d', strtotime($request->input('filter.deleted_at.end'))));
                } elseif ($request->filled('filter.deleted_at.start') && !$request->filled('filter.deleted_at.end')) {
                    $query->whereDate('deleted_at', date('Y-m-d', strtotime($request->input('filter.deleted_at.start'))));
                }
                if ($request->filled('filter.type')) {
                    $query->whereIn('type', explode(',', $request->input('filter.type')));
                }
                if ($request->filled('filter.service_category_group_id')) {
                    $query->whereIn('service_category_group_id', explode(',', $request->input('filter.service_category_group_id')));
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'name',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            });
            $allowedOrderColumns = ['id', 'name', 'sort_number', 'created_at', 'updated_at', 'deleted_at', 'service_category_group_id', 'status'];
            $orderColumn = $request->input('order.column', 'sort_number');
            $orderDirection = strtolower((string) $request->input('order.direction', 'asc')) === 'desc' ? 'desc' : 'asc';
            if (!in_array($orderColumn, $allowedOrderColumns, true)) {
                $orderColumn = 'sort_number';
            }
            if ($orderColumn === 'sort_number') {
                $tableItems->orderByRaw('ISNULL(sort_number), sort_number ' . strtoupper($orderDirection) . ', name ASC, id ASC');
            } else {
                $tableItems->orderBy($orderColumn, $orderDirection)->orderBy('id', 'asc');
            }
            $tableItems = $tableItems->paginate($request->input('length'))->onEachSide(1);
            $tableItems->getCollection()->transform(function ($item) {
                $item->setHidden([]);
                return $item;
            });
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('admin/service/category/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'serviceCategoryGroups' => [
                        'options' => $categoryGroupService->getOptions(),
                        'filters' => $categoryGroupService->getFilters(),
                    ],
                ]
            )
        ]);
    }

    public function store(ServiceCategoryRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category.create'), 403);
        $credentials = [
            'service_category_group_id' => $request->input('service.category.group.id'),
            'name'                      => $request->input('service.category.name'),
            'slug'                      => Str::slug($request->input('service.category.name')),
            'profit_configs'            => $request->input('service.category.profit_configs'),
        ];

        $insertData = ServiceCategory::create($credentials);
        $insertActivityLog =  AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.create-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.service, common:labels.category',
                'id' => $insertData->id,
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.create_successful', [
                'item' => __('common.labels.category'),
                'id' => $insertData->id,
            ]),
        ]);
    }

    public function update(ServiceCategory $target, ServiceCategoryRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category.create'), 403);
        $credentials = [
            'service_category_group_id' => $request->input('service.category.group.id'),
            'name'                      => $request->input('service.category.name'),
            'slug'                      => Str::slug($request->input('service.category.name')),
            'profit_configs'            => $request->input('service.category.profit_configs'),
        ];

        $updateData = $target->update($credentials);
        if ($target->wasChanged()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.update-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.service, common:labels.category',
                    'id' => $target->id,
                ],
                'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
            ]);
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.update_successful', [
                'item' => __('common.labels.category'),
                'id' => $target->id,
            ]),
        ]);
    }

    public function action($action, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category.delete'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        if ($action === 'trash') $targets = ServiceCategory::with('services')->whereIn('id', $ids)->withoutTrashed()->get();
        if (in_array($action, ['restore', 'destroy'])) {
            $targets = ServiceCategory::with('services')->whereIn('id', $ids)->onlyTrashed()->get();
        }
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        foreach ($targets as $target) {
            try {
                switch ($action) {
                    case 'trash':
                        if ($target->delete()) {
                            $target->services()->delete();
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.trash-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.service, common:labels.category',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    case 'restore':
                        if ($target->trashed() && $target->restore()) {
                            $target->services()->onlyTrashed()->restore();
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.restore-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.service, common:labels.category',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    case 'destroy':
                        if ($target->trashed()) {
                            $target->services()->withTrashed()->forceDelete();
                            $target->forceDelete();
                            AdminActivityLog::create([
                                'admin_id'   => auth('admin')->user()->id,
                                'ip_address' => request()->ip(),
                                'user_agent' => request()->header('User-Agent'),
                                'content_key'  => 'admin/common:log.destroy-successful',
                                'content_params'  => (object) [
                                    'item' => 'common:labels.service, common:labels.category',
                                    'id' => $target->id,
                                ],
                            ]);
                        }
                        break;
                    default:
                        break;
                }
            } catch (Exception $e) {
                return response()->json([
                    'status'  => false,
                    'message' => __('common.toast.exception')
                ], 500);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __("admin/common.toast.{$action}_successful", [
                'item' => __('common.labels.category'),
                'id' => implode(', ', $ids),
            ]),
        ]);
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('admin/common.toast.invalid_id'),
            ], 400);
        }
        $targets = ServiceCategory::whereIn('id', $ids)->get();
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        foreach ($targets as $target) {
            if ($columnName == 'status') {
                $columnNameLabel = 'status';
                $from = $target->status;
            }
            if ($columnName == 'service_category_group_id') {
                $columnNameLabel = 'group';
                $from = $target->service_category_group_id;
            }
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.service, common:labels.category',
                        'id' => $target->id,
                        'column' => 'common:labels.' . $columnNameLabel . '',
                        'from' => $from,
                        'to' => $columnValue,
                    ],
                    'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
                ]);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.switch_successful', [
                'item' => __('common.labels.category'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }

    public function options(Request $request, CategoryService $categoryService)
    {
        $items = collect($categoryService->getOptions());
        if ($items->isNotEmpty()) {
            return response()->json([
                'status' => true,
                'items'  => $items->values(),
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => __('common.empty.no_data_found')
        ], 404);
    }

    public function sort(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category.update'), 403);
        $items = $request->input('items', []);
        if (!is_array($items) || empty($items)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_input'),
            ], 422);
        }
        $orderedIds = [];
        foreach ($items as $item) {
            $id = is_array($item) ? ($item['value'] ?? null) : null;
            if (is_numeric($id)) {
                $orderedIds[] = (int) $id;
            }
        }
        $orderedIds = array_values(array_unique($orderedIds));
        if (empty($orderedIds)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_input'),
            ], 422);
        }
        // Dialog "Urutkan" hanya mengirim kategori dari satu group. Urutan yang
        // diminta hanya berlaku untuk anggota group itu, jadi tiap anggota
        // ditempatkan kembali ke slot sort_number yang memang sudah ditempati
        // group tersebut. Dengan begitu group lain tidak bergeser sama sekali
        // dan penomoran tetap global 1..N (tidak ada sort_number kembar).
        $this->applyOrderWithinSlots($orderedIds);
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'   => auth('admin')->user()->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->header('User-Agent'),
            'content_key'  => 'admin/common:log.sort-successful',
            'content_params'  => (object) [
                'item' => 'common:labels.service, common:labels.category',
            ],
        ]);
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.sort_successful', [
                'item' => __('common.labels.category'),
            ]),
        ]);
    }

    /**
     * Urutan global saat ini sebagai daftar id (integer). PDO bisa mengembalikan
     * string tergantung driver, jadi semua id dipaksa int agar perbandingan
     * array_search(..., true) di helper lain tetap valid.
     */
    private function currentGlobalOrder(): array
    {
        return ServiceCategory::withTrashed()
            ->orderByRaw('ISNULL(sort_number), sort_number ASC, name ASC, id ASC')
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();
    }

    /**
     * Terapkan urutan global: pindahkan $ids (urutan dipertahankan) ke posisi $start (1-based)
     * di antara kategori lain, lalu renumber sort_number 1..N untuk SELURUH baris.
     * Renumber global mencegah sort_number kembar antar-group.
     */
    private function applyGlobalOrder(array $ids, int $start, ?array $globalOrder = null): void
    {
        $globalOrder = $globalOrder ?? $this->currentGlobalOrder();
        $ids = array_values(array_unique(array_map('intval', $ids)));
        $remaining = array_values(array_diff($globalOrder, $ids));
        $position = max(0, min(count($remaining), $start - 1));
        $newOrder = array_merge(array_slice($remaining, 0, $position), $ids, array_slice($remaining, $position));

        $this->renumberGlobal($newOrder);
    }

    /**
     * Tulis sort_number 1..N sesuai urutan id yang diberikan, dalam satu transaksi.
     */
    private function renumberGlobal(array $orderedIds): void
    {
        DB::transaction(function () use ($orderedIds) {
            foreach (array_values($orderedIds) as $index => $id) {
                ServiceCategory::withTrashed()->whereId($id)->update([
                    'sort_number' => $index + 1,
                ]);
            }
        });
    }

    /**
     * Terapkan urutan untuk subset kategori (dialog "Urutkan" per-group) tanpa
     * menggeser kategori di luar subset: slot (sort_number) milik subset diisi
     * ulang sesuai urutan yang diminta. Bila ada baris tanpa sort_number,
     * seluruh tabel dinormalkan dulu agar penomoran tetap 1..N tanpa kembar.
     */
    private function applyOrderWithinSlots(array $orderedIds): void
    {
        $orderedIds = array_values(array_unique(array_map('intval', $orderedIds)));
        DB::transaction(function () use ($orderedIds) {
            // Baris tanpa sort_number (kondisi awal data lama) membuat penomoran
            // tidak bisa dihitung per-slot. Normalkan dulu seluruh tabel mengikuti
            // urutan tampil saat ini, TANPA memindahkan kategori mana pun.
            if (ServiceCategory::withTrashed()->whereNull('sort_number')->exists()) {
                $this->renumberGlobal($this->currentGlobalOrder());
            }

            $globalOrder = $this->currentGlobalOrder();
            $slots = [];
            foreach ($orderedIds as $orderedId) {
                $position = array_search($orderedId, $globalOrder, true);
                if ($position !== false) {
                    $slots[] = (int) $position + 1;
                }
            }
            sort($slots);

            if (count($slots) !== count($orderedIds)) {
                // Ada id yang tidak dikenal; biarkan urutan apa adanya daripada
                // menebak posisi dan menggeser kategori lain.
                return;
            }

            foreach ($orderedIds as $index => $id) {
                ServiceCategory::withTrashed()->whereId($id)->update([
                    'sort_number' => $slots[$index],
                ]);
            }
        });
    }

    public function reorder(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('service.category.update'), 403);
        $validator = Validator::make($request->all(), [
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'start' => ['nullable', 'integer', 'min:1'],
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_input'),
            ], 422);
        }

        $ids = array_values(array_unique(array_map('intval', $request->input('ids', []))));
        $existing = ServiceCategory::withTrashed()->whereIn('id', $ids)->pluck('id')->all();
        $ids = array_values(array_intersect($ids, $existing));
        if (empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }

        try {
            $this->applyGlobalOrder($ids, (int) $request->input('start', 1));

            AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content_key'  => 'admin/common:log.sort-successful',
                'content_params'  => (object) [
                    'item' => 'common:labels.service, common:labels.category',
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.exception'),
            ], 500);
        }

        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.sort_successful', [
                'item' => __('common.labels.category'),
            ]),
        ]);
    }
}

class ServiceCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('service.category.access')
                && $admin->hasRole('service.category.update');
        }

        return $admin->hasRole('service.category.access')
            && $admin->hasRole('service.category.create');
    }

    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'service.category.group.id'             => ['required', 'exists:service_category_groups,id'],
            'service.category.name'                 => ['required', Rule::unique('service_categories', 'name')->ignore($id)],
            'service.category.profit_configs.type'  => ['required', 'in:fixed,percentage'],
            'service.category.profit_configs.value' => ['required', 'numeric'],
        ];
    }

    public function attributes()
    {
        return [
            'service.category.group.id'             => __('common.labels.group'),
            'service.category.name'                 => __('common.labels.name'),
            'service.category.profit_configs.type'  => __('admin/common.labels.profit_type'),
            'service.category.profit_configs.value' => __('admin/common.labels.profit_value'),
        ];
    }
}
