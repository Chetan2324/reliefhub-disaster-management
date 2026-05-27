<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Distribution;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DistributionController extends Controller
{
    public function index(Request $request)
    {
        $query = Distribution::with(['citizen', 'item', 'disaster', 'distributor'])->orderBy('created_at', 'desc');
        
        if ($request->has('my_allocations')) {
            $citizen = \App\Models\Citizen::where('user_id', auth()->id())->first();
            if ($citizen) {
                $query->where('citizen_id', $citizen->id);
            } else {
                $query->where('citizen_id', -1); // Force empty if no citizen profile
            }
        }
        
        $distributions = $query->get();
        return response()->json($distributions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'citizen_id' => 'required|exists:citizens,id',
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'disaster_id' => 'required|exists:disasters,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // Prevention of duplicate allocation for same item to same citizen in same disaster
        $existing = Distribution::where('citizen_id', $request->citizen_id)
            ->where('inventory_item_id', $request->inventory_item_id)
            ->where('disaster_id', $request->disaster_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Duplicate allocation. This citizen has already been allocated this item for this disaster.'], 422);
        }

        $distribution = Distribution::create([
            'citizen_id' => $request->citizen_id,
            'inventory_item_id' => $request->inventory_item_id,
            'disaster_id' => $request->disaster_id,
            'quantity' => $request->quantity,
            'token' => strtoupper(Str::random(10)), // Generate Token/QR
            'status' => 'Pending',
        ]);

        return response()->json([
            'message' => 'Distribution created successfully',
            'distribution' => $distribution->load(['citizen', 'item', 'disaster'])
        ], 201);
    }

    public function show($id)
    {
        $distribution = Distribution::with(['citizen', 'item', 'disaster', 'distributor'])->findOrFail($id);
        return response()->json($distribution);
    }
    
    public function verify(Request $request, $id)
    {
        $distribution = Distribution::findOrFail($id);
        
        if ($distribution->status !== 'Pending') {
            return response()->json(['message' => 'Only pending distributions can be verified.'], 400);
        }

        $distribution->update([
            'status' => 'Verified',
            'verified_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Distribution verified successfully',
            'distribution' => $distribution
        ]);
    }

    public function deliver(Request $request, $id)
    {
        $distribution = Distribution::findOrFail($id);
        
        if ($distribution->status !== 'Verified') {
            return response()->json(['message' => 'Only verified distributions can be delivered.'], 400);
        }

        $distribution->update([
            'status' => 'Delivered',
            'delivered_at' => Carbon::now(),
            'distributed_by' => $request->user()->id ?? null,
        ]);

        // Here we could also reduce inventory quantity if we want to

        return response()->json([
            'message' => 'Distribution delivered successfully',
            'distribution' => $distribution
        ]);
    }

    public function stats()
    {
        $total = Distribution::count();
        $pending = Distribution::where('status', 'Pending')->count();
        $verified = Distribution::where('status', 'Verified')->count();
        $delivered = Distribution::where('status', 'Delivered')->count();
        
        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'verified' => $verified,
            'delivered' => $delivered,
        ]);
    }
}
