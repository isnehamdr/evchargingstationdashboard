<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'name', 'slug', 'logo', 'contact_email', 'contact_phone', 'status',
        'reg_no', 'currency', 'timezone', 'payment_settings',
        'plan_id', 'subscription_ends_at',
    ];

    protected $casts = [
        'payment_settings'     => 'encrypted:array',
        'subscription_ends_at' => 'datetime',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function stations(): HasMany
    {
        return $this->hasMany(Station::class)->withoutGlobalScopes();
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class)->withoutGlobalScopes();
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function subscriptionActive(): bool
    {
        return $this->plan_id !== null
            && ($this->subscription_ends_at === null || $this->subscription_ends_at->isFuture());
    }

    /** What this company is using right now. */
    public function usage(): array
    {
        $stationIds = Station::withoutGlobalScopes()->where('tenant_id', $this->id)->select('id');

        return [
            'stations'   => Station::withoutGlobalScopes()->where('tenant_id', $this->id)->count(),
            'connectors' => Connector::whereIn('station_id', $stationIds)->count(),
            'users'      => $this->users()->whereIn('role', ['owner', 'manager', 'staff'])->count(),
        ];
    }

    /**
     * Returns an error message if adding $adding more of $resource
     * ('stations', 'connectors' or 'users') is not allowed, otherwise null.
     */
    public function limitError(string $resource, int $adding = 1): ?string
    {
        if (!$this->plan || !$this->subscriptionActive()) {
            return 'Your subscription has expired. Please renew to add more.';
        }

        $limit = match ($resource) {
            'stations'   => $this->plan->max_stations,
            'connectors' => $this->plan->max_connectors,
            'users'      => $this->plan->max_users,
        };

        if ($this->usage()[$resource] + $adding > $limit) {
            return "Your {$this->plan->name} plan allows {$limit} {$resource}. Upgrade your plan to add more.";
        }

        return null;
    }
}