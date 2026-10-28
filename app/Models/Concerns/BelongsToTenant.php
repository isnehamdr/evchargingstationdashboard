<?php

namespace App\Models\Concerns;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            $user = Auth::user();

            // No logged-in user (seeders, artisan, tinker): not filtered.
            if (!$user) {
                return;
            }

            // Platform owner sees every operator.
            if ($user->role === 'super_admin') {
                return;
            }

            $column = $builder->getModel()->getTable() . '.tenant_id';

            if ($user->tenant_id) {
                $builder->where($column, $user->tenant_id);
            } else {
                // Logged in but no tenant (e.g. a driver): see nothing.
                $builder->whereRaw('1 = 0');
            }
        });

        // Auto-fill tenant_id for operator staff. For bookings made by drivers,
        // the controller or API sets tenant_id from the station instead.
        static::creating(function ($model) {
            $user = Auth::user();

            if (empty($model->tenant_id) && $user && $user->tenant_id) {
                $model->tenant_id = $user->tenant_id;
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}