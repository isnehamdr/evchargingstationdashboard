<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Connector extends Model
{
    protected $fillable = ['station_id', 'label', 'type', 'power_kw', 'status'];
}