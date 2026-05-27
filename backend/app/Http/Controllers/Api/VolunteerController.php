<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Http\Resources\VolunteerResource;
use App\Http\Requests\Volunteer\StoreRequest;
use App\Http\Requests\Volunteer\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Volunteer::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = VolunteerResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "Volunteer list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = Volunteer::create($request->all());
        return $this->successResponse(new VolunteerResource($item), "Volunteer created", 201);
    }

    public function show($id)
    {
        $item = Volunteer::findOrFail($id);
        return $this->successResponse(new VolunteerResource($item), "Volunteer retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = Volunteer::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new VolunteerResource($item), "Volunteer updated");
    }

    public function destroy($id)
    {
        $item = Volunteer::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "Volunteer deleted");
    }
}
