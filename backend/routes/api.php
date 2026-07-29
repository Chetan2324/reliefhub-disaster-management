<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DisasterController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\MaterialReceiptController;
use App\Http\Controllers\Api\DispatchController;
use App\Http\Controllers\Api\TransportVehicleController;
use App\Http\Controllers\Api\MovementTrackingController;
use App\Http\Controllers\Api\CampController;
use App\Http\Controllers\Api\CitizenController;
use App\Http\Controllers\Api\DistributionController;
use App\Http\Controllers\Api\EmergencyRequestController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Controllers\Api\DonationController;

use App\Http\Controllers\Api\DashboardController;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('/password/reset', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/dashboard/charts', [DashboardController::class, 'charts']);
        
        Route::apiResource('disasters', DisasterController::class);
        Route::apiResource('warehouses', WarehouseController::class);
        Route::apiResource('inventory-items', InventoryItemController::class);
        Route::apiResource('material-receipts', MaterialReceiptController::class);
        Route::apiResource('dispatches', DispatchController::class);
        Route::apiResource('transport-vehicles', TransportVehicleController::class);
        Route::apiResource('movement-trackings', MovementTrackingController::class);
        Route::apiResource('camps', CampController::class);
        Route::apiResource('citizens', CitizenController::class);
        
        // Distributions workflow
        Route::get('distributions/stats', [DistributionController::class, 'stats']);
        Route::post('distributions/{id}/verify', [DistributionController::class, 'verify']);
        Route::post('distributions/{id}/deliver', [DistributionController::class, 'deliver']);
        Route::apiResource('distributions', DistributionController::class);
        
        Route::apiResource('emergency-requests', EmergencyRequestController::class);
        Route::apiResource('volunteers', VolunteerController::class);
        Route::apiResource('donations', DonationController::class);
    });
});
