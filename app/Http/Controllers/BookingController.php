<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Station;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings.
     */
  public function index()
{
    $bookings = Booking::with(['driver', 'station'])
        ->latest()
        ->paginate(10);

    return Inertia::render('AdminPages/Booking', [
        'bookings' => $bookings,
        'drivers' => User::select('id', 'name')->orderBy('name')->get(),
        'stations' => Station::select('id', 'station_name')->orderBy('station_name')->get(),
    ]);
}


    

    /**
     * Store a newly created booking.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => ['required', 'exists:users,id'],
            'station_id' => ['required', 'exists:stations,id'],
            'booking_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'max:50'],
            'payment_status' => ['required', 'in:Pending,Paid,Failed,Refunded'],
            'status' => ['required', 'in:Upcoming,Confirmed,Completed,Cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['booking_id'] = 'BK-' . strtoupper(Str::random(8));

        Booking::create($validated);

        return redirect()
            ->route('ourbooking.index')
            ->with('success', 'Booking created successfully.');
    }

    /**
     * Update the specified booking.
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'driver_id' => ['required', 'exists:users,id'],
            'station_id' => ['required', 'exists:stations,id'],
            'booking_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'max:50'],
            'payment_status' => ['required', 'in:Pending,Paid,Failed,Refunded'],
            'status' => ['required', 'in:Upcoming,Confirmed,Completed,Cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking->update($validated);

        return redirect()
            ->route('ourbooking.index')
            ->with('success', 'Booking updated successfully.');
    }

    /**
     * Remove the specified booking.
     */
    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()
            ->route('ourbooking.index')
            ->with('success', 'Booking deleted successfully.');
    }
}