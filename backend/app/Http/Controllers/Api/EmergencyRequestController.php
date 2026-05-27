<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmergencyRequest;
use App\Http\Resources\EmergencyRequestResource;
use App\Http\Requests\EmergencyRequest\StoreRequest;
use App\Http\Requests\EmergencyRequest\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class EmergencyRequestController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = EmergencyRequest::query()->orderBy('created_at', 'desc');
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }
        
        if ($request->has("my_requests")) {
            $query->where('user_id', auth()->id());
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = EmergencyRequestResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "EmergencyRequest list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $data = $request->all();
        $data['user_id'] = auth()->id();
        $item = EmergencyRequest::create($data);

        // Smart Workflow Connection: Auto-assign SOS to nearest Relief Camp
        $reqType = strtolower($item->request_type);
        if ($reqType === 'evacuation' || $reqType === 'shelter' || $reqType === 'medical' || $item->priority === 'Critical' || $item->priority === 'High') {
            
            // Find nearest camp with capacity
            $camps = \App\Models\Camp::all();
            $nearestCamp = null;
            $minDistance = PHP_FLOAT_MAX;

            foreach ($camps as $camp) {
                if ($camp->current_occupancy < $camp->capacity) {
                    $dist = pow($camp->latitude - $item->latitude, 2) + pow($camp->longitude - $item->longitude, 2);
                    if ($dist < $minDistance) {
                        $minDistance = $dist;
                        $nearestCamp = $camp;
                    }
                }
            }

            if ($nearestCamp) {
                // Auto-create or update citizen profile
                $citizen = \App\Models\Citizen::where('user_id', auth()->id())->first();
                if (!$citizen) {
                    $citizen = \App\Models\Citizen::create([
                        'user_id' => auth()->id(),
                        'name' => $item->requester_name,
                        'phone' => $item->phone,
                        'family_size' => 1, // Assume base family size of 1
                        'camp_id' => $nearestCamp->id,
                        'priority' => $item->priority,
                        'aadhaar_number' => 'SOS-'.time(), // Mock identifier
                    ]);
                } else {
                    $citizen->update(['camp_id' => $nearestCamp->id]);
                }

                // Update Occupancy
                $nearestCamp->increment('current_occupancy');

                // Generate Activity Log
                \App\Models\ActivityLog::create([
                    'user_id' => auth()->id() ?? 1,
                    'action' => "SOS Received from {$item->requester_name}. Auto-assigned to Camp '{$nearestCamp->name}'.",
                    'module' => 'camp',
                    'ip_address' => $request->ip()
                ]);

                // Update Request Status
                $item->update([
                    'status' => 'In Progress', 
                    'request_details' => $item->request_details . "\n\n[SYSTEM: AUTO-ASSIGNED TO {$nearestCamp->name}]"
                ]);
                
                // System Notification to Camp Manager
                \App\Models\Notification::create([
                    'user_id' => $nearestCamp->manager_id ?? 1,
                    'title' => 'Incoming Evacuee (SOS)',
                    'message' => "Citizen {$item->requester_name} automatically assigned. Prepare intake capacity.",
                    'type' => 'alert',
                    'is_read' => false
                ]);
            } else {
                 \App\Models\ActivityLog::create([
                    'user_id' => auth()->id() ?? 1,
                    'action' => "CRITICAL WARNING: SOS Received but NO CAMPS HAVE CAPACITY nearby.",
                    'module' => 'camp',
                    'ip_address' => $request->ip()
                ]);
                
                \App\Models\Notification::create([
                    'user_id' => 1,
                    'title' => 'CAMP OVERLOAD WARNING',
                    'message' => "SOS received but all regional camps are at maximum capacity.",
                    'type' => 'alert',
                    'is_read' => false
                ]);
            }
        }

        return $this->successResponse(new EmergencyRequestResource($item), "SOS Request submitted and processed by routing AI.", 201);
    }

    public function show($id)
    {
        $item = EmergencyRequest::findOrFail($id);
        return $this->successResponse(new EmergencyRequestResource($item), "EmergencyRequest retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = EmergencyRequest::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new EmergencyRequestResource($item), "EmergencyRequest updated");
    }

    public function destroy($id)
    {
        $item = EmergencyRequest::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "EmergencyRequest deleted");
    }
}
