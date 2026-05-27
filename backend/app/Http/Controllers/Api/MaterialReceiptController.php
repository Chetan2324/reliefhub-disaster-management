<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaterialReceipt;
use App\Http\Resources\MaterialReceiptResource;
use App\Http\Requests\MaterialReceipt\StoreRequest;
use App\Http\Requests\MaterialReceipt\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class MaterialReceiptController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = MaterialReceipt::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = MaterialReceiptResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "MaterialReceipt list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = MaterialReceipt::create($request->all());
        return $this->successResponse(new MaterialReceiptResource($item), "MaterialReceipt created", 201);
    }

    public function show($id)
    {
        $item = MaterialReceipt::findOrFail($id);
        return $this->successResponse(new MaterialReceiptResource($item), "MaterialReceipt retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = MaterialReceipt::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new MaterialReceiptResource($item), "MaterialReceipt updated");
    }

    public function destroy($id)
    {
        $item = MaterialReceipt::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "MaterialReceipt deleted");
    }
}
