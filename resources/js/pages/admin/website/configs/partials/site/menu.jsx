import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function Menu({ form }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <div>
                <h3 className="mb-4 text-lg font-medium">User</h3>
                <div className="space-y-4">
                    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                        <div className="space-y-1.5">
                            <Label htmlFor="userVerifyEmail">Verify User's Email Address</Label>
                        </div>
                        <Switch
                            id="userVerifyEmail"
                            checked={form.data.menu.user.account_verification.enabled}
                            onCheckedChange={(checked) => {
                                form.setData((data) => ({
                                    ...form.data,
                                    menu: {
                                        ...data.menu,
                                        user: {
                                            ...data.menu.user,
                                            account_verification: {
                                                ...data.menu.user.account_verification,
                                                enabled: checked,
                                            },
                                        },
                                    },
                                }));
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                        <div className="space-y-1.5">
                            <Label htmlFor="userLeaderboard">Leaderboard</Label>
                        </div>
                        <Switch
                            id="userLeaderboard"
                            checked={form.data.menu.user.leaderboard.enabled}
                            onCheckedChange={(checked) => {
                                form.setData((data) => ({
                                    ...form.data,
                                    menu: {
                                        ...data.menu,
                                        user: {
                                            ...data.menu.user,
                                            leaderboard: {
                                                ...data.menu.user.leaderboard,
                                                enabled: checked,
                                            },
                                        },
                                    },
                                }));
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                        <div className="space-y-1.5">
                            <Label htmlFor="userAffiliate">Affiliate</Label>
                        </div>
                        <Switch
                            id="userAffiliate"
                            checked={form.data.menu.user.affiliate?.enabled == '1'}
                            onCheckedChange={(checked) => {
                                form.setData((data) => ({
                                    ...form.data,
                                    menu: {
                                        ...data.menu,
                                        user: {
                                            ...data.menu.user,
                                            affiliate: {
                                                ...(data.menu.user.affiliate ?? {}),
                                                enabled: checked ? '1' : '0',
                                            },
                                        },
                                    },
                                }));
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                        <div className="space-y-1.5">
                            <Label htmlFor="userOrderSummary">Order Summary</Label>
                        </div>
                        <Switch
                            id="userOrderSummary"
                            checked={form.data.menu.user.order.summary.enabled}
                            onCheckedChange={(checked) => {
                                form.setData((data) => ({
                                    ...form.data,
                                    menu: {
                                        ...data.menu,
                                        user: {
                                            ...data.menu.user,
                                            order: {
                                                ...data.menu.user.order,
                                                summary: {
                                                    ...data.menu.user.order.summary,
                                                    enabled: checked,
                                                },
                                            },
                                        },
                                    },
                                }));
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                        <div className="space-y-1.5">
                            <Label htmlFor="userAuthSignup">Signup</Label>
                        </div>
                        <Switch
                            id="userAuthSignup"
                            checked={form.data.menu.user.auth.signup.enabled}
                            onCheckedChange={(checked) => {
                                form.setData((data) => ({
                                    ...form.data,
                                    menu: {
                                        ...data.menu,
                                        user: {
                                            ...data.menu.user,
                                            auth: {
                                                ...data.menu.user.auth,
                                                signup: {
                                                    ...data.menu.user.auth.signup,
                                                    enabled: checked,
                                                },
                                            },
                                        },
                                    },
                                }));
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                        <div className="space-y-1.5">
                            <Label htmlFor="userAuthResetPassword">Reset Password</Label>
                        </div>
                        <Switch
                            id="userAuthResetPassword"
                            checked={form.data.menu.user.auth.reset_password.enabled}
                            onCheckedChange={(checked) => {
                                form.setData((data) => ({
                                    ...form.data,
                                    menu: {
                                        ...data.menu,
                                        user: {
                                            ...data.menu.user,
                                            auth: {
                                                ...data.menu.user.auth,
                                                reset_password: {
                                                    ...data.menu.user.auth.reset_password,
                                                    enabled: checked,
                                                },
                                            },
                                        },
                                    },
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>
            <div>
                <h3 className="mb-4 text-lg font-medium">Guest</h3>
                <div className="space-y-4">
                    <div className="flex flex-row items-center justify-between space-y-2 rounded-lg border p-3 pb-1 shadow-sm">
                        <div className="space-y-1.5">
                            <Label htmlFor="guestDashboardSummary">Landing Summary</Label>
                        </div>
                        <Switch
                            id="guestDashboardSummary"
                            checked={form.data.menu.guest.dashboard.summary.enabled}
                            onCheckedChange={(checked) => {
                                form.setData((data) => ({
                                    ...form.data,
                                    menu: {
                                        ...data.menu,
                                        guest: {
                                            ...data.menu.guest,
                                            dashboard: {
                                                ...data.menu.guest.dashboard,
                                                summary: {
                                                    ...data.menu.guest.dashboard.summary,
                                                    enabled: checked,
                                                },
                                            },
                                        },
                                    },
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>
            {/* <div className="flex items-center space-x-2">
                <Checkbox
                    id="authRecoveryPassword"
                    value="1"
                    checked={form.data.menu.auth.recovery_password.enabled == '1' ? true : false}
                    onCheckedChange={(checked) => {
                        form.setData((data) => ({
                            ...form.data,
                            menu: {
                                ...data.menu,
                                auth: {
                                    ...data.menu.auth,
                                    recovery_password: {
                                        ...data.menu.auth.recovery_password,
                                        enabled: checked,
                                    },
                                },
                            },
                        }));
                    }}
                />
                <label
                    htmlFor="authRecoveryPassword"
                    className="mt-[2px] text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Aktifkan Menu Pemulihan Kata Sandi
                </label>
            </div> */}
        </div>
    );
}
