<?php

namespace App\Http\Middleware;

use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => $user->role,
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],

            // Lazy: only evaluated when a page reads it.
            'notifications' => fn () => $this->navNotifications($user),
        ];
    }

    private function navNotifications($user): ?array
    {
        if (!$user || !in_array($user->role, ['super_admin', 'owner', 'manager', 'staff'], true)) {
            return null;
        }

        return [
            'unread' => AdminNotification::unread()->count(),
            'items'  => AdminNotification::latest()
                ->take(5)
                ->get(['id', 'title', 'message', 'link', 'severity', 'read_at', 'created_at'])
                ->map(fn ($n) => [
                    'id'       => $n->id,
                    'title'    => $n->title,
                    'body'     => $n->message,
                    'link'     => $n->link,
                    'severity' => $n->severity,
                    'time'     => $n->created_at->diffForHumans(),
                    'unread'   => $n->read_at === null,
                ])
                ->values(),
        ];
    }
}