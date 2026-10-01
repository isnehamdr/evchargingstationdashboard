<?php

namespace App\Http\Controllers;

use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StationController extends Controller
{
    private function rules(?Station $station = null): array
    {
        return [
            'station_code' => [
                'sometimes', 'required', 'string', 'max:50',
                Rule::unique('stations', 'station_code')->ignore($station?->id),
            ],
            'station_name' => 'required|string|max:255',
            'site_name' => 'nullable|string|max:255',
            'operator_name' => 'nullable|string|max:255',

            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'sometimes|required|string|max:100',

            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_notes' => 'nullable|string|max:2000',

            'access_type' => ['nullable', Rule::in(['public', 'private', 'restricted', 'fleet-only'])],
            'status' => ['nullable', Rule::in(['active', 'maintenance', 'closed'])],

            'operating_hours' => 'nullable|array',
            'operating_hours.is_24_7' => 'sometimes|boolean',
            'operating_hours.days' => ['sometimes', 'array:mon,tue,wed,thu,fri,sat,sun'],
            'operating_hours.days.*.closed' => 'sometimes|boolean',
            'operating_hours.days.*.open' => 'nullable|date_format:H:i',
            'operating_hours.days.*.close' => 'nullable|date_format:H:i',

            'amenities' => 'nullable|array|max:20',
            'amenities.*' => 'string|max:50',

            // Paths returned by uploadImage(); the regex also stops path tricks.
            'images' => 'nullable|array|max:6',
            'images.*' => ['string', 'max:255', 'regex:/^stations\/[A-Za-z0-9._-]+$/'],

            'contact_phone' => 'nullable|string|max:30',
            'contact_email' => 'nullable|email|max:255',

            'connectors' => 'required|array|min:1|max:12',
            'connectors.*.label' => 'required|string|max:10|distinct',
            'connectors.*.type' => 'required|string|max:50',
            'connectors.*.power_kw' => 'nullable|numeric|min:0',
            'connectors.*.status' => ['required', Rule::in(['available', 'charging', 'fault', 'offline'])],
        ];
    }

    private function generateCode(): string
    {
        do {
            $code = 'STN-' . strtoupper(Str::random(6));
        } while (Station::where('station_code', $code)->exists());

        return $code;
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Station::latest()->get(),
        ]);
    }

    public function show(Station $station)
    {
        return response()->json([
            'success' => true,
            'data' => $station,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $validated['station_code'] ??= $this->generateCode();

        $station = Station::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Station created successfully.',
            'data' => $station->fresh(),
        ], 201);
    }

    public function update(Request $request, Station $station)
    {
        $validated = $request->validate($this->rules($station));

        $oldImages = $station->images ?? [];

        $station->update($validated);

        // Delete image files that were removed from the station.
        if (array_key_exists('images', $validated)) {
            $removed = array_diff($oldImages, $validated['images'] ?? []);
            if ($removed) {
                Storage::disk('public')->delete(array_values($removed));
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Station updated successfully.',
            'data' => $station->fresh(),
        ]);
    }

    public function destroy(Station $station)
    {
        if (!empty($station->images)) {
            Storage::disk('public')->delete($station->images);
        }

        $station->delete();

        return response()->json([
            'success' => true,
            'message' => 'Station deleted successfully.',
        ]);
    }

    /**
     * Upload one station image. Returns a relative path that the form
     * sends back in the station's "images" array when it is saved.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $path = $request->file('image')->store('stations', 'public');

        return response()->json([
            'success' => true,
            'path' => $path,
        ], 201);
    }
}