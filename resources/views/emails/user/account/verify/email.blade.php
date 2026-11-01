@extends('emails.layout')
@section('content')
    <table class="wrapper table" width="100%" cellpadding="0" cellspacing="0" role="presentation"
        data-token="{{ md5($props->user->email . '-' . $props->user->username . '-' . rand(1, 99999)) }}">
        <tr>
            <td align="center td">
                <table class="content table-2" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="header td-2">
                            <a href="{{ url('/') }}" class="href">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td class="body td-3" width="100%" cellpadding="0" cellspacing="0">
                            <table class="inner-body table-3" align="center" width="570" cellpadding="0" cellspacing="0"
                                role="presentation">
                                <tr>
                                    <td class="content-cell td-4">
                                        <h2 class="h1">
                                            Hi {{ $props->user->full_name }}!
                                        </h2>
                                        <p class="p">
                                            Please click the "Verify Email" button below to verify your account's email.
                                        </p>
                                        <table class="action table-4" align="center" width="100%" cellpadding="0"
                                            cellspacing="0" role="presentation">
                                            <tr>
                                                <td align="center td-5">
                                                    <table class="table-5" width="100%" border="0" cellpadding="0"
                                                        cellspacing="0" role="presentation">
                                                        <tr>
                                                            <td class="td-6" align="center">
                                                                <table class="table-5" border="0" cellpadding="0"
                                                                    cellspacing="0" role="presentation">
                                                                    <tr>
                                                                        <td>
                                                                            <a href="{{ route('user.account.verify.email.check', [
                                                                                'user' => $props->user->username,
                                                                                'userVerifyEmail' => $props->verifyToken,
                                                                            ]) }}"
                                                                                class="button button-primary"
                                                                                target="_blank"
                                                                                style="
                                                                                    box-sizing: border-box;
                                                                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
                                                                                        'Segoe UI Symbol';
                                                                                    position: relative;
                                                                                    -webkit-text-size-adjust: none;
                                                                                    border-radius: 4px;
                                                                                    color: #fff;
                                                                                    display: inline-block;
                                                                                    overflow: hidden;
                                                                                    text-decoration: none;
                                                                                    background-color: #004869;
                                                                                    border-bottom: 8px solid #004869;
                                                                                    border-left: 18px solid #004869;
                                                                                    border-right: 18px solid #004869;
                                                                                    border-top: 8px solid #004869;
                                                                                ">
                                                                                Verify Email
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <table class="subcopy table-7" width="100%" cellpadding="0" cellspacing="0"
                                            role="presentation">
                                            <tr>
                                                <td class="td-6">
                                                    <p class="p" style="font-size: 14px;">
                                                        If you are experiencing issues clicking the "Verify Email" button,
                                                        please click the link below:
                                                        <span>
                                                            <a href="{{ route('user.account.verify.email.check', [
                                                                'user' => $props->user->username,
                                                                'userVerifyEmail' => $props->verifyToken,
                                                            ]) }}"
                                                                style="color: #004869;">
                                                                Verify Email
                                                            </a>
                                                        </span>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; position: relative;">
                            <table class="footer" align="center" width="570" cellpadding="0" cellspacing="0"
                                role="presentation">
                                <tr>
                                    <td class="content-cell td-7" align="center">
                                        <p class="p-2">
                                            © {{ date('Y') }} {{ website_config()->name }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
@endsection
