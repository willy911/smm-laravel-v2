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

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminActivityLog;
use App\Models\Ticket\Ticket;
use App\Enums\Ticket\Ticket as TicketEnum;
use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Ticket\TicketReply;
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
        if ($request->has('page')) {
            $tableItems = Ticket::where('user_id', auth()->id())->when($request->input(), function ($query) use ($request) {
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
        return inertia('user/ticket/index', [
            'pageProps' => Inertia::defer(
                fn() => [
                    'departments' => Ticket::where([
                        ['user_id', auth()->id()],
                    ])->select('department')->selectRaw('COUNT(*) as count')->groupBy('department')->latest('department')->get()->map(function ($row) {
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

    public function create()
    {
        return inertia('user/ticket/send', [
            'pageProps' => Inertia::defer(
                // fn() => Cache::remember('ticket_send_' . auth()->id() . '', now()->addHours(6), function () {
                //     $orders = Order::where('user_id', auth()->id())->latest()->limit(100)->get(['id AS value', 'id AS label', 'status']);
                //     $deposits = Deposit::where('user_id', auth()->id())->latest()->limit(100)->get(['id AS value', 'id AS label', 'status']);
                //     return [
                //         'orders' => $orders,
                //         'deposits' => $deposits,
                //     ];
                // }),
                function () {
                    $orders = Order::where('user_id', auth()->id())->latest()->limit(100)->get(['id AS value', 'id AS label', 'status']);
                    $deposits = Deposit::where('user_id', auth()->id())->latest()->limit(100)->get(['id AS value', 'id AS label', 'status']);
                    return [
                        'orders' => $orders,
                        'deposits' => $deposits,
                    ];
                },
            )
        ]);
    }

    public function store(TicketSendRequest $request)
    {
        $checkTicketLimit = Ticket::whereNotIn('status', ['closed'])->where('user_id', auth()->id())->count();
        if ($checkTicketLimit >= 5) return redirect()->back()->with('responseError', __('tickets.toast.limit_exceeded'));
        $credentials = [
            'user_id'    => auth()->id(),
            'department' => escape_input($request->input('ticket.department')),
            'data_id'    => implode(',', $request->input('ticket.data_id')),
            'request'    => escape_input($request->input('ticket.request')),
            'subject'    => escape_input($request->input('ticket.subject')),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ];
        $insertTicket = Ticket::create($credentials);
        $insertActivityLog = UserActivityLog::create([
            'user_id'     => auth()->id(),
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content_key'  => 'tickets:log.create-successful',
            'content_params'  => (object) ['ticket_id' => $insertTicket->id],
        ]);
        $insertTicketReply = TicketReply::create([
            'ticket_id'  => $insertTicket->id,
            'sender'     => 'user',
            'message'    => escape_input($request->input('ticket.message')),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);
        $insertTicketReply = TicketReply::create([
            'ticket_id'  => $insertTicket->id,
            'sender'     => 'admin',
            'message'    => 'Tiket Anda telah kami masukkan ke dalam sistem dan akan segera kami proses. Terima kasih.'
        ]);
        return to_route('user.tickets.index')->with('responseSuccess', __('tickets.toast.create_successful', ['ticket_id' => $insertTicket->id]));
    }

    public function edit(Ticket $target)
    {
        $target->update([
            'is_read_user' => '1'
        ]);
        return inertia('user/ticket/reply', [
            'pageProps' => [
                'target'         => $target->load(['ticketReplies']),
            ]
        ]);
    }

    public function update(Ticket $target, TicketReplyRequest $request)
    {
        $insertTicketReply = TicketReply::create([
            'ticket_id'  => $target->id,
            'sender'     => 'user',
            'message'    => escape_input($request->input('ticket.reply.message')),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);
        $updateData = $target->update([
            'status'        => 'user_reply',
            'is_read_admin' => '0',
            'updated_at'    => now()
        ]);
        $insertActivityLog = UserActivityLog::create([
            'user_id'    => auth()->user()->id,
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->header('User-Agent'),
            'content_key'  => 'tickets:log.reply-successful',
            'content_params'  => (object) ['ticket_id' => $target->id],
        ]);
        return redirect()->back()->with('responseSuccess', __('tickets.toast.reply_successful', ['ticket_id' => $target->id]));
    }
}

class TicketSendRequest extends FormRequest
{
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
