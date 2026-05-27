<?php

$dir = __DIR__ . '/app/Http/Controllers/Api/';
$models = ['Disaster', 'Warehouse', 'InventoryItem', 'MaterialReceipt', 'Dispatch', 'TransportVehicle', 'MovementTracking', 'Camp', 'Citizen', 'Distribution', 'EmergencyRequest', 'Volunteer', 'Donation'];

$saferControllerTemplate = '<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\$$model$$;
use App\Http\Resources\$$model$$Resource;
use App\Http\Requests\$$model$$\StoreRequest;
use App\Http\Requests\$$model$$\UpdateRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class $$model$$Controller extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = $$model$$::query();
        
        if ($request->has("search")) {
             // Basic search logic could be added here
        }

        $items = $query->paginate($request->get("per_page", 15));
        $resource = $$model$$Resource::collection($items)->response()->getData(true);
        return $this->successResponse($resource["data"], "$$model$$ list retrieved", 200, $resource["meta"] ?? []);
    }

    public function store(StoreRequest $request)
    {
        $item = $$model$$::create($request->validated());
        return $this->successResponse(new $$model$$Resource($item), "$$model$$ created", 201);
    }

    public function show($id)
    {
        $item = $$model$$::findOrFail($id);
        return $this->successResponse(new $$model$$Resource($item), "$$model$$ retrieved");
    }

    public function update(UpdateRequest $request, $id)
    {
        $item = $$model$$::findOrFail($id);
        $item->update($request->validated());
        return $this->successResponse(new $$model$$Resource($item), "$$model$$ updated");
    }

    public function destroy($id)
    {
        $item = $$model$$::findOrFail($id);
        $item->delete();
        return $this->successResponse(null, "$$model$$ deleted");
    }
}
';

foreach ($models as $model) {
    $filePath = $dir . $model . 'Controller.php';
    $controllerTemplate = str_replace('$$model$$', $model, $saferControllerTemplate);
    file_put_contents($filePath, $controllerTemplate);
    echo "Updated {$model}Controller\n";
}
