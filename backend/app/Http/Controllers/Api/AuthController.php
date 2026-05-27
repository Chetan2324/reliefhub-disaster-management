<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponse;

    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        try {
            $data = $this->authService->register($request->validated());
            return $this->successResponse($data, 'User registered successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Registration failed', 500, $e->getMessage());
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $data = $this->authService->login($request->validated());
            return $this->successResponse($data, 'Login successful');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation Error', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Login failed', 500, $e->getMessage());
        }
    }

    public function logout(Request $request)
    {
        try {
            $this->authService->logout($request->user());
            return $this->successResponse(null, 'Logged out successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Logout failed', 500, $e->getMessage());
        }
    }

    public function me(Request $request)
    {
        return $this->successResponse($request->user()->load('role'), 'User profile retrieved successfully');
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        
        $user = \App\Models\User::where('email', $request->email)->first();
        $token = \Illuminate\Support\Facades\Password::broker()->createToken($user);
        
        return $this->successResponse(['token' => $token], 'Reset link generated successfully');
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:3|confirmed'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!\Illuminate\Support\Facades\Password::broker()->tokenExists($user, $request->token)) {
            return $this->errorResponse('Invalid or expired reset token', 400);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();
        \Illuminate\Support\Facades\Password::broker()->deleteToken($user);

        return $this->successResponse(null, 'Password reset successfully');
    }
}
