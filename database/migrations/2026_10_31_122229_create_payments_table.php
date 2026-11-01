<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('users')->cascadeOnDelete();

            $table->string('gateway', 20);               // esewa | khalti | fonepay | bank | cash
            $table->decimal('amount', 10, 2);            // always copied from the booking, never from the app
            $table->string('status', 20)->default('initiated'); // initiated | paid | failed | refunded
            $table->string('reference')->nullable();     // our unique id sent to the gateway
            $table->string('gateway_ref')->nullable();   // the gateway's own transaction id
            $table->json('gateway_data')->nullable();    // raw verification response
            $table->decimal('refunded_amount', 10, 2)->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique('reference');
            $table->unique(['gateway', 'gateway_ref']);  // one gateway transaction can only count once
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};