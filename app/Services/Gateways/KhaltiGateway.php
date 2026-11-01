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

    /** Returns ['pidx' => ..., 'payment_url' => ...] */
    public function initiate(Payment $payment, Booking $booking, string $secret): array
    {
        $paisa = (int) round($payment->amount * 100);
        abort_if($paisa < 1000, 422, 'Khalti needs an amount of at least Rs 10.');

        $res = Http::withHeaders(['Authorization' => 'key ' . $secret])
            ->acceptJson()->timeout(15)
            ->post($this->base() . '/epayment/initiate/', [
                'return_url'          => route('pay.khalti.return'),
                'website_url'         => config('app.url'),
                'amount'              => $paisa,
                'purchase_order_id'   => $payment->reference,
                'purchase_order_name' => 'Booking ' . $booking->booking_id,
            ]);

        abort_unless($res->successful() && $res->json('pidx'), 502, 'Khalti could not start the payment.');

        return $res->json();
    }

    /** Asks Khalti directly. Never trust the browser redirect alone. */
    public function lookup(string $pidx, string $secret): array
    {
        $res = Http::withHeaders(['Authorization' => 'key ' . $secret])
            ->acceptJson()->timeout(15)
            ->post($this->base() . '/epayment/lookup/', ['pidx' => $pidx]);

        return $res->successful() ? $res->json() : [];
    }
}