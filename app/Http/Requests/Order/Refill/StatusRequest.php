<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhonroott   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace App\Http\Requests\Order\Refill;

use App\Models\Service\Service;
use App\Rules\MultipleOrderRefID;
use App\Rules\SingleOrderRefillRefID;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Request;

class StatusRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules(Request $request)
    {
        $checkService = $service = Service::find($request->input('service_id'));
        return [
            'id' => [
                'required',
                'string',
            ],
        ];
    }

    public function attributes()
    {
        return [
            'id' => 'id',
        ];
    }

    public function failedValidation(Validator $validator)
    {
        foreach ($validator->errors()->getMessages() as $key => $value) {
            $error_key[] = $value;
        }
        foreach ($error_key as $key => $value) {
            $error_message[] = strtr(strtolower($value[0]), array(
                '- '     => '',
                '<b>'     => '',
                '</b>'     => '',
            ));
        }
        throw new HttpResponseException(response()->json([
            'status'  => false,
            'message' => 'Invalid Payload',
            'errors'  => $error_message,
        ], 400, [], JSON_PRETTY_PRINT));
    }
}
