<?php

namespace App\Console\Commands;

use App\Models\AdminNotification;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Tenant;
use App\Services\Gateways\EsewaGateway;
use App\Services\Gateways\KhaltiGateway;
use App\Services\PaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RecheckPayments extends Command
{
    protected $signature = 'payments:recheck {--min-age=3 : Only check payments older than this many minutes}';

    protected $description = 'Ask the gateways about payments that never returned to our server';

    public function handle(KhaltiGateway $khalti, EsewaGateway $esewa, PaymentService $payments): int
    {
        // Give up on very old attempts
        Payment::withoutGlobalScopes()
            ->where('status', 'initiated')
            ->where('created_at', '<', now()->subDay())
            ->update(['status' => 'failed']);

        $pending = Payment::withoutGlobalScopes()
            ->where('status', 'initiated')
            ->where('created_at', '<=', now()->subMinutes((int) $this->option('min-age')))
            ->where('created_at', '>=', now()->subDay())
            ->limit(100)
            ->get();

        $settled = 0;

        foreach ($pending as $payment) {
            try {
                $cfg = Tenant::find($payment->tenant_id)?->payment_settings ?? [];

                $done = $payment->gateway === 'khalti'
                    ? $this->checkKhalti($payment, $cfg, $khalti, $payments)
                    : $this->checkEsewa($payment, $cfg, $esewa, $payments);

                if ($done) {
                    $settled++;
                }
            } catch (\Throwable $e) {
                // One bad payment must not stop the others
                Log::warning('payments:recheck failed for ' . $payment->reference, ['error' => $e->getMessage()]);
            }
        }

        $this->info("Checked {$pending->count()}, settled {$settled}.");

        return self::SUCCESS;
    }

    private function checkKhalti(Payment $payment, array $cfg, KhaltiGateway $khalti, PaymentService $payments): bool
    {
        $pidx = $payment->gateway_data['pidx'] ?? null;
        $secret = $cfg['khalti_key'] ?? '';

        if (!$pidx || $secret === '') {
            return false;
        }

        $result = $khalti->lookup($pidx, $secret);
        $status = $result['status'] ?? null;

        if ($status === 'Completed' && (int) ($result['total_amount'] ?? 0) === (int) round($payment->amount * 100)) {
            $payments->markPaid($payment, $pidx, $result);
            $this->warnIfBookingCancelled($payment);
            return true;
        }

        if (in_array($status, ['User canceled', 'Expired'], true)) {
            $payments->markFailed($payment, $result);
            return true;
        }

        return false;   // still pending: try again next time
    }

    private function checkEsewa(Payment $payment, array $cfg, EsewaGateway $esewa, PaymentService $payments): bool
    {
        [$code, $secret] = $esewa->credentials($cfg);

        if ($code === '') {
            return false;
        }

        $total = $esewa->amountText($payment->amount);
        $result = $esewa->status($code, $total, $payment->reference);
        $status = $result['status'] ?? null;

        if ($status === 'COMPLETE') {
            $payments->markPaid($payment, (string) ($result['ref_id'] ?? $payment->reference), $result);
            $this->warnIfBookingCancelled($payment);
            return true;
        }

        // eSewa links last about 30 minutes, so after that "not found" means it was never paid
        $linkExpired = $payment->created_at->lte(now()->subMinutes(35));

        if ($status === 'CANCELED' || ($status === 'NOT_FOUND' && $linkExpired)) {
            $payments->markFailed($payment, $result);
            return true;
        }

        return false;
    }

    /** Money arrived for a booking that was cancelled in the meantime: someone must refund it. */
    private function warnIfBookingCancelled(Payment $payment): void
    {
        $booking = Booking::withoutGlobalScopes()->find($payment->booking_id);

        if ($booking && $booking->status === 'Cancelled') {
            AdminNotification::notify(
                'payment',
                'Critical',
                'Refund needed',
                "{$booking->booking_id} was cancelled but a payment of Rs. " . number_format($payment->amount) . ' arrived.',
                route('ourrevenue.index', [], false),
                ['booking_id' => $booking->booking_id],
                $payment->tenant_id
            );
        }
    }
}