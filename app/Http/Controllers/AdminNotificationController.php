<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminNotificationController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');       // all | unread
        $severity = $request->query('severity', 'All');   // All | Critical | Warning | Info

        $notifications = AdminNotification::query()
            ->when($status === 'unread', fn ($q) => $q->unread())
            ->when($severity !== 'All', fn ($q) => $q->severity($severity))
            ->orderByRaw("CASE WHEN read_at IS NULL THEN 0 ELSE 1 END")
            ->orderByRaw("CASE severity WHEN 'Critical' THEN 0 WHEN 'Warning' THEN 1 ELSE 2 END")
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('AdminPages/Notifications', [
            'notifications' => $notifications,
            'filters' => ['status' => $status, 'severity' => $severity],
            'stats' => [
                'total'    => AdminNotification::count(),
                'unread'   => AdminNotification::unread()->count(),
                'critical' => AdminNotification::unread()->severity('Critical')->count(),
            ],
        ]);
    }

    public function markRead(AdminNotification $notification)
    {
        $notification->markAsRead();

        return back();
    }

    public function markAllRead()
    {
        AdminNotification::unread()->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read.');
    }

    public function destroy(AdminNotification $notification)
    {
        $notification->delete();

        return back()->with('success', 'Notification removed.');
    }

    public function clearRead()
    {
        AdminNotification::read()->delete();

        return back()->with('success', 'Read notifications cleared.');
    }
}