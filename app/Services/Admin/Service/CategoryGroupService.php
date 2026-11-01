<?php

namespace App\Services\Admin\Service;

use App\Models\Service\ServiceCategoryGroup;
use Illuminate\Http\Request;

class CategoryGroupService
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    private function applyFilters($query)
    {
        if ($this->request->has('onlyRelated')) $query->has($this->request->input('onlyRelated'));
        return $query;
    }

    public function getOptions(): array
    {
        return ServiceCategoryGroup::when($this->request->input(), fn($query) => $this->applyFilters($query))->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->get()->map(function ($row) {
            return [
                'value' => $row->id,
                'label' => $row->name,
                'icon'  => $row->icon,
                'emoji' => $row->emoji,
                'image' => $row->image,
                'type'  => $row->type,
            ];
        })->toArray();
    }

    public function getFilters(): array
    {
        return ServiceCategoryGroup::has('serviceCategories')->withCount(['serviceCategories'])->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->get()->map(function ($row) {
            return [
                'value' => $row->id,
                'label' => $row->name,
                'icon'  => $row->icon,
                'emoji' => $row->emoji,
                'image' => $row->image,
                'type'  => $row->type,
                // 'count'   => $row->product_categories_count,
            ];
        })->toArray();
    }
}
