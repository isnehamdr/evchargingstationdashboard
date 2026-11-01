<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Station;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingApiController extends Controller
{
    public function index(Request $request)
    {
        $bookings = Booking::withoutGlobalScopes()
            ->where('driver_id', $request->user()->id)
            ->with('station:id,station_name,address_line1,city,latitude,longitude')
            ->latest()
            ->paginate(20);

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'station_id'     => ['required', 'integer'],
            'booking_date'   => ['required', 'date', 'after_or_equal:today'],
            'start_time'     => ['required', 'date_format:H:i'],
            'end_time'       => ['required', 'date_format:H:i', 'after:start_time'],
            'payment_method' => ['required', 'in:eSewa,Khalti,Cash'],
        ]);

        $station = Station::withoutGlobalScopes()
            ->where('status', 'active')
            ->whereHas('tenant', fn ($q) => $q->where('status', '!=', 'suspended'))
            ->with('connectors')
            ->find($data['station_id']);

        if (!$station) {
            return response()->json(['message' => 'Station not available.'], 404);
        }

        $start = Carbon::parse("{$data['booking_date']} {$data['start_time']}");
        $end   = Carbon::parse("{$data['booking_date']} {$data['end_time']}");

        if ($start->isPast()) {
            return response()->json(['message' => 'The start time has already passed.'], 422);
        }

        $booking = DB::transaction(function () use ($request, $station, $data, $start, $end) {
            // Lock this station's rows so two drivers can't take the last slot together
            $capacity = $station->connectors->whereNotIn('status', ['offline', 'fault'])->count();

            $overlapping = Booking::withoutGlobalScopes()
                ->where('station_id', $station->id)
                ->whereDate('booking_date', $data['booking_date'])
                ->whereIn('status', ['Upcoming', 'Confirmed'])
                ->where('start_time', '<', $data['end_time'])
                ->where('end_time', '>', $data['start_time'])
                ->lockForUpdate()
                ->count();

            if ($capacity === 0 || $overlapping >= $capacity) {
                return null;
            }

            $hours = max($start->diffInMinutes($end) / 60, 0.5);

            $booking = new Booking([
                'booking_id'     => 'BK-' . strtoupper(Str::random(8)),
                'station_id'     => $station->id,
                'booking_date'   => $data['booking_date'],
                'start_time'     => $data['start_time'],
                'end_time'       => $data['end_time'],
                'amount'         => round($hours * $station->price_per_hour, 2),
                'payment_method' => $data['payment_method'],
                'payment_status' => 'Pending',
                'status'         => 'Upcoming',
            ]);
            // Set by the server, never by the app
            $booking->driver_id = $request->user()->id;
            $booking->tenant_id = $station->tenant_id;
            $booking->save();

            return $booking;
        });

        if (!$booking) {
            return response()->json(['message' => 'No charger is free for that time. Pick another slot.'], 422);
        }

        return response()->json(['data' => $booking], 201);
    }

    public function cancel(Request $request, int $id)
    {
        $booking = Booking::withoutGlobalScopes()
            ->where('driver_id', $request->user()->id)   // only your own bookings
            ->findOrFail($id);

        if (!in_array($booking->status, ['Upcoming', 'Confirmed'], true)) {
            return response()->json(['message' => 'This booking can no longer be cancelled.'], 422);
        }

        $start = Carbon::parse($booking->booking_date->toDateString() . ' ' . $booking->getRawOriginal('start_time'));

        if ($start->isPast()) {
            return response()->json(['message' => 'The slot has already started.'], 422);
        }

        $fee = 0;
        $refund = 0;
        $paymentStatus = $booking->payment_status;

        if ($booking->payment_status === 'Paid') {
            $late = now()->diffInMinutes($start, false) < config('chargesathi.free_cancel_minutes');
            $fee = $late ? round($booking->amount * config('chargesathi.late_fee_percent') / 100, 2) : 0;
            $refund = $booking->amount - $fee;
            $paymentStatus = 'Refunded';
        } elseif ($booking->payment_status === 'Pending') {
            $paymentStatus = 'Pending';   // nothing was paid, nothing to refund
        }

        $booking->forceFill([
            'status'           => 'Cancelled',
            'payment_status'   => $paymentStatus,
            'cancellation_fee' => $fee,
            'refund_amount'    => $refund,
            'cancelled_at'     => now(),
        ])->save();

        return response()->json([
            'data'    => $booking,
            'message' => $fee > 0
                ? "Cancelled. Rs {$fee} late fee kept, Rs {$refund} will be refunded."
                : 'Cancelled.',
        ]);
    }
}