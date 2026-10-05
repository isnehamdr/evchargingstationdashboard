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
       Schema::create('connectors', function (Blueprint $table) {
    $table->id();
    $table->foreignId('station_id')->constrained()->cascadeOnDelete();
    $table->string('label');
    $table->string('type');
    $table->decimal('power_kw', 8, 2)->nullable();
    $table->string('status')->default('available'); // available|charging|fault|offline
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connectors');
    }
};
