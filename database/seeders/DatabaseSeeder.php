<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Plan;
use App\Models\Station;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- Plans ----------
        $basic = Plan::updateOrCreate(['slug' => 'basic'], [
            'name' => 'Basic', 'price_monthly' => 3000,
            'max_stations' => 2, 'max_connectors' => 8, 'max_users' => 3,
        ]);
        $pro = Plan::updateOrCreate(['slug' => 'pro'], [
            'name' => 'Pro', 'price_monthly' => 10000,
            'max_stations' => 20, 'max_connectors' => 100, 'max_users' => 15,
        ]);

        // ---------- Companies ----------
        $a = Tenant::create([
            'name' => 'Lakeside Charging', 'slug' => 'lakeside', 'status' => 'active',
            'contact_email' => 'owner-a@test.com', 'contact_phone' => '9806614220',
            'plan_id' => $basic->id, 'subscription_ends_at' => now()->addMonth(),
        ]);
        $b = Tenant::create([
            'name' => 'Himalaya EV', 'slug' => 'himalaya-ev', 'status' => 'active',
            'contact_email' => 'owner-b@test.com', 'contact_phone' => '9801234567',
            'plan_id' => $pro->id, 'subscription_ends_at' => now()->addMonth(),
        ]);

        // ---------- People (password for everyone: "password") ----------
        User::create(['name' => 'Super Admin', 'email' => 'admin@test.com', 'password' => 'password', 'role' => 'super_admin']);

        $this->makeUser($a, 'Owner A', 'owner-a@test.com', 'owner');
        $this->makeUser($a, 'Ram Manager', 'ram@test.com', 'manager');
        $this->makeUser($b, 'Owner B', 'owner-b@test.com', 'owner');
        $this->makeUser($b, 'Sita Staff', 'sita@test.com', 'staff');

        // Drivers belong to the platform, not to a company
        $d1 = User::create(['name' => 'Test Driver', 'email' => 'driver@test.com', 'password' => 'password', 'role' => 'driver',
            'phone' => '9800000000', 'vehicle_model' => 'Nissan Leaf', 'vehicle_number' => 'BA 1 PA 1234', 'connector_type' => 'CCS2']);
        $d2 = User::create(['name' => 'Anil Gurung', 'email' => 'anil@test.com', 'password' => 'password', 'role' => 'driver',
            'phone' => '9811111111', 'vehicle_model' => 'Tata Nexon EV', 'vehicle_number' => 'GA 2 PA 5678', 'connector_type' => 'CCS2']);
        $d3 = User::create(['name' => 'Maya Thapa', 'email' => 'maya@test.com', 'password' => 'password', 'role' => 'driver',
            'phone' => '9822222222', 'vehicle_model' => 'BYD Atto 3', 'vehicle_number' => 'GA 3 PA 9012', 'connector_type' => 'Type 2']);

        // ---------- Stations + connectors ----------
        $s1 = $this->makeStation($a, 'Lakeside Test Station', 'Lakeside Road, Pokhara', 'Pokhara', 28.190624, 83.937439, [
            ['C1', 'CCS2', 60, 'available'],
            ['C2', 'Type 2', 22, 'available'],
        ]);
        $s2 = $this->makeStation($b, 'Himalaya Fast Charge', 'Prithvi Highway, Pokhara', 'Pokhara', 28.2096, 83.9856, [
            ['A1', 'CCS2', 120, 'available'],
            ['A2', 'CHAdeMO', 50, 'charging'],
            ['A3', 'Type 2', 22, 'offline'],
        ]);
        $s3 = $this->makeStation($b, 'Himalaya Kathmandu Hub', 'Durbar Marg, Kathmandu', 'Kathmandu', 27.7172, 85.3240, [
            ['K1', 'CCS2', 60, 'available'],
        ]);

        // ---------- Bookings (each one also creates a notification automatically) ----------
        $this->makeBooking($a, $s1, $d1, 0,  '10:00', '11:00', 500,  'eSewa',  'Paid',    'Confirmed');
        $this->makeBooking($a, $s1, $d2, -3, '14:00', '15:00', 800,  'Khalti', 'Paid',    'Completed');
        $this->makeBooking($a, $s1, $d3, 2,  '09:00', '10:30', 650,  'eSewa',  'Pending', 'Upcoming');
        $this->makeBooking($a, $s1, $d1, -35, '16:00', '17:00', 700, 'Khalti', 'Paid',    'Completed');

        $this->makeBooking($b, $s2, $d1, -1, '08:00', '09:00', 1200, 'Khalti', 'Paid',    'Completed');
        $this->makeBooking($b, $s2, $d2, 1,  '12:00', '13:00', 900,  'eSewa',  'Pending', 'Upcoming');
        $this->makeBooking($b, $s3, $d3, -40, '18:00', '19:00', 600, 'eSewa',  'Paid',    'Completed');

        // One failed payment, so the revenue page and the "Payment failed" alert have something to show
        $failed = $this->makeBooking($b, $s3, $d1, -2, '11:00', '12:00', 750, 'Khalti', 'Pending', 'Confirmed');
        $failed->update(['payment_status' => 'Failed']);
    }

    private function makeUser(Tenant $tenant, string $name, string $email, string $role): User
    {
        $user = new User(['name' => $name, 'email' => $email, 'password' => 'password', 'role' => $role]);
        $user->tenant_id = $tenant->id;
        $user->save();

        return $user;
    }

    private function makeStation(Tenant $tenant, string $name, string $address, string $city, float $lat, float $lng, array $connectors): Station
    {
        $station = new Station([
            'station_code'    => 'STN-' . strtoupper(substr(md5($name), 0, 6)),
            'station_name'    => $name,
            'address_line1'   => $address,
            'city'            => $city,
            'country'         => 'Nepal',
            'latitude'        => $lat,
            'longitude'       => $lng,
            'access_type'     => 'public',
            'status'          => 'active',
            'operating_hours' => ['is_24_7' => true],
            'amenities'       => ['Parking', 'Cafe'],
            'contact_phone'   => '9806614220',
            'contact_email'   => $tenant->contact_email,
        ]);
        $station->tenant_id = $tenant->id;
        $station->save();

        foreach ($connectors as [$label, $type, $kw, $status]) {
            $station->connectors()->create([
                'label' => $label, 'type' => $type, 'power_kw' => $kw, 'status' => $status,
            ]);
        }

        return $station;
    }

    private function makeBooking(Tenant $tenant, Station $station, User $driver, int $dayOffset, string $start, string $end, float $amount, string $method, string $payStatus, string $status): Booking
    {
        $booking = new Booking([
            'booking_id'     => 'BK-' . strtoupper(substr(md5(uniqid('', true)), 0, 8)),
            'driver_id'      => $driver->id,
            'station_id'     => $station->id,
            'booking_date'   => now()->addDays($dayOffset)->toDateString(),
            'start_time'     => $start,
            'end_time'       => $end,
            'amount'         => $amount,
            'payment_method' => $method,
            'payment_status' => $payStatus,
            'status'         => $status,
        ]);
        $booking->tenant_id = $tenant->id;
        $booking->save();

        return $booking;
    }
}