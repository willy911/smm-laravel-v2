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

namespace App\Http\Controllers\Admin\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Admin\Admin;
use App\Models\Admin\AdminRole;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('admin/dashboard');
        abort_if(auth('admin')->user()->adminRole->is_primary <> '1', 404);
        if ($request->has('page')) {
            $tableItems = AdminRole::withTrashed()->when($request->input(), function ($query) use ($request) {
                if ($request->input('filter.created_at.start') && $request->input('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->input('filter.created_at.start') && !$request->input('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->input('filter.search')) {
                    $query->whereAny([
                        'id',
                        'name',
                    ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            return response()->json([
                'status'  => true,
                'data'    => $tableItems,
            ]);
        }
        return inertia('Admin/Admin/Role/Index');
    }

    public function create()
    {
        abort_if(auth('admin')->user()->adminRole->is_primary <> '1', 404);
        return inertia('Admin/Admin/Role/Form', [
            'pageProps' => [
                'target'      => new Admin(),
            ]
        ]);
    }

    public function store(AdminRoleRequest $request)
    {
        abort_if(auth('admin')->user()->adminRole->is_primary <> '1', 404);
        $credentials = [
            'name'  => escape_input($request->input('admin.role.name')),
            'roles' => json_encode($request->input('roles')),
        ];
        $insertData = AdminRole::create($credentials);
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'    => auth('admin')->user()->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content'     => 'menambahkan Admin - Peran dengan ID <b>' . $insertData->id . '</b>.'
        ]);
        return to_route('admin.admins.roles.index')->with('responseSuccess', 'Admin - Peran dengan ID <b>' . $insertData->id . '</b> berhasil ditambahkan.');
    }

    public function edit(AdminRole $target)
    {
        abort_if(auth('admin')->user()->adminRole->is_primary <> '1' || $target->is_primary == '1', 404);
        return inertia('Admin/Admin/Role/Form', [
            'pageProps' => [
                'target'      => $target,
                'adminRoles'  => AdminRole::latest('id')->get(['id AS value', 'name AS label']),
            ]
        ]);
    }

    public function update(AdminRole $target, AdminRoleRequest $request)
    {
        abort_if(auth('admin')->user()->adminRole->is_primary <> '1' || $target->is_primary == '1', 404);
        $credentials = [
            'name' => escape_input($request->input('admin.role.name')),
            'roles' => json_encode($request->input('roles')),
        ];
        $updateData = $target->update($credentials);
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'        => auth('admin')->user()->id,
            'ip_address'      => request()->ip(),
            'user_agent'      => request()->header('User-Agent'),
            'content'         => 'memperbarui Admin - Peran dengan ID <b>' . $target->id . '</b>.',
        ]);
        return to_route('admin.admins.roles.index')->with('responseSuccess', 'Admin - Peran dengan ID <b>' . $target->id . '</b> berhasil diperbarui.');
    }

    public function trash(AdminRole $target)
    {
        abort_if(!request()->ajax() || auth('admin')->user()->adminRole->is_primary <> '1' || $target->is_primary == '1', 404);
        if ($target->delete()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content'    => 'memindahkan Admin - Peran dengan ID <b>' . $target->id . '</b> ke sampah.',
            ]);
            $target->update([
                'updated_at' => now(),
            ]);
            return response()->json([
                'status'  => true,
                'message' => 'Admin - Peran dengan ID <b>' . $target->id . '</b> berhasil dipindahkan ke sampah.',
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => 'Terjadi kesalahan.'
        ]);
    }

    public function restore(AdminRole $target)
    {
        abort_if(!request()->ajax() || auth('admin')->user()->adminRole->is_primary <> '1' || $target->is_primary == '1', 404);
        if ($target->trashed() && $target->restore()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content'    => 'memulihkan Admin - Peran dengan ID <b>' . $target->id . '</b>.',
            ]);
            $target->update([
                'updated_at' => now()
            ]);
            return response()->json([
                'status'  => true,
                'message' => 'Admin - Peran dengan ID <b>' . $target->id . '</b> berhasil dipulihkan.',
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => 'Terjadi kesalahan.'
        ]);
    }

    public function destroy(AdminRole $target)
    {
        abort_if(!request()->ajax() || auth('admin')->user()->adminRole->is_primary <> '1' || $target->is_primary == '1', 404);
        if ($target->delete() && $target->forceDelete()) {
            $insertActivityLog = AdminActivityLog::create([
                'admin_id'   => auth('admin')->user()->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'content'    => 'menghapus Admin - Peran dengan ID <b>' . $target->id . '</b> secara permanen.',
            ]);
            return response()->json([
                'status'  => true,
                'message' => 'Admin - Peran dengan ID <b>' . $target->id . '</b> berhasil dihapus secara permanen.',
            ]);
        }
        return response()->json([
            'status'  => false,
            'message' => 'Terjadi kesalahan.'
        ]);
    }
}

class AdminRoleRequest extends FormRequest
{
    public function rules(Request $request)
    {
        $id = $this->route('target')->id ?? null;
        return [
            'admin.role.name' => ['required', Rule::unique('admin_roles', 'name')->ignore($id)],
        ];
    }

    public function attributes()
    {
        return [
            'admin.role.name' => 'Nama',
        ];
    }
}
