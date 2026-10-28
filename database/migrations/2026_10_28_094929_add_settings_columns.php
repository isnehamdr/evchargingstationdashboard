<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('reg_no')->nullable()->after('contact_phone');
            $table->string('currency', 3)->default('NPR')->after('reg_no');
            $table->string('timezone')->default('Asia/Kathmandu')->after('currency');
            $table->text('payment_settings')->nullable()->after('timezone'); // stored encrypted
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('notification_prefs')->nullable()->after('driver_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('notification_prefs');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['reg_no', 'currency', 'timezone', 'payment_settings']);
        });
    }
};