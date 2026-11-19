<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\Request;

class StationApiController extends Controller
{
    // tenant_id is only needed to work out payment methods, and is removed before sending
    private const FIELDS = [
        'id', 'tenant_id', 'station_code', 'station_name', 'address_line1', 'city', 'state_province',
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
            ->with(['connectors:id,station_id,label,type,power_kw,status', 'tenant:id,payment_settings'])
            ->get(self::FIELDS)
            ->map(fn ($s) => $this->present($s));

        return response()->json(['data' => $stations]);
    }

    public function show(int $id)
    {
        $station = Station::withoutGlobalScopes()
            ->where('status', 'active')
            ->whereHas('tenant', fn ($q) => $q->where('status', '!=', 'suspended'))
            ->with(['connectors:id,station_id,label,type,power_kw,status', 'tenant:id,payment_settings'])
            ->findOrFail($id, self::FIELDS);

        return response()->json(['data' => $this->present($station)]);
    }

    /** Public fields plus which online payment methods this operator has set up. */
    private function present(Station $s): array
    {
        $pay = $s->tenant?->payment_settings ?? [];
        $sandbox = (bool) config('chargesathi.sandbox');

        $methods = [];

        if (($pay['khalti_enabled'] ?? false) && !empty($pay['khalti_key'])) {
            $methods[] = 'khalti';
        }

        // In sandbox mode eSewa uses its public test keys, so enabled is enough
        if (($pay['esewa_enabled'] ?? false) && ($sandbox || (!empty($pay['esewa_merchant']) && !empty($pay['esewa_secret'])))) {
            $methods[] = 'esewa';
        }

        $data = $s->makeHidden(['tenant', 'tenant_id'])->toArray();
        $data['payment_methods'] = $methods;

        return $data;
    }
}