<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Ticket\Ticket;
use App\Enums\Ticket\Ticket as TicketEnum;
use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Ticket\TicketReply;
use App\Models\User\User;
use App\Models\User\UserActivityLog;
use App\Models\User\UserBalanceLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TicketController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('precognitive', only: ['store', 'update']),
        ];
    }

    public function index(Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('ticket.access'), 403);
        if ($request->has('page')) {
            $tableItems = Ticket::with('user')->when($request->input(), function ($query) use ($request) {
                if ($request->filled('filter.created_at.start') && $request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                    $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->input('filter.created_at.end'))));
                } elseif ($request->filled('filter.created_at.start') && !$request->filled('filter.created_at.end')) {
                    $query->whereDate('created_at', date('Y-m-d', strtotime($request->input('filter.created_at.start'))));
                }
                if ($request->filled('filter.updated_at.start') && $request->filled('filter.updated_at.end')) {
                    $query->whereDate('updated_at', '>=', date('Y-m-d', strtotime($request->input('filter.updated_at.start'))));
                    $query->whereDate('updated_at', '<=', date('Y-m-d', strtotime($request->input('filter.updated_at.end'))));
                } elseif ($request->filled('filter.updated_at.start') && !$request->filled('filter.updated_at.end')) {
                    $query->whereDate('updated_at', date('Y-m-d', strtotime($request->input('filter.updated_at.start'))));
                }
                if ($request->filled('filter.user_id')) {
                    $query->whereIn('user_id', explode(',', $request->input('filter.user_id')));
                }
                if ($request->filled('filter.status')) {
                    $query->whereIn('status', explode(',', $request->input('filter.status')));
                }
                if ($request->filled('filter.department')) {
                    $query->whereIn('department', explode(',', $request->input('filter.department')));
                }
                if ($request->filled('filter.search')) {
                    $query->where(function ($query) use ($request) {
                        $query->whereAny([
                            'id',
                            'data_id',
                            'subject',
                        ], 'LIKE', '%' . ($request->input('filter.search')) . '%');
                    });
                }
            })->orderBy($request->input('order.column'), $request->input('order.direction'))->paginate($request->input('length'))->onEachSide(1);
            return response()->json([
                'status' => true,
                'data'   => $tableItems,
            ]);
        }
        return inertia('admin/ticket/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'users' => User::whereHas('tickets')->withCount(['tickets'])->latest('id')->limit(100)->get()->map(function ($row) {
                        return [
                            'value'   => $row->id,
                            'label'   => $row->username,
                            'count'   => $row->tickets_count,
                        ];
                    }),
                    'departments' => Ticket::select('department')->selectRaw('COUNT(*) as count')->groupBy('department')->latest('department')->get()->map(function ($row) {
                        return [
                            'value'   => $row->department,
                            'label'   => TicketEnum::getValue('ARRAY_DEPARTMENT_LABELS')[$row->department],
                            'count'   => $row->count,
                        ];
                    }),
                ],
            )
        ]);
    }

    public function edit(Ticket $target)
    {
        abort_unless(auth('admin')->user()->hasRole('ticket.update'), 403);
        $target->update([
            'is_read_admin' => '1'
        ]);
        return inertia('admin/ticket/reply', [
            'pageProps' => [
                'target'         => $target->load(['user', 'ticketReplies']),
            ]
        ]);
    }

    public function update(Ticket $target, TicketReplyRequest $request)
    {
        abort_unless(auth('admin')->user()->hasRole('ticket.update'), 403);
        $insertTicketReply = TicketReply::create([
            'ticket_id'  => $target->id,
            'sender'     => 'admin',
            'message'    => escape_input($request->input('ticket.reply.message')),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);
        $updateData = $target->update([
            'status'        => 'answered',
            'is_read_admin' => '0',
            'updated_at'    => now()
        ]);
        $insertActivityLog = AdminActivityLog::create([
            'admin_id'    => auth('admin')->user()->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content_key'  => 'tickets:log.reply-successful',
            'content_params'  => (object) ['ticket_id' => $target->id],
        ]);
        return redirect()->back()->with('responseSuccess', __('tickets.toast.reply_successful', ['ticket_id' => $target->id]));
    }

    public function switch($columnName, $columnValue, Request $request)
    {
        abort_unless(auth('admin')->user()->hasRole('ticket.update'), 403);
        $ids = $request->input('id', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'status'  => false,
                'message' => __('common.toast.invalid_id'),
            ], 400);
        }
        $targets = Ticket::whereIn('id', $ids)->get();
        if ($targets->isEmpty()) {
            return response()->json([
                'status'  => false,
                'message' => __('common.empty.no_data_found'),
            ], 404);
        }
        foreach ($targets as $target) {
            if ($columnName == 'status') {
                $columnNameLabel = 'status';
                $from = $target->status;
            }
            if ($from != $columnValue) {
                $target->update([$columnName => $columnValue]);
                AdminActivityLog::create([
                    'admin_id'   => auth('admin')->user()->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'content_key'  => 'admin/common:log.switch-successful',
                    'content_params'  => (object) [
                        'item' => 'common:labels.ticket',
                        'id' => $target->id,
                        'column' => 'common:labels.' . $columnNameLabel . '',
                        'from' => $from,
                        'to' => $columnValue,
                    ],
                    'updated_columns'  => (object) get_updated_columns($target->getPrevious(), $target->getChanges()),
                ]);
            }
        }
        return response()->json([
            'status'  => true,
            'message' => __('admin/common.toast.switch_successful', [
                'item' => __('common.labels.ticket'),
                'id' => implode(', ', $ids),
                'column' => __('common.labels.' . $columnNameLabel . ''),
            ]),
        ]);
    }
}

class TicketSendRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('ticket.access')
                && $admin->hasRole('ticket.update');
        }

        return $admin->hasRole('ticket.access')
            && $admin->hasRole('ticket.create');
    }

    public function rules(Request $request)
    {
        return [
            'ticket.department' => ['required', 'in:order,deposit,other'],
            'ticket.data_id' => [
                Rule::requiredIf(fn() => in_array($request->input('ticket.department'), ['order', 'deposit'])),
                'array',
                Rule::exists($request->input('ticket.department') === 'order' ? 'orders' : 'deposits', 'id')->where(function ($query) {
                    return $query->where('user_id', auth()->id());
                }),
            ],
            'ticket.request' => [
                Rule::requiredIf(fn() => in_array($request->input('ticket.department'), ['order'])),
            ],
            'ticket.subject'    => ['required', 'string'],
            'ticket.message'    => ['required', 'string'],
        ];
    }

    public function attributes()
    {
        return [
            'ticket.department' => __('tickets.labels.department'),
            // 'ticket.data_id'    => request()->input('ticket.department') === 'order' ? 'ID ' . __('tickets.labels.order') : 'ID ' . __('tickets.labels.deposit'),
            'ticket.data_id'    => __('tickets.labels.data_id'),
            'ticket.request'    => __('tickets.labels.request'),
            'ticket.subject'    => __('tickets.labels.subject'),
            'ticket.message'    => __('tickets.labels.message'),
        ];
    }
}

class TicketReplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = auth('admin')->user();

        if (!$admin) {
            return false;
        }

        if ($this->route('target')) {
            return $admin->hasRole('ticket.access')
                && $admin->hasRole('ticket.update');
        }

        return $admin->hasRole('ticket.access')
            && $admin->hasRole('ticket.create');
    }

    public function rules(Request $request)
    {
        return [
            'ticket.reply.message' => ['required', 'string'],
        ];
    }

    public function attributes()
    {
        return [
            'ticket.reply.message' => __('tickets.labels.message'),
        ];
    }
}
