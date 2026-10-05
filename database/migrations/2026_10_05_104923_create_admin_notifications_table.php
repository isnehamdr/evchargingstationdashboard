<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('system');       // fault | feeder | booking | payment | driver | system
            $table->string('severity')->default('Info');     // Critical | Warning | Info
            $table->string('title');
            $table->text('message')->nullable();
            $table->string('link')->nullable();              // page to open, e.g. /admin-gridfaults
            $table->json('data')->nullable();                // extra context (fault_id, booking_id...)
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['read_at', 'severity']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};