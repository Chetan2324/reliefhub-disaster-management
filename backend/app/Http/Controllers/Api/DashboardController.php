<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Disaster;
use App\Models\InventoryItem;
use App\Models\Distribution;
use App\Models\Dispatch;
use App\Models\Volunteer;
use App\Models\Camp;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    public function summary()
    {
        $activeDisasters = Disaster::where('status', 'Active')->get();
        
        // Fetch Alerts from Emergency Requests
        $alerts = \App\Models\EmergencyRequest::whereIn('status', ['Pending', 'In Progress'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'title' => $req->request_type . ' at ' . $req->location,
                    'desc' => \Illuminate\Support\Str::limit($req->request_details, 50),
                    'severity' => strtolower($req->priority) === 'high' || strtolower($req->priority) === 'critical' ? 'critical' : 'warning',
                ];
            });

        // Feeds from ActivityLogs or fallback
        $recentLogs = \App\Models\ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => 'log_'.$log->id,
                    'type' => strtolower($log->module),
                    'message' => $log->action . ' by ' . ($log->user ? $log->user->name : 'System'),
                    'time' => $log->created_at->diffForHumans(),
                ];
            });

        // Map data
        $mapData = $activeDisasters->map(function ($disaster) {
            return [
                'id' => $disaster->id,
                'name' => $disaster->name,
                'latitude' => $disaster->latitude,
                'longitude' => $disaster->longitude,
                'severity' => strtolower($disaster->severity),
            ];
        });

        $data = [
            'total_materials_available' => InventoryItem::where('status', 'Available')->sum('quantity'),
            'total_materials_distributed' => Distribution::where('status', 'Delivered')->sum('quantity'),
            'active_disasters' => $activeDisasters->count(),
            'active_volunteers' => Volunteer::where('is_available', true)->count(),
            'vehicles_in_transit' => Dispatch::where('status', 'In Transit')->count(),
            'total_camps' => Camp::count(),
            'pending_sos' => \App\Models\EmergencyRequest::where('status', 'Pending')->count(),
            'citizens_assisted' => \App\Models\Citizen::count(), // Or sum('family_size')
            'map_data' => $mapData,
            'alerts' => $alerts,
            'feeds' => $recentLogs,
        ];

        return $this->successResponse($data, 'Dashboard summary retrieved successfully');
    }

    public function charts()
    {
        // Real-like chart data (would normally group by dates)
        // Here we mock the daily dispatch trend for visualization
        $data = [
            'distribution_by_category' => [
                'Food' => InventoryItem::where('category', 'Food')->sum('quantity'),
                'Medicines' => InventoryItem::where('category', 'Medicines')->sum('quantity'),
                'Clothes' => InventoryItem::where('category', 'Clothes')->sum('quantity'),
            ],
            'daily_dispatch_trend' => [
                date('M d', strtotime('-6 days')) => Dispatch::whereDate('created_at', date('Y-m-d', strtotime('-6 days')))->count() + 2,
                date('M d', strtotime('-5 days')) => Dispatch::whereDate('created_at', date('Y-m-d', strtotime('-5 days')))->count() + 5,
                date('M d', strtotime('-4 days')) => Dispatch::whereDate('created_at', date('Y-m-d', strtotime('-4 days')))->count() + 3,
                date('M d', strtotime('-3 days')) => Dispatch::whereDate('created_at', date('Y-m-d', strtotime('-3 days')))->count() + 8,
                date('M d', strtotime('-2 days')) => Dispatch::whereDate('created_at', date('Y-m-d', strtotime('-2 days')))->count() + 12,
                date('M d', strtotime('-1 days')) => Dispatch::whereDate('created_at', date('Y-m-d', strtotime('-1 days')))->count() + 10,
                date('M d') => Dispatch::whereDate('created_at', date('Y-m-d'))->count() + 15,
            ]
        ];

        return $this->successResponse($data, 'Chart data retrieved successfully');
    }
}
