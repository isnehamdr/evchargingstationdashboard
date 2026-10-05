<?php

namespace App\Http\Controllers;

use App\Models\Fault;
use App\Models\GridFeeder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GridFaultController extends Controller
{
    /**
     * Grid & Faults admin page — feeder status + fault list.
     */
    public function index()
    {
        return Inertia::render('AdminPages/GridFaults', [
            'feeders' => GridFeeder::orderBy('name')->get(),
            'faults' => Fault::with(['station', 'connector'])
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Log a new fault (e.g. a connector reported stuck/unresponsive).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'station_id' => ['required', 'exists:stations,id'],
            'connector_id' => ['nullable', 'exists:connectors,id'],
            'issue' => ['required', 'string', 'max:255'],
            'severity' => ['required', Rule::in(['Critical', 'Warning', 'Info'])],
        ]);

        Fault::create($validated);

        return redirect()
            ->route('ourfaults.index')
            ->with('success', 'Fault logged.');
    }

    /**
     * Advance a fault's status: Open -> Acknowledged -> Resolved.
     * Stamps acknowledged_at / resolved_at the first time each is reached.
     */
    public function updateStatus(Request $request, Fault $fault)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Open', 'Acknowledged', 'Resolved'])],
        ]);

        $fault->status = $validated['status'];

        if ($validated['status'] === 'Acknowledged' && !$fault->acknowledged_at) {
            $fault->acknowledged_at = now();
        }

        if ($validated['status'] === 'Resolved' && !$fault->resolved_at) {
            $fault->resolved_at = now();
        }

        $fault->save();

        return redirect()
            ->route('ourfaults.index')
            ->with('success', "Fault {$fault->fault_id} marked as {$fault->status}.");
    }

    public function destroy(Fault $fault)
    {
        $fault->delete();

        return redirect()
            ->route('ourfaults.index')
            ->with('success', 'Fault removed.');
    }
}