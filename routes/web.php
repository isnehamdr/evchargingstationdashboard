<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\StationController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\GridFaultController;
use App\Http\Controllers\RevenuePaymentController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\AdminNotificationController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');



Route::get('/ourstation', [StationController::class, 'index'])->name('ourstation.index');
Route::post('/ourstation', [StationController::class, 'store'])->name('ourstation.store');
Route::post('/ourstation/images', [StationController::class, 'uploadImage'])->name('ourstation.images');
Route::get('/ourstation/{station}', [StationController::class, 'show'])->name('ourstation.show');
Route::put('/ourstation/{station}', [StationController::class, 'update'])->name('ourstation.update');
Route::delete('/ourstation/{station}', [StationController::class, 'destroy'])->name('ourstation.destroy');


Route::get('/ourstation/{station}', [StationController::class, 'manage'])
    ->name('ourstation.manage');



Route::get('/admin-station', function () {
    return Inertia::render('AdminPages/Station');
});

Route::get('/admin-booking', function () {
    return Inertia::render('AdminPages/Booking');
});
Route::get('/admin-gridfaults', function () {
    return Inertia::render('AdminPages/GridFaults');
});
Route::get('/admin-revenue', function () {
    return Inertia::render('AdminPages/RevenueAndPayment');
});
Route::get('/admin-drivers', function () {
    return Inertia::render('AdminPages/Drivers');
});
Route::get('/admin-notifications', function () {
    return Inertia::render('AdminPages/Notifications');
});
Route::get('/settings', function () {
    return Inertia::render('AdminPages/Setting');
});


Route::get('/ourbooking', [BookingController::class, 'index'])
    ->name('ourbooking.index');

Route::post('/ourbooking', [BookingController::class, 'store'])
    ->name('ourbooking.store');

Route::put('/ourbooking/{booking}', [BookingController::class, 'update'])
    ->name('ourbooking.update');

Route::delete('/ourbooking/{booking}', [BookingController::class, 'destroy'])
    ->name('ourbooking.destroy');


    Route::get('/admin-gridfaults', [GridFaultController::class, 'index'])->name('ourfaults.index');
Route::post('/ourfaults', [GridFaultController::class, 'store'])->name('ourfaults.store');
Route::put('/ourfaults/{fault}', [GridFaultController::class, 'updateStatus'])->name('ourfaults.update');
Route::delete('/ourfaults/{fault}', [GridFaultController::class, 'destroy'])->name('ourfaults.destroy');


Route::get('/admin-revenue', [RevenuePaymentController::class, 'index'])->name('ourrevenue.index');



Route::get('/admin-drivers', [DriverController::class, 'index'])->name('ourdrivers.index');
Route::post('/ourdrivers', [DriverController::class, 'store'])->name('ourdrivers.store');
Route::put('/ourdrivers/{driver}', [DriverController::class, 'updateStatus'])->name('ourdrivers.update');
Route::delete('/ourdrivers/{driver}', [DriverController::class, 'destroy'])->name('ourdrivers.destroy');

Route::get('/admin-notifications', [AdminNotificationController::class, 'index'])->name('ournotifications.index');
Route::put('/ournotifications/read-all', [AdminNotificationController::class, 'markAllRead'])->name('ournotifications.readAll');
Route::delete('/ournotifications/clear-read', [AdminNotificationController::class, 'clearRead'])->name('ournotifications.clearRead');
Route::put('/ournotifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('ournotifications.read');
Route::delete('/ournotifications/{notification}', [AdminNotificationController::class, 'destroy'])->name('ournotifications.destroy');


});

require __DIR__.'/auth.php';
