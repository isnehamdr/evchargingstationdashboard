<?php

use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\GridFaultController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RevenuePaymentController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TeamController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
| 1. Any logged-in user
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
| 2. Operations pages: everyone on the operator team
|    (remove "admin" once the seeder uses the new roles)
*/
Route::middleware(['auth', 'role:admin,super_admin,owner,manager,staff'])->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware('verified')->name('dashboard');

    // Stations
    Route::get('/admin-station', function () {
        return Inertia::render('AdminPages/Station');
    });
    Route::get('/ourstation', [StationController::class, 'index'])->name('ourstation.index');
    Route::post('/ourstation', [StationController::class, 'store'])->name('ourstation.store');
    Route::post('/ourstation/images', [StationController::class, 'uploadImage'])->name('ourstation.images');
    Route::get('/ourstation/{station}', [StationController::class, 'manage'])->name('ourstation.manage');
    Route::put('/ourstation/{station}', [StationController::class, 'update'])->name('ourstation.update');
    Route::delete('/ourstation/{station}', [StationController::class, 'destroy'])->name('ourstation.destroy');

    // Bookings
    Route::get('/admin-booking', function () {
        return Inertia::render('AdminPages/Booking');
    });
Route::get('/admin-booking', [BookingController::class, 'index'])->name('ourbooking.index');
Route::put('/ourbooking/{booking}', [BookingController::class, 'update'])->name('ourbooking.update');


// Settings (every team member: profile, security, notifications)
Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications'])->name('settings.notifications');
  

    // Drivers
    Route::get('/admin-drivers', [DriverController::class, 'index'])->name('ourdrivers.index');
    Route::post('/ourdrivers', [DriverController::class, 'store'])->name('ourdrivers.store');
    Route::put('/ourdrivers/{driver}', [DriverController::class, 'updateStatus'])->name('ourdrivers.update');
    Route::delete('/ourdrivers/{driver}', [DriverController::class, 'destroy'])->name('ourdrivers.destroy');
    

    // Notifications
    Route::get('/admin-notifications', [AdminNotificationController::class, 'index'])->name('ournotifications.index');
    Route::put('/ournotifications/read-all', [AdminNotificationController::class, 'markAllRead'])->name('ournotifications.readAll');
    Route::delete('/ournotifications/clear-read', [AdminNotificationController::class, 'clearRead'])->name('ournotifications.clearRead');
    Route::put('/ournotifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('ournotifications.read');
    Route::delete('/ournotifications/{notification}', [AdminNotificationController::class, 'destroy'])->name('ournotifications.destroy');
});

/*
| 3. Money pages: not for staff
*/
Route::middleware(['auth', 'role:admin,super_admin,owner,manager'])->group(function () {
    Route::get('/admin-revenue', [RevenuePaymentController::class, 'index'])->name('ourrevenue.index');
});

/*
| 4. Owner only: settings and team
*/
Route::middleware(['auth', 'role:admin,super_admin,owner'])->group(function () {
    Route::get('/settings', function () {
        return Inertia::render('AdminPages/Setting');
    });

    // Enable these once TeamController and the Team page exist:
     Route::get('/team', [TeamController::class, 'index'])->name('team.index');
    Route::post('/team', [TeamController::class, 'store'])->name('team.store');
    Route::put('/team/{member}', [TeamController::class, 'update'])->name('team.update');
    Route::delete('/team/{member}', [TeamController::class, 'destroy'])->name('team.destroy');


    // Company settings
Route::put('/settings/organization', [SettingsController::class, 'updateOrganization'])->name('settings.organization');
Route::put('/settings/payments', [SettingsController::class, 'updatePayments'])->name('settings.payments');
});

require __DIR__.'/auth.php';