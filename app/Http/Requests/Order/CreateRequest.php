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

namespace App\Http\Requests\Order;

use App\Models\Service\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Request;

class CreateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules(Request $request)
    {
        $checkService = $service = Service::find($request->input('service_id'));
        return [
            'service_id'          => ['required', 'exists:services,id'],
            'target'        => ['required', 'string'],
            'quantity'      =>  [
                'required',
                'numeric',
                'integer',
                ($checkService && !is_null($service->min)) ? 'min:' . $service->min : '',
                ($checkService && !is_null($service->max)) ? 'max:' . $service->max : '',
            ],
            'comments'      => (($checkService && in_array($service->type, ['custom_comments', 'custom_comments_package', 'comment_replies']))) ? ['required', 'string'] : [],
            'usernames'     => (($checkService && in_array($service->type, ['mentions_custom_list', 'mentions_with_hashtags']))) ? ['required', 'string'] : [],
            'username'      => (($checkService && in_array($service->type, ['mentions_user_followers', 'comment_likes', 'comment_replies']))) ? ['required', 'string'] : [],
            'hashtags'      => (($checkService && $service->type == 'mentions_with_hashtags')) ? ['required', 'string'] : [],
            'hashtag'       => (($checkService && $service->type == 'mentions_hashtag')) ? ['required', 'string'] : [],
            'media_url'     => (($checkService && $service->type == 'mentions_media_likers')) ? ['required', 'string', 'url'] : [],
            'answer_number' => (($checkService && $service->type == 'poll')) ? ['required', 'numeric', 'integer'] : [],
        ];
    }

    public function attributes()
    {
        return [
            'service_id'    => 'service_id',
            'target'        => 'target',
            'quantity'      => 'quantity',
            'comments'      => 'comments',
            'usernames'     => 'usernames',
            'username'      => 'username',
            'hashtags'      => 'hashtags',
            'hashtag'       => 'hashtag',
            'media_url'     => 'media_url',
            'answer_number' => 'answer_number',
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
