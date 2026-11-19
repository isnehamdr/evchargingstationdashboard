<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Station extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'station_code',
        'station_name',
        'site_name',
        'operator_name',
        'address_line1',
        'address_line2',
        'city',
        'state_province',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'location_notes',
        'access_type',
        'price_per_hour',
        'operating_hours',
        'amenities',
        'contact_phone',
        'contact_email',
        'status',
        'images',
    ];

    protected $casts = [
        'operating_hours' => 'array',
        'amenities'       => 'array',
        'images'          => 'array',
        'latitude'        => 'decimal:8',
        'longitude'       => 'decimal:8',
        'price_per_hour'  => 'decimal:2',
    ];

    public function connectors(): HasMany
    {
        return $this->hasMany(Connector::class);
    }

    /** Is the station open for the whole booking? Times are compared as H:i strings. */
    public function isOpenFor(Carbon $start, Carbon $end): bool
    {
        $h = $this->operating_hours;

        // No hours saved, or open 24/7
        if (empty($h) || !empty($h['is_24_7'])) {
            return true;
        }

        $day = $h['days'][strtolower($start->format('D'))] ?? null;

        // A day with no hours set is not restricted
        if (!$day) {
            return true;
        }

        if (!empty($day['closed'])) {
            return false;
        }

        if (empty($day['open']) || empty($day['close'])) {
            return true;
        }

        $open = $day['open'];
        $close = $day['close'];
        $s = $start->format('H:i');
        $e = $end->format('H:i');

        if ($close > $open) {
            return $s >= $open && $e <= $close;
        }

        // Overnight hours, e.g. 22:00 to 02:00
        return $s >= $open || $e <= $close;
    }
}