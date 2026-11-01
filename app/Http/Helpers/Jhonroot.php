<?php

use App\Models\Deposit\Deposit;
use App\Models\Order\Order;
use App\Models\Order\OrderCancel;
use App\Models\Order\OrderRefill;
use App\Models\Ticket\Ticket;
use App\Models\User\User;
use App\Models\Website\WebsiteBlog;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

function website_config($i = 'website')
{
	try {
		if ($i == 'all') return app('jhonroot');
		if (is_array($i)) {
			$websiteConfigs = [];
			foreach ($i as $item) {
				$websiteConfigs[$item] = app('jhonroot')[$item];
			}
			return $websiteConfigs;
		}
		return app('jhonroot')[$i];
	} catch (Exception $error) {
		if ($i == 'all') return json_decode(config('app.jhonroot'));
		if (is_array($i)) {
			$websiteConfigs = [];
			foreach ($i as $item) {
				$websiteConfigs[$item] = json_decode(config('app.jhonroot.' . $item));
			}
			return $websiteConfigs;
		}
		return json_decode(config('app.jhonroot.' . $i));
	}
}

function escape_input($i = '')
{
	return htmlspecialchars(strip_tags($i), ENT_QUOTES, 'UTF-8');
}

function generate_api_key()
{
	do {
		$generateAPIKey = implode('-', str_split(substr(bin2hex(random_bytes(16)), 0, 30), 6));
	} while (User::whereJsonContains('api->api_key', $generateAPIKey)->exists());
	return $generateAPIKey;
}

function format_rupiah($i)
{
	return 'Rp ' . number_format($i, 0, ',', '.');
}

function format_amount($i)
{
	return number_format($i, 0, ',', '.');
}


function generate_deposit_payment_gateway_payment_id()
{
	for ($i = 0; $i < 100; $i++) {
		$depositPaymentGatewayRefID = date('YmdHis') . str_pad(rand(0, 99999), 4, '0', STR_PAD_LEFT);
		if (Deposit::where('payment_gateway_payment_id', $depositPaymentGatewayRefID)->first() == true) continue;
		break;
	}
	return $depositPaymentGatewayRefID;
}

function generate_unique_code()
{
	for ($i = 0; $i < 100; $i++) {
		$uniqueCode = rand(1, 500) / 10000;
		$uniqueCode = number_format($uniqueCode, 4, '.', '');
		if (Deposit::where([
			['unique_code', $uniqueCode],
			['status', 'pending']
		])->exists()) {
			continue;
		}
		return $uniqueCode;
	}
}

function maskFullName($name)
{
	$cleanName = trim($name);
	$length = strlen($cleanName);
	if ($length <= 5) {
		return strtolower(substr($cleanName, 0, 1) . str_repeat('x', 9) . substr($cleanName, -1));
	}
	return strtolower(substr($cleanName, 0, 3) . str_repeat('x', 9) . substr($cleanName, -2));
}

function format_currency($amount, $isFloated = false)
{
	$language = request()->cookie('locale');
	$locales = Cache::get('locales');
	$target = collect($locales)->firstWhere('locale', $language);
	$base = collect($locales)->firstWhere('usd_rate', '1.000000');

	// Tanpa locale valid, nilai tidak bisa dikonversi dengan benar. Early-return
	// nilai mentah (kurs USD) membuat pembanding min/max memakai mata uang lain
	// dari yang ditampilkan frontend (mis. Rp1.000 dibanding batas 549,45 USD).
	if (!$target || !$base) {
		Log::warning('format_currency: locale cookie tidak valid, konversi mata uang dilewati.', [
			'locale_cookie' => $language,
		]);
		return $amount;
	}

	$targetRate = (float) $target['usd_rate'];
	$baseRate = (float) $base['usd_rate'];
	$localeCode = $target['locale_code'];
	$currencyCode = $target['currency_code'];
	$maxFractionDigits = $target['max_decimal_digits'] ?? 4;
	$decimalSeparator = $target['decimal_separator'] ?? '.';
	$thousandSeparator = $target['thousand_separator'] ?? ',';

	if ($amount === null || $amount === '') {
		return null;
	}

	$convertedAmount = $amount * ($targetRate / $baseRate);
	if ($isFloated) {
		return round($convertedAmount, $maxFractionDigits);
	}

	$formatter = new NumberFormatter($localeCode, NumberFormatter::CURRENCY);
	$formatter->setAttribute(NumberFormatter::MIN_FRACTION_DIGITS, 0);
	$formatter->setAttribute(NumberFormatter::MAX_FRACTION_DIGITS, $maxFractionDigits);
	$formatted = $formatter->formatCurrency($convertedAmount, $currencyCode);
	if ($decimalSeparator !== '.' || $thousandSeparator !== ',') {
		$formatted = str_replace(['.', ','], ['DEC_TMP', 'THOUSAND_TMP'], $formatted);
		$formatted = str_replace('DEC_TMP', $decimalSeparator, $formatted);
		$formatted = str_replace('THOUSAND_TMP', $thousandSeparator, $formatted);
	}

	return $formatted;
}

function get_updated_columns($originalData = [], $changedData = [])
{
	$changesWithOriginal = [];
	$excludedColumns = ['created_at', 'updated_at', 'deleted_at'];
	foreach ($changedData as $field => $to) {
		if (in_array($field, $excludedColumns)) {
			continue;
		}
		$changesWithOriginal[$field] = [
			'from' => $field === 'password' ? '********' : $originalData[$field] ?? null,
			'to' => $field === 'password' ? '********' : $to,
		];
	}
	return $changesWithOriginal;
}
function generate_sitemap_xml()
{
	$sitemap = Sitemap::create();

	$sitemap->add(
		Url::create('/')
			->setLastModificationDate(
				now()
			)
	);

	$sitemap->add(
		Url::create('/blogs')
			->setLastModificationDate(
				now()
			)
	);

	$sitemap->add(
		Url::create('/auth/signin')
			->setLastModificationDate(
				now()
			)
	);

	$sitemap->add(
		Url::create('/auth/signup')
			->setLastModificationDate(
				now()
			)
	);

	$sitemap->add(
		Url::create('/auth/forgot-password')
			->setLastModificationDate(
				now()
			)
	);

	$sitemap->add(
		Url::create('/services')
			->setLastModificationDate(
				now()
			)
	);

	WebsiteBlog::each(function (WebsiteBlog $blog) use ($sitemap) {
		$sitemap->add(
			Url::create("/blogs/{$blog->slug}")
				->setLastModificationDate(
					Carbon::parse($blog->updated_at)
				)
		);
	});

	$sitemap->writeToFile(public_path('sitemap.xml'));

	return true;
}
