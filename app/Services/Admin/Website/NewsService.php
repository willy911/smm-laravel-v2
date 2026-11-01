<?php

namespace App\Services\Admin\Website;

use App\Models\Product\ProductCategory;
use App\Models\Product\ProductCategoryGroup;
use App\Models\Website\WebsiteNews;
use Illuminate\Http\Request;

class NewsService
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
        return WebsiteNews::when($this->request->input(), fn($query) => $this->applyFilters($query))->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->get()->map(function ($row) {
            return [
                'value'   => $row->id,
                'label'   => $row->title,
            ];
        })->toArray();
    }
}
