<?php

namespace App\Services\Gateways;

use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class EsewaGateway
{
    public function formUrl(): string
    {
        return config('chargesathi.sandbox')
            ? 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
            : 'https://epay.esewa.com.np/api/epay/main/v2/form';
    }

    private function statusUrl(): string
    {
        return config('chargesathi.sandbox')
            ? 'https://rc.esewa.com.np/api/epay/transaction/status/'
            : 'https://epay.esewa.com.np/api/epay/transaction/status/';
    }

    /** Product code and secret. Sandbox uses eSewa's public test values. */
    public function credentials(array $cfg): array
    {
        if (config('chargesathi.sandbox')) {
            return ['EPAYTEST', config('chargesathi.esewa_test_secret')];
        }

        return [$cfg['esewa_merchant'] ?? '', $cfg['esewa_secret'] ?? ''];
    }

    /** The amount text must be identical in the form, the signature and the status check. */
    public function amountText($amount): string
    {
        return rtrim(rtrim(number_format((float) $amount, 2, '.', ''), '0'), '.');
    }

    public function sign(string $message, string $secret): string
    {
        return base64_encode(hash_hmac('sha256', $message, $secret, true));
    }

    public function formFields(Payment $payment, array $cfg): array
    {
        [$code, $secret] = $this->credentials($cfg);
        $total = $this->amountText($payment->amount);

        return [
            'amount'                  => $total,
            'tax_amount'              => '0',
            'total_amount'            => $total,
            'transaction_uuid'        => $payment->reference,
            'product_code'            => $code,
            'product_service_charge'  => '0',
            'product_delivery_charge' => '0',
            'success_url'             => route('pay.esewa.success'),
            'failure_url'             => route('pay.esewa.failure'),
            'signed_field_names'      => 'total_amount,transaction_uuid,product_code',
            'signature'               => $this->sign(
                "total_amount={$total},transaction_uuid={$payment->reference},product_code={$code}",
                $secret
            ),
        ];
    }

    /** Checks the signature on the data eSewa sent back to the browser. */
    public function callbackIsAuthentic(array $data, string $secret): bool
    {
        if (empty($data['signed_field_names']) || empty($data['signature'])) {
            return false;
        }

        $parts = [];
        foreach (explode(',', $data['signed_field_names']) as $field) {
            if (!array_key_exists($field, $data)) {
                return false;
            }
            $parts[] = $field . '=' . $data[$field];
        }

        return hash_equals($this->sign(implode(',', $parts), $secret), $data['signature']);
    }

    /** Asks eSewa directly. */
    public function status(string $code, string $total, string $uuid): array
    {
        $res = Http::acceptJson()->timeout(15)->get($this->statusUrl(), [
            'product_code'     => $code,
            'total_amount'     => $total,
            'transaction_uuid' => $uuid,
        ]);

        return $res->successful() ? $res->json() : [];
    }
}
