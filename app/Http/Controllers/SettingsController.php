<?php

namespace App\Http\Controllers;

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

            // Company settings: owners only. Everyone else gets null.
            'organization' => $tenant ? [
                'name'     => $tenant->name,
                'reg_no'   => $tenant->reg_no,
                'currency' => $tenant->currency,
                'timezone' => $tenant->timezone,
            ] : null,

            // The Khalti key is never sent back to the browser, only whether one is saved.
            'payments' => $tenant ? [
                'esewa_enabled'          => (bool) ($pay['esewa_enabled'] ?? false),
                'esewa_merchant'         => $pay['esewa_merchant'] ?? '',
                'khalti_enabled'         => (bool) ($pay['khalti_enabled'] ?? false),
                'khalti_key_set'         => !empty($pay['khalti_key']),
                'mobile_banking_enabled' => (bool) ($pay['mobile_banking_enabled'] ?? false),
                'mobile_banking_banks'   => $pay['mobile_banking_banks'] ?? [],
            ] : null,
            'banks' => self::BANKS,
        ]);
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

        $request->user()->update(['password' => $validated['password']]); // hashed by the model cast

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
            'khalti_enabled'         => $validated['khalti_enabled'],
            // A blank field keeps the saved key instead of erasing it.
            'khalti_key'             => filled($validated['khalti_key'] ?? null)
                ? $validated['khalti_key']
                : ($existing['khalti_key'] ?? null),
            'mobile_banking_enabled' => $validated['mobile_banking_enabled'],
            'mobile_banking_banks'   => $validated['mobile_banking_banks'] ?? [],
        ];
        $tenant->save();

        return back()->with('success', 'Payment settings saved.');
    }

    private function ownerTenant(Request $request)
    {
        $user = $request->user();

        abort_unless($user->role === 'owner' && $user->tenant, 403);

        return $user->tenant;
    }
}