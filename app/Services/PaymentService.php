<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    /** Create a pending payment for a booking. Amount comes from the booking. */
    public function start(Booking $booking, string $gateway): Payment
    {
        abort_if($booking->payment_status === 'Paid', 422, 'This booking is already paid.');
        abort_unless(in_array($booking->status, ['Upcoming', 'Confirmed'], true), 422, 'This booking cannot be paid.');

        $payment = new Payment([
            'gateway'   => $gateway,
            'amount'    => $booking->amount,
            'status'    => 'initiated',
            'reference' => 'PAY-' . strtoupper(Str::random(12)),
        ]);
        $payment->tenant_id = $booking->tenant_id;
        $payment->booking_id = $booking->id;
        $payment->driver_id = $booking->driver_id;
        $payment->save();

        return $payment;
    }

    /**
     * Call ONLY after the gateway itself has confirmed the money.
     * Safe to call twice: a payment is only ever marked paid once.
     */
    public function markPaid(Payment $payment, string $gatewayRef, array $raw = []): Payment
    {
        return DB::transaction(function () use ($payment, $gatewayRef, $raw) {
            $payment = Payment::withoutGlobalScopes()->lockForUpdate()->findOrFail($payment->id);

            if ($payment->status === 'paid') {
                return $payment;
            }

            $payment->forceFill([
                'status'       => 'paid',
                'gateway_ref'  => $gatewayRef,
                'gateway_data' => $raw,
                'paid_at'      => now(),
            ])->save();

            $booking = Booking::withoutGlobalScopes()->findOrFail($payment->booking_id);
            $booking->forceFill([
                'payment_status' => 'Paid',
                'payment_method' => ucfirst($payment->gateway),
                'status'         => $booking->status === 'Upcoming' ? 'Confirmed' : $booking->status,
            ])->save();

            return $payment;
        });
    }

    public function markFailed(Payment $payment, array $raw = []): void
    {
        $payment = Payment::withoutGlobalScopes()->findOrFail($payment->id);

        if ($payment->status === 'initiated') {
            $payment->forceFill(['status' => 'failed', 'gateway_data' => $raw])->save();
        }
    }
}