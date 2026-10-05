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
       Schema::create('grid_feeders', function (Blueprint $table) {
    $table->id();
    $table->string('name');                         // "Damside Feeder"
    $table->unsignedTinyInteger('load_percent')->default(0); // 0–100
    $table->string('status')->default('Stable');     // Stable | Elevated | Critical
    $table->decimal('capacity_kw', 10, 2)->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grid_feeders');
    }
};
