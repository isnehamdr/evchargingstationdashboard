<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->decimal('price_per_hour', 10, 2)->default(300)->after('status');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('cancellation_fee', 10, 2)->default(0)->after('amount');
            $table->decimal('refund_amount', 10, 2)->default(0)->after('cancellation_fee');
            $table->timestamp('cancelled_at')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['cancellation_fee', 'refund_amount', 'cancelled_at']);
        });
        Schema::table('stations', function (Blueprint $table) {
            $table->dropColumn('price_per_hour');
        });
    }
};