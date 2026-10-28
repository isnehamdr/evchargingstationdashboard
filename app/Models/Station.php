<?php

namespace App\Models;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Station extends Model
{
    use HasFactory,BelongsToTenant;

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
    ];

    public function connectors(): HasMany
    {
        return $this->hasMany(Connector::class);
    }
}