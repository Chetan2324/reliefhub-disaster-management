<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dispatch;
use App\Http\Resources\DispatchResource;
use App\Http\Requests\Dispatch\StoreRequest;
use App\Http\Requests\Dispatch\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DispatchController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Dispatch::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = DispatchResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "Dispatch list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = Dispatch::create($request->all());
        return $this->successResponse(new DispatchResource($item), "Dispatch created", 201);
    }

    public function show($id)
    {
        $item = Dispatch::findOrFail($id);
        return $this->successResponse(new DispatchResource($item), "Dispatch retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = Dispatch::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new DispatchResource($item), "Dispatch updated");
    }

    public function destroy($id)
    {
        $item = Dispatch::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "Dispatch deleted");
    }
}
