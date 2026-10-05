<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // Public booking reference
            $table->string('booking_id')->unique();

            // Driver/User
            $table->foreignId('driver_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Charging/booking station
            $table->foreignId('station_id')
                ->constrained('stations')
                ->cascadeOnDelete();

            // Booking schedule
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');

            // Payment
            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('Pending');

            // Booking status
            $table->string('status')->default('Upcoming');

            // Optional information
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};