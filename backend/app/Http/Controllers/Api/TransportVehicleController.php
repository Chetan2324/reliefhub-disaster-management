<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportVehicle;
use App\Http\Resources\TransportVehicleResource;
use App\Http\Requests\TransportVehicle\StoreRequest;
use App\Http\Requests\TransportVehicle\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class TransportVehicleController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = TransportVehicle::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = TransportVehicleResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "TransportVehicle list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = TransportVehicle::create($request->all());
        return $this->successResponse(new TransportVehicleResource($item), "TransportVehicle created", 201);
    }

    public function show($id)
    {
        $item = TransportVehicle::findOrFail($id);
        return $this->successResponse(new TransportVehicleResource($item), "TransportVehicle retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = TransportVehicle::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new TransportVehicleResource($item), "TransportVehicle updated");
    }

    public function destroy($id)
    {
        $item = TransportVehicle::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "TransportVehicle deleted");
    }
}
