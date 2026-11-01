<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use BelongsToTenant;

    protected $fillable = ['gateway', 'amount', 'status', 'reference', 'gateway_ref', 'gateway_data', 'refunded_amount', 'paid_at'];

    protected $casts = [
        'gateway_data' => 'array',
        'paid_at'      => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class)->withoutGlobalScopes();
    }
}