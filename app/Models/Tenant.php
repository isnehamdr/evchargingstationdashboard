<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'name', 'slug', 'logo', 'contact_email', 'contact_phone', 'status',
        'reg_no', 'currency', 'timezone', 'payment_settings',
    ];

    protected $casts = [
        'payment_settings' => 'encrypted:array', // gateway keys are encrypted in the database
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}