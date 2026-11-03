<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->char('period', 7);                       // 2026-11
            $table->decimal('kept_amount', 12, 2);
            $table->decimal('commission_amount', 12, 2);
            $table->decimal('plan_fee', 12, 2)->default(0);
            $table->string('status', 10)->default('paid');
            $table->timestamp('paid_at')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_settlements');
    }
};