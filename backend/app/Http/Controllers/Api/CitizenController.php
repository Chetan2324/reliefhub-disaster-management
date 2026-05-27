<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use App\Http\Resources\CitizenResource;
use App\Http\Requests\Citizen\StoreRequest;
use App\Http\Requests\Citizen\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CitizenController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Citizen::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = CitizenResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "Citizen list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = Citizen::create($request->all());
        return $this->successResponse(new CitizenResource($item), "Citizen created", 201);
    }

    public function show($id)
    {
        $item = Citizen::findOrFail($id);
        return $this->successResponse(new CitizenResource($item), "Citizen retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = Citizen::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new CitizenResource($item), "Citizen updated");
    }

    public function destroy($id)
    {
        $item = Citizen::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "Citizen deleted");
    }
}
