<?php

namespace App\Services\Gateways;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class KhaltiGateway
{
    private function base(): string
    {
        return config('chargesathi.sandbox')
            ? 'https://dev.khalti.com/api/v2'
            : 'https://khalti.com/api/v2';
    }

    /** One place for the HTTP client, so both calls behave the same. */
    private function client(string $secret)
    {
        $http = Http::withHeaders(['Authorization' => 'key ' . $secret])
            ->acceptJson()
            ->timeout(15);

        // LOCAL TESTING ONLY. Remove once the certificate problem is fixed.
        if (app()->environment('local')) {
            $http = $http->withoutVerifying();
        }

        return $http;
    }

    /** Returns ['pidx' => ..., 'payment_url' => ...] */
  /** Returns ['pidx' => ..., 'payment_url' => ...] */
public function initiate(Payment $payment, Booking $booking, string $secret): array
{
    $paisa = (int) round($payment->amount * 100);
    abort_if($paisa < 1000, 422, 'Khalti needs an amount of at least Rs 10.');

    $res = $this->client($secret)->post($this->base() . '/epayment/initiate/', [
        'return_url'          => route('pay.khalti.return'),
        'website_url'         => config('app.url'),
        'amount'              => $paisa,
        'purchase_order_id'   => $payment->reference,
        'purchase_order_name' => 'Booking ' . $booking->booking_id,
    ]);

    if (!$res->successful()) {
        \Log::warning('Khalti initiate failed', ['status' => $res->status(), 'body' => $res->body()]);
    }

    abort_unless($res->successful() && $res->json('pidx'), 502, 'Khalti could not start the payment.');

    return $res->json();
}

    /** Asks Khalti directly. Never trust the browser redirect alone. */
    public function lookup(string $pidx, string $secret): array
    {
        $res = $this->client($secret)->post($this->base() . '/epayment/lookup/', ['pidx' => $pidx]);

        // Cancelled and expired payments come back as HTTP 400 with a status, so return the body either way.
        return $res->json() ?? [];
    }
}