<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\Request;

class StationApiController extends Controller
{
    private const FIELDS = [
        'id', 'station_code', 'station_name', 'address_line1', 'city', 'state_province',
        'latitude', 'longitude', 'location_notes', 'access_type', 'operating_hours',
        'amenities', 'images', 'contact_phone', 'price_per_hour',
    ];

    public function index(Request $request)
    {
        $stations = Station::withoutGlobalScopes()
            ->where('status', 'active')
            ->where('access_type', 'public')
            ->whereHas('tenant', fn ($q) => $q->where('status', '!=', 'suspended'))
            ->when($request->query('city'), fn ($q, $city) => $q->where('city', $city))
            ->with('connectors:id,station_id,label,type,power_kw,status')
            ->get(self::FIELDS);

        return response()->json(['data' => $stations]);
    }

    public function show(int $id)
    {
        $station = Station::withoutGlobalScopes()
            ->where('status', 'active')
            ->whereHas('tenant', fn ($q) => $q->where('status', '!=', 'suspended'))
            ->with('connectors:id,station_id,label,type,power_kw,status')
            ->findOrFail($id, self::FIELDS);

        return response()->json(['data' => $station]);
    }
}