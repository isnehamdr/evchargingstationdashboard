<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'severity',
        'title',
        'message',
        'link',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    // ---------- Scopes ----------
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead(Builder $query): Builder
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeSeverity(Builder $query, string $severity): Builder
    {
        return $query->where('severity', $severity);
    }

    // ---------- Helpers ----------
    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Create a notification from anywhere in the app:
     * AdminNotification::notify('fault', 'Critical', 'Connector unresponsive', 'Airport Road A', '/admin-gridfaults');
     */
    public static function notify(
        string $type,
        string $severity,
        string $title,
        ?string $message = null,
        ?string $link = null,
        array $data = []
    ): self {
        return static::create(compact('type', 'severity', 'title', 'message', 'link', 'data'));
    }
}