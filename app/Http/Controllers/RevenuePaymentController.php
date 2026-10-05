<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Inertia\Inertia;

class RevenuePaymentController extends Controller
{
    public function index()
    {
        $paid = Booking::where('payment_status', 'Paid');

        // Last 6 months of revenue
        $monthly = collect(range(5, 0))->map(function ($i) {
            $month = now()->subMonths($i);
            return [
                'label' => $month->format('M'),
                'total' => (float) Booking::where('payment_status', 'Paid')
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->sum('amount'),
            ];
        })->values();

        return Inertia::render('AdminPages/RevenueAndPayment', [
        'stats'    => Booking::paymentStats(),
        'monthly'  => Booking::monthlyRevenue(6),
        'payments' => Booking::with(['driver:id,name', 'station:id,name'])
            ->latest('booking_date')
            ->take(50)
            ->get(),
    ]);
    }
}