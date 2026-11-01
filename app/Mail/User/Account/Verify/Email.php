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

namespace App\Mail\User\Account\Verify;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Envelope;

class Email extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public $props,
    ) {
        $this->onConnection('sync');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(website_config('smtp')->from ?: config('mail.from.address'), website_config()->name ?: config('mail.from.name')),
            subject: 'Verifikasi Email - ' . website_config()->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user.account.verify.email',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
