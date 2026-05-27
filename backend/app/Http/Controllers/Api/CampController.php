<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camp;
use App\Http\Resources\CampResource;
use App\Http\Requests\Camp\StoreRequest;
use App\Http\Requests\Camp\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CampController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Camp::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = CampResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "Camp list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = Camp::create($request->all());
        
        // Workflow: Automatically trigger resource assessment request when a new camp is created
        \App\Models\ActivityLog::create([
            'user_id' => auth()->id() ?? 1,
            'action' => "New Relief Camp '{$item->name}' established at {$item->location}. Capacity: {$item->capacity}.",
            'module' => 'camp',
            'ip_address' => $request->ip()
        ]);
        
        return $this->successResponse(new CampResource($item), "Camp created", 201);
    }

    public function show($id)
    {
        $item = Camp::findOrFail($id);
        return $this->successResponse(new CampResource($item), "Camp retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = Camp::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new CampResource($item), "Camp updated");
    }

    public function destroy($id)
    {
        $item = Camp::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "Camp deleted");
    }
}
