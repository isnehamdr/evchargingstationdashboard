<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index()
    {
        $drivers = User::drivers()
            ->withCount('bookings')
            ->withSum(['bookings as total_spent' => fn ($q) => $q->where('payment_status', 'Paid')], 'amount')
            ->latest()
            ->get();

        return Inertia::render('AdminPages/Drivers', [
            'drivers' => $drivers,
            'stats' => [
                'total'     => $drivers->count(),
                'active'    => $drivers->where('driver_status', 'Active')->count(),
                'suspended' => $drivers->where('driver_status', 'Suspended')->count(),
                'bookings'  => $drivers->sum('bookings_count'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'       => ['required', 'string', 'min:8'],
            'phone'          => ['nullable', 'string', 'max:20'],
            'vehicle_model'  => ['nullable', 'string', 'max:255'],
            'vehicle_number' => ['nullable', 'string', 'max:50', 'unique:users,vehicle_number'],
            'connector_type' => ['nullable', Rule::in(['CCS2', 'Type 2', 'CHAdeMO', 'GB/T'])],
        ]);

        User::create($validated + ['role' => 'driver', 'driver_status' => 'Active']);

        return redirect()->route('ourdrivers.index')->with('success', 'Driver added.');
    }

    public function updateStatus(Request $request, User $driver)
    {
        abort_unless($driver->role === 'driver', 404);

        $validated = $request->validate([
            'driver_status' => ['required', Rule::in(['Active', 'Suspended'])],
        ]);

        $driver->update($validated);

        return redirect()->route('ourdrivers.index')
            ->with('success', "{$driver->name} is now {$driver->driver_status}.");
    }

    public function destroy(User $driver)
    {
        abort_unless($driver->role === 'driver', 404);

        $driver->delete();

        return redirect()->route('ourdrivers.index')->with('success', 'Driver removed.');
    }
}