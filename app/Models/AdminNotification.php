<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
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
     * Create a notification from anywhere in the app.
     * Pass $tenantId when there may be no logged-in operator
     * (for example, the super admin or a background job).
     */
    public static function notify(
        string $type,
        string $severity,
        string $title,
        ?string $message = null,
        ?string $link = null,
        array $data = [],
        ?int $tenantId = null
    ): self {
        return static::create(
            compact('type', 'severity', 'title', 'message', 'link', 'data')
            + ['tenant_id' => $tenantId]
        );
    }
}