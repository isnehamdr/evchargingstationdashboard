<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Tenant;
use App\Services\Gateways\EsewaGateway;
use App\Services\Gateways\KhaltiGateway;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentCallbackController extends Controller
{
    public function khaltiReturn(Request $request, KhaltiGateway $khalti, PaymentService $payments)
    {
        $payment = Payment::withoutGlobalScopes()
            ->where('gateway', 'khalti')
            ->where('reference', (string) $request->query('purchase_order_id'))
            ->first();

        // The pidx must be the one we created for this payment
        if (!$payment || ($payment->gateway_data['pidx'] ?? null) !== $request->query('pidx')) {
            return $this->page(false, 'Payment not found.');
        }

        $cfg = Tenant::find($payment->tenant_id)?->payment_settings ?? [];
        $result = $khalti->lookup($payment->gateway_data['pidx'], $cfg['khalti_key'] ?? '');

        $paid = ($result['status'] ?? null) === 'Completed'
            && (int) ($result['total_amount'] ?? 0) === (int) round($payment->amount * 100);

        if ($paid) {
            $payments->markPaid($payment, $payment->gateway_data['pidx'], $result);
            return $this->page(true, 'Payment received. You can go back to the app.');
        }

        if (in_array($result['status'] ?? '', ['User canceled', 'Expired'], true)) {
            $payments->markFailed($payment, $result);
        }

        return $this->page(false, 'Payment not completed.');
    }

    /** Hosted page that posts the signed form to eSewa. */
    public function esewaForm(string $reference, EsewaGateway $esewa)
    {
        $payment = Payment::withoutGlobalScopes()
            ->where('gateway', 'esewa')->where('status', 'initiated')
            ->where('reference', $reference)->firstOrFail();

        $cfg = Tenant::find($payment->tenant_id)?->payment_settings ?? [];

        $inputs = '';
        foreach ($esewa->formFields($payment, $cfg) as $name => $value) {
            $inputs .= '<input type="hidden" name="' . e($name) . '" value="' . e($value) . '">';
        }

        return response(
            '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<body style="font-family:sans-serif;text-align:center;padding:48px">Redirecting to eSewa…'
            . '<form id="f" method="POST" action="' . e($esewa->formUrl()) . '">' . $inputs . '</form>'
            . '<script>document.getElementById("f").submit()</script></body>'
        );
    }

    public function esewaSuccess(Request $request, EsewaGateway $esewa, PaymentService $payments)
    {
        $data = json_decode(base64_decode((string) $request->query('data'), true) ?: '', true);

        if (!is_array($data) || empty($data['transaction_uuid'])) {
            return $this->page(false, 'Payment data missing.');
        }

        $payment = Payment::withoutGlobalScopes()
            ->where('gateway', 'esewa')->where('reference', $data['transaction_uuid'])->first();

        if (!$payment) {
            return $this->page(false, 'Payment not found.');
        }

        $cfg = Tenant::find($payment->tenant_id)?->payment_settings ?? [];
        [$code, $secret] = $esewa->credentials($cfg);

        if (!$esewa->callbackIsAuthentic($data, $secret)) {
            return $this->page(false, 'Payment could not be verified.');
        }

        // Ask eSewa directly, using OUR amount, not the one in the browser data
        $total = $esewa->amountText($payment->amount);
        $status = $esewa->status($code, $total, $payment->reference);

        if (($status['status'] ?? null) === 'COMPLETE') {
            $payments->markPaid($payment, (string) ($status['ref_id'] ?? $data['transaction_code'] ?? $payment->reference), $status);
            return $this->page(true, 'Payment received. You can go back to the app.');
        }

        return $this->page(false, 'Payment not completed.');
    }

    public function esewaFailure(Request $request, PaymentService $payments)
    {
        return $this->page(false, 'Payment was cancelled.');
    }

    private function page(bool $ok, string $message)
    {
        return response(
            '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<body style="font-family:sans-serif;text-align:center;padding:48px">'
            . '<h2 style="color:' . ($ok ? '#019654' : '#B91C1C') . '">' . ($ok ? 'Success' : 'Not completed') . '</h2>'
            . '<p>' . e($message) . '</p></body>'
        );
    }
}