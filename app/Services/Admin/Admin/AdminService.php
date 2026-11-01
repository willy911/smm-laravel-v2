<?php

namespace App\Services\Admin\Admin;

use App\Models\Admin\Admin;
use Illuminate\Support\Str;
use App\Models\User\UserGroup;

class AdminService
{
    public function getOptions(): array
    {
        return UserGroup::latest()->get()->map(function ($row) {
            return [
                'value'   => $row->id,
                'label'   => $row->name,
            ];
        })->toArray();
    }

    public function getFilters($onlyRelated): array
    {
        return Admin::has($onlyRelated)->withCount([$onlyRelated])->latest()->get()->map(function ($row) use ($onlyRelated) {
            $relationSnake = Str::snake($onlyRelated);
            return [
                'value' => $row->id,
                'label' => $row->username,
                'count' => $row->{$relationSnake . '_count'},
            ];
        })->toArray();
    }
}
