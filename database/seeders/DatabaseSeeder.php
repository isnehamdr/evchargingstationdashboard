<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $a = Tenant::create(['name' => 'Lakeside Charging', 'slug' => 'lakeside', 'status' => 'active']);
        $b = Tenant::create(['name' => 'Himalaya EV', 'slug' => 'himalaya-ev', 'status' => 'active']);

       User::create([
    'name' => 'Super Admin',
    'email' => 'admin@test.com',
    'password' => 'password',
    'role' => 'super_admin',     
]);

User::create([
    'tenant_id' => $a->id,
    'name' => 'Owner A',
    'email' => 'owner-a@test.com',
    'password' => 'password',
    'role' => 'owner',           
]);

User::create([
    'tenant_id' => $b->id,
    'name' => 'Owner B',
    'email' => 'owner-b@test.com',
    'password' => 'password',
    'role' => 'owner',           
]);
    }
}