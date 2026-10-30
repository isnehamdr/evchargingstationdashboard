<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use App\Models\Plan;

class TenantController extends Controller
{
    public function index()
{
    $tenants = Tenant::query()
        ->withCount(['stations', 'bookings', 'users'])
        ->with([
            'plan:id,name',
            'users' => fn ($q) => $q->where('role', 'owner')->select('id', 'tenant_id', 'name', 'email'),
        ])
        ->latest()
        ->get()
        ->map(fn ($t) => [
            'id'                   => $t->id,
            'name'                 => $t->name,
            'slug'                 => $t->slug,
            'status'               => $t->status,
            'plan_id'              => $t->plan_id,
            'plan_name'            => $t->plan?->name,
            'subscription_ends_at' => $t->subscription_ends_at,
            'expired'              => !$t->subscriptionActive(),
            'stations_count'       => $t->stations_count,
            'bookings_count'       => $t->bookings_count,
            'users_count'          => $t->users_count,
            'owner'                => $t->users->first(),
            'created_at'           => $t->created_at,
        ]);

    return Inertia::render('AdminPages/Tenants', [
        'tenants' => $tenants,
        'plans'   => Plan::where('is_active', true)->orderBy('price_monthly')->get(['id', 'name', 'price_monthly']),
        'stats'   => [
            'total'     => $tenants->count(),
            'active'    => $tenants->where('status', 'active')->count(),
            'trial'     => $tenants->where('status', 'trial')->count(),
            'suspended' => $tenants->where('status', 'suspended')->count(),
        ],
    ]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        'name'           => ['required', 'string', 'max:255'],
        'contact_phone'  => ['nullable', 'string', 'max:30'],
        'status'         => ['required', Rule::in(['trial', 'active'])],
        'plan_id'        => ['required', 'exists:plans,id'],
        'owner_name'     => ['required', 'string', 'max:255'],
        'owner_email'    => ['required', 'email', 'max:255', 'unique:users,email'],
        'owner_password' => ['required', Password::defaults()],
    ]);

    DB::transaction(function () use ($validated) {
        $tenant = Tenant::create([
            'name'                 => $validated['name'],
            'slug'                 => $this->uniqueSlug($validated['name']),
            'contact_email'        => $validated['owner_email'],
            'contact_phone'        => $validated['contact_phone'] ?? null,
            'status'               => $validated['status'],
            'plan_id'              => $validated['plan_id'],
            'subscription_ends_at' => $validated['status'] === 'trial' ? now()->addDays(14) : now()->addMonth(),
        ]);

        $owner = new User([
            'name'     => $validated['owner_name'],
            'email'    => $validated['owner_email'],
            'password' => $validated['owner_password'],
            'role'     => 'owner',
        ]);
        $owner->tenant_id = $tenant->id;
        $owner->save();
    });

    return back()->with('success', 'Operator created.');
}

public function update(Request $request, Tenant $tenant)
{
    $validated = $request->validate([
        'name'          => ['sometimes', 'required', 'string', 'max:255'],
        'contact_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
        'status'        => ['sometimes', 'required', Rule::in(['trial', 'active', 'suspended'])],
        'plan_id'       => ['sometimes', 'required', 'exists:plans,id'],
        'renew_months'  => ['sometimes', 'integer', 'between:1,12'],
    ]);

    // Renewing extends from today, or from the current end date if it is still in the future
    if (isset($validated['renew_months'])) {
        $from = $tenant->subscription_ends_at?->isFuture() ? $tenant->subscription_ends_at : now();
        $validated['subscription_ends_at'] = $from->copy()->addMonths($validated['renew_months']);

        if ($tenant->status !== 'suspended' && !isset($validated['status'])) {
            $validated['status'] = 'active';
        }
        unset($validated['renew_months']);
    }

    $tenant->update($validated);

    return back()->with('success', "{$tenant->name} updated.");
}
    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'operator';
        $slug = $base;
        $i = 2;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}