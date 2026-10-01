<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\StationController;
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




Route::get('/admin-station', function () {
    return Inertia::render('AdminPages/Station');
});

Route::get('/admin-booking', function () {
    return Inertia::render('AdminPages/Booking');
});


});

require __DIR__.'/auth.php';
