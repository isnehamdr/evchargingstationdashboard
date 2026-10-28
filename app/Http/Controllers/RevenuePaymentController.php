<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Inertia\Inertia;

class RevenuePaymentController extends Controller
{
    public function index()
    {
        return Inertia::render('AdminPages/RevenueAndPayment', [
            'stats'    => Booking::paymentStats(),
            'monthly'  => Booking::monthlyRevenue(6),
            'payments' => Booking::with(['driver:id,name', 'station:id,station_name'])
                ->latest('booking_date')
                ->take(50)
                ->get(),
        ]);
    }
}