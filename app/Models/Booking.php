<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;
use App\Models\AdminNotification;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'driver_id',
        'station_id',
        'booking_date',
        'start_time',
        'end_time',
        'amount',
        'payment_method',
        'payment_status',
        'status',
        'notes',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'amount' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class, 'station_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Payment scopes
    |--------------------------------------------------------------------------
    */

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'Paid');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('payment_status', 'Pending');
    }

    public function scopeFailed(Builder $query): Builder
    {
        return $query->where('payment_status', 'Failed');
    }

    public function scopeInMonth(Builder $query, Carbon $date): Builder
    {
        return $query->whereYear('booking_date', $date->year)
                     ->whereMonth('booking_date', $date->month);
    }

    /*
    |--------------------------------------------------------------------------
    | Revenue helpers
    |--------------------------------------------------------------------------
    */

    public static function totalRevenue(): float
    {
        return (float) static::paid()->sum('amount');
    }

    public static function revenueForMonth(Carbon $date): float
    {
        return (float) static::paid()->inMonth($date)->sum('amount');
    }

    public static function monthlyRevenue(int $months = 6): Collection
    {
        return collect(range($months - 1, 0))->map(function ($i) {
            $month = now()->subMonths($i);

            return [
                'label' => $month->format('M'),
                'total' => static::revenueForMonth($month),
            ];
        })->values();
    }

    public static function paymentStats(): array
    {
        return [
            'total'   => static::totalRevenue(),
            'month'   => static::revenueForMonth(now()),
            'pending' => (float) static::pending()->sum('amount'),
            'failed'  => static::failed()->count(),
        ];
    }
    protected static function booted()
{
    static::created(function ($booking) {
        AdminNotification::push(
            'booking',
            'Info',
            'New booking',
            "{$booking->booking_id} for Rs. " . number_format($booking->amount),
            route('ourrevenue.index', [], false),
            ['booking_id' => $booking->booking_id]
        );
    });

    static::updated(function ($booking) {
        if ($booking->wasChanged('payment_status') && $booking->payment_status === 'Failed') {
            AdminNotification::push(
                'payment',
                'Warning',
                'Payment failed',
                "{$booking->booking_id} payment failed",
                route('ourrevenue.index', [], false),
                ['booking_id' => $booking->booking_id]
            );
        }
    });
}
}