<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Http\Resources\DonationResource;
use App\Http\Requests\Donation\StoreRequest;
use App\Http\Requests\Donation\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Donation::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = DonationResource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "Donation list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = Donation::create($request->all());
        return $this->successResponse(new DonationResource($item), "Donation created", 201);
    }

    public function show($id)
    {
        $item = Donation::findOrFail($id);
        return $this->successResponse(new DonationResource($item), "Donation retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = Donation::findOrFail($id);
        $item->update($request->all());
        return $this->successResponse(new DonationResource($item), "Donation updated");
    }

    public function destroy($id)
    {
        $item = Donation::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "Donation deleted");
    }
}
