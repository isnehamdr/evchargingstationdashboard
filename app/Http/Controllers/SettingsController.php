<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingsController extends Controller
{
    private const DEFAULT_PREFS = [
        'critical' => true,
        'warning'  => true,
        'info'     => false,
        'faults'   => true,
        'bookings' => true,
        'payouts'  => true,
    ];

    private const BANKS = [
        'NIC Asia Bank', 'Nabil Bank', 'Global IME Bank', 'Prabhu Bank',
        'NMB Bank', 'Himalayan Bank', 'Standard Chartered Nepal', 'Everest Bank',
    ];

    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->role === 'owner' ? $user->tenant : null;
        $pay = $tenant?->payment_settings ?? [];

        return Inertia::render('AdminPages/Setting', [
            'profile' => [
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role'  => $user->role,
            ],
            'prefs' => array_merge(self::DEFAULT_PREFS, $user->notification_prefs ?? []),

            'organization' => $tenant ? [
                'name'     => $tenant->name,
                'reg_no'   => $tenant->reg_no,
                'currency' => $tenant->currency,
                'timezone' => $tenant->timezone,
            ] : null,

            // Secrets are never sent back, only whether one is saved.
            'payments' => $tenant ? [
                'esewa_enabled'          => (bool) ($pay['esewa_enabled'] ?? false),
                'esewa_merchant'         => $pay['esewa_merchant'] ?? '',
                'esewa_secret_set'       => !empty($pay['esewa_secret']),
                'khalti_enabled'         => (bool) ($pay['khalti_enabled'] ?? false),
                'khalti_key_set'         => !empty($pay['khalti_key']),
                'mobile_banking_enabled' => (bool) ($pay['mobile_banking_enabled'] ?? false),
                'mobile_banking_banks'   => $pay['mobile_banking_banks'] ?? [],
            ] : null,
            'banks' => self::BANKS,

            'plan' => $tenant ? $this->planInfo($tenant) : null,
        ]);
    }

    private function planInfo(Tenant $tenant): array
    {
        $plan = $tenant->plan;
        $usage = $tenant->usage();

        return [
            'name'      => $plan?->name,
            'price'     => $plan?->price_monthly,
            'status'    => $tenant->status,
            'ends_at'   => $tenant->subscription_ends_at,
            'active'    => $tenant->subscriptionActive(),
            'limits'    => [
                'stations'   => ['used' => $usage['stations'],   'max' => $plan?->max_stations ?? 0],
                'connectors' => ['used' => $usage['connectors'], 'max' => $plan?->max_connectors ?? 0],
                'users'      => ['used' => $usage['users'],      'max' => $plan?->max_users ?? 0],
            ],
            'current_id' => $plan?->id,
            'plans'      => Plan::where('is_active', true)->orderBy('price_monthly')
                ->get(['id', 'name', 'price_monthly', 'max_stations', 'max_connectors', 'max_users']),
        ];
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update($validated);

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update(['password' => $validated['password']]);

        return back()->with('success', 'Password changed.');
    }

    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'critical' => ['required', 'boolean'],
            'warning'  => ['required', 'boolean'],
            'info'     => ['required', 'boolean'],
            'faults'   => ['required', 'boolean'],
            'bookings' => ['required', 'boolean'],
            'payouts'  => ['required', 'boolean'],
        ]);

        $request->user()->update(['notification_prefs' => $validated]);

        return back()->with('success', 'Notification preferences saved.');
    }

    // ---------- Owner only (route group + check here) ----------

    public function updateOrganization(Request $request)
    {
        $tenant = $this->ownerTenant($request);

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'reg_no'   => ['nullable', 'string', 'max:100'],
            'currency' => ['required', Rule::in(['NPR', 'USD'])],
            'timezone' => ['required', Rule::in(['Asia/Kathmandu'])],
        ]);

        $tenant->update($validated);

        return back()->with('success', 'Organization updated.');
    }

    public function updatePayments(Request $request)
    {
        $tenant = $this->ownerTenant($request);

        $validated = $request->validate([
            'esewa_enabled'          => ['required', 'boolean'],
            'esewa_merchant'         => ['nullable', 'string', 'max:100'],
            'esewa_secret'           => ['nullable', 'string', 'max:255'],
            'khalti_enabled'         => ['required', 'boolean'],
            'khalti_key'             => ['nullable', 'string', 'max:255'],
            'mobile_banking_enabled' => ['required', 'boolean'],
            'mobile_banking_banks'   => ['nullable', 'array'],
            'mobile_banking_banks.*' => ['string', Rule::in(self::BANKS)],
        ]);

        $existing = $tenant->payment_settings ?? [];

        $tenant->payment_settings = [
            'esewa_enabled'          => $validated['esewa_enabled'],
            'esewa_merchant'         => $validated['esewa_merchant'] ?? null,
            // A blank field keeps the saved secret instead of erasing it.
            'esewa_secret'           => filled($validated['esewa_secret'] ?? null)
                ? $validated['esewa_secret']
                : ($existing['esewa_secret'] ?? null),
            'khalti_enabled'         => $validated['khalti_enabled'],
            'khalti_key'             => filled($validated['khalti_key'] ?? null)
                ? $validated['khalti_key']
                : ($existing['khalti_key'] ?? null),
            'mobile_banking_enabled' => $validated['mobile_banking_enabled'],
            'mobile_banking_banks'   => $validated['mobile_banking_banks'] ?? [],
        ];
        $tenant->save();

        return back()->with('success', 'Payment settings saved.');
    }

    /** Owner asks for a different plan. Billing is handled by you, so this only alerts you. */
    public function requestUpgrade(Request $request)
    {
        $tenant = $this->ownerTenant($request);

        $validated = $request->validate([
            'plan_id' => ['required', Rule::exists('plans', 'id')->where('is_active', true)],
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        AdminNotification::notifyPlatform(
            'system',
            'Info',
            'Plan change requested',
            "{$tenant->name} asks to move to {$plan->name} (Rs " . number_format($plan->price_monthly) . '/month).',
            '/admin-tenants',
            ['tenant_id' => $tenant->id, 'plan_id' => $plan->id]
        );

        return back()->with('success', "Request sent. We'll contact you about the {$plan->name} plan.");
    }

    private function ownerTenant(Request $request): Tenant
    {
        $user = $request->user();

        abort_unless($user->role === 'owner' && $user->tenant, 403);

        return $user->tenant;
    }
}