<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SignupController extends Controller
{
    private const TRIAL_DAYS = 14;

    public function show()
    {
        return Inertia::render('Auth/Signup');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'owner_name'   => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'        => ['required', 'string', 'max:20'],
            'password'     => ['required', 'confirmed', Password::defaults()],
            'accepted'     => ['accepted'],
            'website'      => ['prohibited'],   // hidden field: only bots fill it in
        ]);

        // New operators start on the cheapest active plan
        $plan = Plan::where('is_active', true)->orderBy('price_monthly')->first();
        abort_unless($plan, 503, 'Sign-up is not available right now.');

        $owner = DB::transaction(function () use ($data, $plan) {
            $tenant = Tenant::create([
                'name'                 => $data['company_name'],
                'slug'                 => $this->uniqueSlug($data['company_name']),
                'contact_email'        => $data['email'],
                'contact_phone'        => $data['phone'],
                'status'               => 'trial',
                'plan_id'              => $plan->id,
                'subscription_ends_at' => now()->addDays(self::TRIAL_DAYS),
            ]);

            $owner = new User([
                'name'     => $data['owner_name'],
                'email'    => $data['email'],
                'phone'    => $data['phone'],
                'password' => $data['password'],
            ]);
            // Set directly, never taken from the form
            $owner->role = 'owner';
            $owner->tenant_id = $tenant->id;
            $owner->save();

            return $owner;
        });

        AdminNotification::notifyPlatform(
            'system',
            'Info',
            'New operator signed up',
            "{$data['company_name']} ({$data['email']}) started a " . self::TRIAL_DAYS . '-day trial.',
            '/admin-tenants',
            ['tenant_id' => $owner->tenant_id]
        );

        Auth::login($owner);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
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