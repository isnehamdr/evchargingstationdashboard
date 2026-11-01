<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Tenant;
use App\Services\Gateways\EsewaGateway;
use App\Services\Gateways\KhaltiGateway;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class PaymentApiController extends Controller
{
    public function start(Request $request, int $id, PaymentService $payments, KhaltiGateway $khalti)
    {
        $data = $request->validate(['gateway' => ['required', 'in:khalti,esewa']]);

        // Only your own booking
        $booking = Booking::withoutGlobalScopes()
            ->where('driver_id', $request->user()->id)
            ->findOrFail($id);

        $tenant = Tenant::findOrFail($booking->tenant_id);
        $cfg = $tenant->payment_settings ?? [];

        if (!($cfg[$data['gateway'] . '_enabled'] ?? false)) {
            return response()->json(['message' => 'This operator does not accept that payment method.'], 422);
        }

        $payment = $payments->start($booking, $data['gateway']);

        if ($data['gateway'] === 'khalti') {
            $secret = $cfg['khalti_key'] ?? '';
            abort_if($secret === '', 422, 'This operator has not finished setting up Khalti.');

            $res = $khalti->initiate($payment, $booking, $secret);
            $payment->forceFill(['gateway_data' => ['pidx' => $res['pidx']]])->save();

            return response()->json([
                'reference'   => $payment->reference,
                'payment_url' => $res['payment_url'],   // open in a WebView or the browser
            ], 201);
        }

        // eSewa needs a form POST, so we host a tiny auto-submitting page (link valid 30 minutes)
        [$code, $secret] = app(EsewaGateway::class)->credentials($cfg);
        abort_if($code === '' || $secret === '', 422, 'This operator has not finished setting up eSewa.');

        return response()->json([
            'reference'   => $payment->reference,
            'payment_url' => URL::temporarySignedRoute('pay.esewa.form', now()->addMinutes(30), ['reference' => $payment->reference]),
        ], 201);
    }

    /** The app polls this after the WebView closes. */
    public function status(Request $request, string $reference)
    {
        $payment = Payment::withoutGlobalScopes()
            ->where('driver_id', $request->user()->id)
            ->where('reference', $reference)
            ->firstOrFail();

        return response()->json(['data' => [
            'reference' => $payment->reference,
            'status'    => $payment->status,
            'amount'    => $payment->amount,
        ]]);
    }
}