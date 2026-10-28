<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Connector extends Model
{
    protected $fillable = [
        'station_id',
        'label',
        'type',
        'power_kw',
        'status',
    ];

    protected $casts = [
        'power_kw' => 'decimal:2',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}