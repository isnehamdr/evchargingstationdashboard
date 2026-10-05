<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faults', function (Blueprint $table) {
    $table->id();
    $table->string('fault_id')->unique();            // "FLT-104"

    $table->foreignId('station_id')
        ->constrained('stations')
        ->cascadeOnDelete();

    $table->foreignId('connector_id')
        ->nullable()
        ->constrained('connectors')
        ->nullOnDelete();

    $table->string('issue');                         // "Connector unresponsive"
    $table->string('severity')->default('Warning');  // Critical | Warning | Info
    $table->string('status')->default('Open');        // Open | Acknowledged | Resolved

    $table->timestamp('acknowledged_at')->nullable();
    $table->timestamp('resolved_at')->nullable();
    $table->text('notes')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faults');
    }
};
