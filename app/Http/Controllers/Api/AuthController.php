<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'       => ['required', Password::defaults()],
            'phone'          => ['nullable', 'string', 'max:20'],
            'vehicle_model'  => ['nullable', 'string', 'max:255'],
            'vehicle_number' => ['nullable', 'string', 'max:50', 'unique:users,vehicle_number'],
            'connector_type' => ['nullable', Rule::in(['CCS2', 'Type 2', 'CHAdeMO', 'GB/T'])],
        ]);

        // role, status and tenant are set here, never taken from the app
        $driver = new User($data);
        $driver->role = 'driver';
        $driver->driver_status = 'Active';
        $driver->tenant_id = null;
        $driver->save();

        return response()->json([
            'user'  => $this->present($driver),
            'token' => $driver->createToken('driver-app')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $driver = User::where('email', $data['email'])->where('role', 'driver')->first();

        if (!$driver || !Hash::check($data['password'], $driver->password)) {
            return response()->json(['message' => 'Wrong email or password.'], 422);
        }

        if ($driver->driver_status === 'Suspended') {
            return response()->json(['message' => 'Your account is suspended.'], 403);
        }

        return response()->json([
            'user'  => $this->present($driver),
            'token' => $driver->createToken('driver-app')->plainTextToken,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->present($request->user())]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    private function present(User $u): array
    {
        return $u->only('id', 'name', 'email', 'phone', 'vehicle_model', 'vehicle_number', 'connector_type');
    }
}