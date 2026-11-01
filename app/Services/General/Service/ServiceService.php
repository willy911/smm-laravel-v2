<?php

namespace App\Services\General\Service;

use App\Models\Service\Service;
use Illuminate\Http\Request;

class ServiceService
{
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    private function applyFilters($query)
    {
        if ($this->request->filled('service.category.id')) {
            $query->whereIn('service_category_id', explode(',', $this->request->input('service.category.id')));
        }
        if ($this->request->has('onlyRelated')) $query->has($this->request->input('onlyRelated'));
        return $query;
    }

    public function getOptions(): array
    {
        return Service::when($this->request->input(), fn($query) => $this->applyFilters($query))->orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')->get()->map(function ($row) {
            return [
                'value'   => $row->id,
                'label'   => $row->name,
            ];
        })->toArray();
    }
}
