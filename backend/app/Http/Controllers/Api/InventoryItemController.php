<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Http\Resources\InventoryItemResource;
use App\Http\Requests\InventoryItem\StoreRequest;
use App\Http\Requests\InventoryItem\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = InventoryItem::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = InventoryItemResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "InventoryItem list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = InventoryItem::create($request->all());
        return $this->successResponse(new InventoryItemResource($item), "InventoryItem created", 201);
    }

    public function show($id)
    {
        $item = InventoryItem::findOrFail($id);
        return $this->successResponse(new InventoryItemResource($item), "InventoryItem retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new InventoryItemResource($item), "InventoryItem updated");
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "InventoryItem deleted");
    }
}
