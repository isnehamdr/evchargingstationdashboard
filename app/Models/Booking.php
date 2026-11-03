<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class Booking extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'booking_id',
        'driver_id',
        'station_id',
        'booking_date',
        'start_time',
        'end_time',
        'amount',
        'cancellation_fee',
        'refund_amount',
        'payment_method',
        'payment_status',
        'status',
        'notes',
        'cancelled_at',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'amount' => 'decimal:2',
        'cancellation_fee' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'cancelled_at' => 'datetime',
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
    | Revenue helpers: only money the operator actually kept
    |--------------------------------------------------------------------------
    */

    public static function keptSql(): string
    {
        return "COALESCE(SUM(CASE
                    WHEN payment_status = 'Paid' THEN amount
                    WHEN payment_status = 'Refunded' THEN cancellation_fee
                    ELSE 0 END), 0)";
    }

    public static function totalRevenue(): float
    {
        return (float) static::query()->selectRaw(static::keptSql() . ' as kept')->value('kept');
    }

    public static function revenueForMonth(Carbon $date): float
    {
        return (float) static::inMonth($date)->selectRaw(static::keptSql() . ' as kept')->value('kept');
    }

    public static function monthlyRevenue(int $months = 6): Collection
    {
        return collect(range($months - 1, 0))->map(function ($i) {
            $month = now()->startOfMonth()->subMonths($i);

            return [
                'label' => $month->format('M'),
                'total' => static::revenueForMonth($month),
            ];
        })->values();
    }

    public static function paymentStats(): array
    {
        return [
            'total'    => static::totalRevenue(),
            'month'    => static::revenueForMonth(now()),
            // Waiting for payment, ignoring bookings that were cancelled
            'pending'  => (float) static::pending()->where('status', '!=', 'Cancelled')->sum('amount'),
            'failed'   => static::failed()->count(),
            // Money returned to drivers, and cancellation fees the operator kept
            'refunded' => (float) static::where('payment_status', 'Refunded')->sum('refund_amount'),
            'fees'     => (float) static::where('payment_status', 'Refunded')->sum('cancellation_fee'),
        ];
    }

    protected static function booted()
    {
        static::created(function ($booking) {
            AdminNotification::notify(
                'booking',
                'Info',
                'New booking',
                "{$booking->booking_id} for Rs. " . number_format($booking->amount),
                route('ourrevenue.index', [], false),
                ['booking_id' => $booking->booking_id],
                $booking->tenant_id
            );
        });

        static::updated(function ($booking) {
            if ($booking->wasChanged('payment_status') && $booking->payment_status === 'Failed') {
                AdminNotification::notify(
                    'payment',
                    'Warning',
                    'Payment failed',
                    "{$booking->booking_id} payment failed",
                    route('ourrevenue.index', [], false),
                    ['booking_id' => $booking->booking_id],
                    $booking->tenant_id
                );
            }
        });
    }
}