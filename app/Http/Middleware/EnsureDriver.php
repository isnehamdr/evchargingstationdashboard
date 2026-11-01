<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureDriver
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'driver') {
            return response()->json(['message' => 'Drivers only.'], 403);
        }

        if ($user->driver_status === 'Suspended') {
            $user->tokens()->delete();
            return response()->json(['message' => 'Your account is suspended.'], 403);
        }

        return $next($request);
    }
}