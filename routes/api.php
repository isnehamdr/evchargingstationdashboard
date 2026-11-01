<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingApiController;
use App\Http\Controllers\Api\StationApiController;
use App\Http\Controllers\Api\PaymentApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'driver'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/stations', [StationApiController::class, 'index']);
        Route::get('/stations/{id}', [StationApiController::class, 'show']);

        Route::get('/bookings', [BookingApiController::class, 'index']);
        Route::post('/bookings', [BookingApiController::class, 'store']);
        Route::post('/bookings/{id}/cancel', [BookingApiController::class, 'cancel']);

        Route::post('/bookings/{id}/pay', [PaymentApiController::class, 'start'])->middleware('throttle:10,1');
Route::get('/payments/{reference}', [PaymentApiController::class, 'status']);
    });
});