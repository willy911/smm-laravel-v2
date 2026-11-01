<?php

namespace App\Services\Admin\Service;

use App\Models\Service\ServiceProvider;
use Illuminate\Http\Request;

class ProviderService
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
        return ServiceProvider::when($this->request->input(), fn($query) => $this->applyFilters($query))->latest()->get()->map(function ($row) {
            return [
                'value' => $row->id,
                'label' => $row->alias,
            ];
        })->toArray();
    }

    public function getFilters(): array
    {
        return ServiceProvider::has('services')->withCount(['services'])->latest()->get()->map(function ($row) {
            return [
                'value' => $row->id,
                'label' => $row->alias,
                'count'   => $row->services_count,
            ];
        })->toArray();
    }
}
