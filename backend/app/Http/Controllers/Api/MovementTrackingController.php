<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovementTracking;
use App\Http\Resources\MovementTrackingResource;
use App\Http\Requests\MovementTracking\StoreRequest;
use App\Http\Requests\MovementTracking\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class MovementTrackingController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = MovementTracking::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = MovementTrackingResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "MovementTracking list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = MovementTracking::create($request->all());
        return $this->successResponse(new MovementTrackingResource($item), "MovementTracking created", 201);
    }

    public function show($id)
    {
        $item = MovementTracking::findOrFail($id);
        return $this->successResponse(new MovementTrackingResource($item), "MovementTracking retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = MovementTracking::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new MovementTrackingResource($item), "MovementTracking updated");
    }

    public function destroy($id)
    {
        $item = MovementTracking::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "MovementTracking deleted");
    }
}
