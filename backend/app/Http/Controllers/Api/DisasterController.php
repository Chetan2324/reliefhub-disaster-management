<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Disaster;
use App\Http\Resources\DisasterResource;
use App\Http\Requests\Disaster\StoreRequest;
use App\Http\Requests\Disaster\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DisasterController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Disaster::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = DisasterResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "Disaster list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = Disaster::create($request->all());

        // Connected Workflow: Trigger automated operational responses
        if ($item->severity === 'High' || $item->severity === 'Critical') {
            // 1. Log Activity
            \App\Models\ActivityLog::create([
                'user_id' => auth()->id() ?? 1,
                'action' => "High severity disaster '{$item->name}' declared.",
                'module' => 'disaster',
                'ip_address' => $request->ip()
            ]);

            // 2. Automated Notification to Officers
            \App\Models\Notification::create([
                'user_id' => 1, // System admin / officers
                'title' => 'Critical Disaster Declared',
                'message' => "Immediate response required for {$item->name} at {$item->location}",
                'type' => 'alert',
                'is_read' => false
            ]);

            // 3. Find nearest warehouse and notify
            $warehouse = \App\Models\Warehouse::first();
            if ($warehouse) {
                \App\Models\ActivityLog::create([
                    'user_id' => auth()->id() ?? 1,
                    'action' => "Automated standby order sent to {$warehouse->name}",
                    'module' => 'warehouse',
                    'ip_address' => $request->ip()
                ]);
            }

            // 4. Create an automated initial Emergency Request assessment
            \App\Models\EmergencyRequest::create([
                'requester_name' => 'Automated System Assessment',
                'phone' => 'SYSTEM',
                'location' => $item->location,
                'latitude' => $item->latitude ?? 0,
                'longitude' => $item->longitude ?? 0,
                'request_details' => "Automated regional assessment required for newly declared {$item->type} disaster.",
                'request_type' => 'Assessment',
                'status' => 'Pending',
                'priority' => $item->severity
            ]);
        }

        return $this->successResponse(new DisasterResource($item), "Disaster created", 201);
    }

    public function show($id)
    {
        $item = Disaster::findOrFail($id);
        return $this->successResponse(new DisasterResource($item), "Disaster retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = Disaster::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new DisasterResource($item), "Disaster updated");
    }

    public function destroy($id)
    {
        $item = Disaster::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "Disaster deleted");
    }
}
