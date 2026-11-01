<?php

namespace App\Services\Admin\Admin;

use App\Models\Admin\AdminGroup;

class GroupService
{
    public function getOptions(): array
    {
        return AdminGroup::latest()->get()->map(function ($row) {
            return [
                'value'   => $row->id,
                'label'   => $row->name,
            ];
        })->toArray();
    }

    public function getFilters(): array
    {
        return AdminGroup::has('admins')->withCount(['admins'])->latest()->get()->map(function ($row) {
            return [
                'value'   => $row->id,
                'label'   => $row->name,
                'count'   => $row->admins_count,
            ];
        })->toArray();
    }
}
