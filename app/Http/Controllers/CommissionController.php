<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CommissionSettlement;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        $period = $this->period($request);
        $kept = $this->keptByTenant($period);
        $settled = CommissionSettlement::where('period', $period)->get()->keyBy('tenant_id');
        $pct = (float) config('chargesathi.commission_percent');

        $rows = $monthEnd = Carbon::createFromFormat('Y-m', $period)->endOfMonth();

$rows = Tenant::with('plan:id,name,price_monthly')->orderBy('name')->get()->map(function ($t) use ($kept, $settled, $pct, $monthEnd) {
    $k = $kept[$t->id] ?? null;
    $s = $settled->get($t->id);

    if ($s) {
        // Settled months keep the amounts that were invoiced
        $keptAmount = (float) $s->kept_amount;
        $commission = (float) $s->commission_amount;
        $planFee    = (float) $s->plan_fee;
    } else {
        $keptAmount = round((float) ($k->kept ?? 0), 2);
        $commission = round($keptAmount * $pct / 100, 2);

        // Bill the plan only for months the operator existed and was active (not trial or suspended)
        $billable = $t->status === 'active' && $t->created_at->lte($monthEnd);
        $planFee  = $billable ? (float) ($t->plan->price_monthly ?? 0) : 0;
    }

    return [
        'id'         => $t->id,
        'name'       => $t->name,
        'plan'       => $t->plan?->name,
        'bookings'   => (int) ($k->bookings ?? 0),
        'kept'       => $keptAmount,
        'commission' => $commission,
        'plan_fee'   => $planFee,
        'total_due'  => round($commission + $planFee, 2),
        'settled'    => (bool) $s,
        'paid_at'    => $s?->paid_at,
    ];
});

        return Inertia::render('AdminPages/Commission', [
            'period'  => $period,
            'percent' => $pct,
            'rows'    => $rows,
            'totals'  => [
                'kept'       => $rows->sum('kept'),
                'commission' => $rows->sum('commission'),
                'plan_fees'  => $rows->sum('plan_fee'),
                'unsettled'  => $rows->where('settled', false)->sum('total_due'),
            ],
        ]);
    }

    /** Mark one operator's month as settled. Amounts are recalculated here, never taken from the page. */
    public function settle(Request $request, Tenant $tenant)
    {
        $period = $this->period($request);
        $k = $this->keptByTenant($period)[$tenant->id] ?? null;

        $kept = round((float) ($k->kept ?? 0), 2);

        CommissionSettlement::updateOrCreate(
            ['tenant_id' => $tenant->id, 'period' => $period],
            [
                'kept_amount'       => $kept,
                'commission_amount' => round($kept * (float) config('chargesathi.commission_percent') / 100, 2),
                'plan_fee'          => (float) ($tenant->plan->price_monthly ?? 0),
                'status'            => 'paid',
                'paid_at'           => now(),
                'note'              => $request->validate(['note' => ['nullable', 'string', 'max:255']])['note'] ?? null,
            ]
        );

        return back()->with('success', "{$tenant->name} marked as settled for {$period}.");
    }

    private function period(Request $request): string
    {
        $value = (string) $request->input('month', now()->format('Y-m'));

        return preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $value) ? $value : now()->format('Y-m');
    }

    private function keptByTenant(string $period)
    {
        $d = Carbon::createFromFormat('Y-m', $period)->startOfMonth();

        return Booking::withoutGlobalScopes()
            ->whereYear('booking_date', $d->year)
            ->whereMonth('booking_date', $d->month)
            ->selectRaw('tenant_id, COUNT(*) as bookings, ' . Booking::keptSql() . ' as kept')
            ->groupBy('tenant_id')
            ->get()
            ->keyBy('tenant_id');
    }
}