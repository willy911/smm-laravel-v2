<?php

namespace App\Services\Admin\User;

use App\Models\User\UserGroup;

class GroupService
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

    public function getFilters(): array
    {
        return UserGroup::has('users')->withCount(['users'])->latest()->get()->map(function ($row) {
            return [
                'value'   => $row->id,
                'label'   => $row->name,
                'count'   => $row->users_count,
            ];
        })->toArray();
    }
}
