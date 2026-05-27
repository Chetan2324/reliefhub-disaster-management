<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Http\Resources\WarehouseResource;
use App\Http\Requests\Warehouse\StoreRequest;
use App\Http\Requests\Warehouse\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Warehouse::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = WarehouseResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "Warehouse list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = Warehouse::create($request->all());
        return $this->successResponse(new WarehouseResource($item), "Warehouse created", 201);
    }

    public function show($id)
    {
        $item = Warehouse::findOrFail($id);
        return $this->successResponse(new WarehouseResource($item), "Warehouse retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = Warehouse::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new WarehouseResource($item), "Warehouse updated");
    }

    public function destroy($id)
    {
        $item = Warehouse::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "Warehouse deleted");
    }
}
