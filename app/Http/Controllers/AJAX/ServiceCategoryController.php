<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\AJAX;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Service\Service;
use App\Models\Service\ServiceCategory;
use App\Models\Service\ServiceCategoryGroup;
use App\Models\Service\ServiceFavorite;
use App\Models\User\User;
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class ServiceCategoryController extends Controller
{
    public function __construct(Request $request)
    {
        // if (!$request->ajax()) return abort('404');
    }

    public function index(Request $request)
    {
        $serviceCategories = ServiceCategoryGroup::withWhereHas('serviceCategories', function ($query) use ($request) {
            $query->whereHas('services', function ($query) use ($request) {
                $query->where('status', 1);
                if ($request->boolean('service.is_favorites')) {
                    $query->whereHas('serviceFavorites', function ($query) {
                        if (auth()->check()) $query->where('user_id', auth()->id());
                    });
                }
                if ($request->filled('order.type') && $request->input('order.type') == 'mass') {
                    $query->where('type', 'primary');
                }
            })->where('status', 1)->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC');
        })->when($request->input(), function ($query) use ($request) {
            if ($request->filled('service.category.group.id') && $request->input('service.category.group.id') <> 'all') {
                $query->where('id', $request->input('service.category.group.id'));
            }
        })->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->get()->map(function ($group) {
            return [
                'label' => $group->name,
                'type' => $group->type,
                'icon' => $group->icon,
                'emoji' => $group->emoji,
                'image' => $group->image,
                'options' => $group->serviceCategories->map(function ($category) {
                    return [
                        'value' => $category->id,
                        'label' => $category->name,
                    ];
                })->values()
            ];
        })->filter(function ($item) {
            return $item['options']->isNotEmpty();
        })->values();
        if ($serviceCategories->isEmpty()) return response()->json([
            'status'  => false,
            'message' => __('services.toast.no_categories_found')
        ]);
        return response()->json([
            'status'            => true,
            'serviceCategories' => $serviceCategories,
        ]);
    }

    public function group(Request $request)
    {
        $checkServiceCategories = $serviceCategories = ServiceCategory::has('services')->with('serviceCategoryGroup')->where('status', '1')->when($request->input(), function ($query) use ($request) {
            if ($request->filled('service.category.group.id') && $request->input('service.category_group.id')) {
                $query->where('service_category_group_id', $request->input('service.category_group.id'));
            }
        })->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->get();
        $categories = $serviceCategories->map(function ($row) {
            return [
                'value'   => $row->id,
                'label'   => $row->name,
            ];
        });
        $categoriess = $serviceCategories->groupBy(function ($item) {
            return $item->serviceCategoryGroup->name ?? 'Tanpa Group';
        })->map(function ($group, $groupName) {
            return [
                'label' => $groupName,
                'options' => $group->map(function ($category) {
                    return [
                        'value' => $category->id,
                        'label' => $category->name,
                    ];
                })->values()
            ];
        })->values();
        if ($checkServiceCategories->isEmpty()) return response()->json([
            'status'  => false,
            'message' => __('services.toast.no_categories_found')
        ]);
        return response()->json([
            'status'            => true,
            'serviceCategories' => $categories,
            'serviceCategoriess' => $categoriess,
        ]);
    }
}
