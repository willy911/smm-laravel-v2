<?php

namespace App\Services\General\Service;

use App\Models\Service\ServiceCategory;
use App\Models\Service\ServiceCategoryGroup;
use Illuminate\Http\Request;

class CategoryService
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    private function applyFilters($query)
    {
        if ($this->request->filled('service.category.group.id')) {
            $query->whereIn('service_category_group_id', explode(',', $this->request->input('service.category.group.id')));
        }
        if ($this->request->has('onlyRelated')) $query->has($this->request->input('onlyRelated'));
        return $query;
    }

    public function getOptions(): array
    {
        $categories = ServiceCategory::where('status', '1')->when($this->request->input(), fn($query) => $this->applyFilters($query))
            ->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
            ->get()
            ->groupBy('service_category_group_id');

        if ($categories->isEmpty()) {
            return [];
        }

        $groups = ServiceCategoryGroup::whereIn('id', $categories->keys())
            ->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
            ->get();

        return $groups->map(function ($group) use ($categories) {
            $items = ($categories[$group->id] ?? collect())->map(function ($row) {
                return [
                    'value' => $row->id,
                    'label' => $row->name,
                ];
            })->values()->toArray();

            return [
                'value' => $group->id,
                'label' => $group->name,
                'type'  => $group->type,
                'icon'  => $group->icon,
                'emoji' => $group->emoji,
                'image' => $group->image,
                'items' => $items,
            ];
        })->values()->toArray();
    }

    public function getFilters(): array
    {
        $categories = ServiceCategory::where('status', '1')->whereHas('services', function ($query) {
            $query->where('status', '1');
        })->withCount([
            'services' => function ($query) {
                $query->where('status', '1');
            }
        ])->when($this->request->input(), fn($query) => $this->applyFilters($query))
            ->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
            ->get()
            ->groupBy('service_category_group_id');

        if ($categories->isEmpty()) {
            return [];
        }

        $groups = ServiceCategoryGroup::whereIn('id', $categories->keys())
            ->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
            ->get();

        return $groups->map(function ($group) use ($categories) {
            $items = ($categories[$group->id] ?? collect())->map(function ($row) {
                return [
                    'value' => $row->id,
                    'label' => $row->name,
                    'count' => $row->services_count,
                ];
            })->values()->toArray();

            return [
                'value' => $group->id,
                'label' => $group->name,
                'type'  => $group->type,
                'icon'  => $group->icon,
                'emoji' => $group->emoji,
                'image' => $group->image,
                'items' => $items,
            ];
        })->values()->toArray();
    }
}
