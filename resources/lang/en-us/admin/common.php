<?php

return [
    'labels' => [
        'admins' => 'Admins',
        'users' => 'Users',
        'user' => 'User',
        'last_signin' => 'Last Signin',
        'is_api_access_enabled' => 'API Access',
        'min_deposit' => 'Minimum Deposit',
    ],

    'actions' => [
        'mark_item_as' => 'Mark as <item>:as</item>',
        'create_item' => 'Create :item',
        'edit_item' => 'Edit :item',
        'trash'   => 'Move to Trash',
        'restore' => 'Restore',
        'destroy' => 'Delete Permanently',
    ],

    'toast' => [
        'create_successful' => ':item with ID <b>:id</b> successfully created.',
        'update_successful' => ':item with ID <b>:id</b> successfully updated.',
        'switch_successful' => ':column of :item with ID <b>:id</b> successfully updated.',
        'trash_successful' => ':item with ID <b>:id</b> successfully moved to trash.',
        'restore_successful' => ':item with ID <b>:id</b> successfully restored.',
        'destroy_successful' => ':item with ID <b>:id</b> permanently deleted.',
        'invalid_id'        => 'Invalid ID.',
    ],

    'log' => [
        'create_successful' => 'Created :item with ID <b>:id</b>.',
        'update_successful' => 'Updated :item with ID <b>:id</b>.',
        'switch_successful' => 'Updated :item with ID <b>:id</b>, column :column from <b>:from</b> -> <b>:to</b>.',
        'trash_successful' => 'Moved :item with ID <b>:id</b> to trash.',
        'restore_successful' => 'Restored :item with ID <b>:id</b>.',
        'destroy_successful' => 'Permanently deleted :item with ID <b>:id</b>.',
    ],

    'status' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
    ],

    'dialog' => [
        'unsaved' => [
            'title' => 'Close form?',
            'description' => 'You have unsaved changes.',
            'cancel_button' => 'No, Cancel',
            'confirm_button' => 'Yes, Close without saving!',
        ],
        'trash' => [
            'title' => 'Are you sure?',
            'description' => 'Move :item <b>:value</b> to the trash folder.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Continue!',
        ],
        'restore' => [
            'title' => 'Are you sure?',
            'description' => 'Restore :item <b>:value</b> from the trash folder.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Continue!',
        ],
        'destroy' => [
            'title' => 'Are you sure?',
            'description' => 'This action cannot be undone. It will permanently delete :item <b>:value</b> from the database.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Continue!',
        ],
        'close' => [
            'title' => 'Close Ticket?',
            'description' => 'Close ticket <b>:id</b>.',
            'cancel_button' => 'Cancel',
            'confirm_button' => 'Yes, Close!',
        ],
    ],

];
