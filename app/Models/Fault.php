<?php

namespace App\Models;
use App\Models\AdminNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Fault extends Model
{
    use HasFactory;

    protected $fillable = [
        'fault_id',
        'station_id',
        'connector_id',
        'issue',
        'severity',
        'status',
        'acknowledged_at',
        'resolved_at',
        'notes',
    ];

    protected $casts = [
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected static function booted()
{
    static::creating(function ($fault) {
        $fault->fault_id ??= 'FLT-' . strtoupper(Str::random(6));
    });

    static::created(function ($fault) {
        if ($fault->severity === 'Info') {
            return;
        }

        AdminNotification::push(
            'fault',
            $fault->severity,                                  // Critical | Warning
            "{$fault->severity} fault: {$fault->issue}",
            "{$fault->fault_id} reported" . ($fault->station ? " at {$fault->station->name}" : ''),
            route('ourfaults.index', [], false),
            ['fault_id' => $fault->fault_id]
        );
    });
}

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function connector(): BelongsTo
    {
        return $this->belongsTo(Connector::class);
    }


    
}