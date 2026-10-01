<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stations', function (Blueprint $table) {
            $table->id();

            $table->string('station_code', 50)->unique();

            $table->string('station_name');
            $table->string('site_name')->nullable();
            $table->string('operator_name')->nullable();

            $table->string('address_line1');
            $table->string('address_line2')->nullable();

            $table->string('city');
            $table->string('state_province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Nepal');

            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            $table->text('location_notes')->nullable();

            $table->enum('access_type', [
                'public',
                'private',
                'restricted',
                'fleet-only'
            ])->default('public');

            $table->json('operating_hours')->nullable();
            $table->json('amenities')->nullable();

            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();

            $table->enum('status', [
                'active',
                'maintenance',
                'closed'
            ])->default('active');

            $table->json('images')->nullable();
            $table->json('connectors')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stations');
    }
};