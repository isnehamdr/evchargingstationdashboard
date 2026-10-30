<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Station;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
{
    $bookings = Booking::with(['driver:id,name,phone', 'station:id,station_name,images'])
        ->latest()
        ->paginate(10);

    return Inertia::render('AdminPages/Booking', [
        'bookings' => $bookings,
    ]);
}

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'payment_method' => ['sometimes', 'string', 'max:50'],
            'payment_status' => ['sometimes', 'in:Pending,Paid,Failed,Refunded'],
            'status'         => ['sometimes', 'in:Upcoming,Confirmed,Completed,Cancelled'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ]);

        $booking->update($validated);

        return redirect()
            ->route('ourbooking.index')
            ->with('success', 'Booking updated successfully.');
    }
}