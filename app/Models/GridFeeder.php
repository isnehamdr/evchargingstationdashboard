<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GridFeeder extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'load_percent',
        'status',
        'capacity_kw',
    ];

    protected $casts = [
        'load_percent' => 'integer',
        'capacity_kw' => 'decimal:2',
    ];
}