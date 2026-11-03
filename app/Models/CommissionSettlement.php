<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommissionSettlement extends Model
{
    // Only ever written by the super admin controller, with server-calculated values
    protected $guarded = [];

    protected $casts = ['paid_at' => 'datetime'];
}