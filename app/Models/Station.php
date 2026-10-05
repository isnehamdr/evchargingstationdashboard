<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Station extends Model
{
    use HasFactory;

   protected $fillable = [
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
    // 'connectors', ← remove
];

public function connectors()
{
    return $this->hasMany(Connector::class);
}

protected $casts = [
    'operating_hours' => 'array',
    'amenities' => 'array',
    'images' => 'array',
    // 'connectors' => 'array', ← remove
    'latitude' => 'decimal:8',
    'longitude' => 'decimal:8',
];
}