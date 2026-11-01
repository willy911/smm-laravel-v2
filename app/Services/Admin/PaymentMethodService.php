<?php

namespace App\Services\Admin;

use App\Models\PaymentMethod;
use App\Models\Product\ProductCategory;
use App\Models\Product\ProductCategoryGroup;
use Illuminate\Http\Request;

class PaymentMethodService
{
    protected ?string $onlyRelated = null;
    protected Request $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function onlyRelated(string $relation): self
    {
        $this->onlyRelated = $relation;
        return $this;
    }

    protected function resolveOnlyRelated(): ?string
    {
        return $this->onlyRelated
            ?? $this->request->input('onlyRelated');
    }

    private function applyFilters($query)
    {
        $relation = $this->resolveOnlyRelated();

        if ($relation) {
            $query->has($relation)
                ->withCount($relation);
        }

        return $query;
    }

    public function getOptions(): array
    {
        return PaymentMethod::orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
            ->tap(fn($q) => $this->applyFilters($q))
            ->get()
            ->map(fn($row) => [
                'value' => $row->id,
                'label' => $row->name,
            ])
            ->toArray();
    }

    public function getFilters(): array
    {
        return PaymentMethod::orderByRaw('ISNULL(sort_number), sort_number ASC, id DESC')
            ->tap(fn($q) => $this->applyFilters($q))
            ->get()
            ->map(fn($row) => [
                'value' => $row->id,
                'label' => $row->name,
                'count' => $row->deposits_count ?? 0,
            ])
            ->toArray();
    }
}
