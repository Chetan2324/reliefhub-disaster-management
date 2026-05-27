<?php
$dir = __DIR__ . '/app/Models/';

$models = [
    'Role.php' => "    protected \$fillable = ['name', 'slug', 'description'];\n    public function users() { return \$this->hasMany(User::class); }\n",
    'Permission.php' => "    protected \$fillable = ['name', 'slug'];\n",
    'Disaster.php' => "    protected \$fillable = ['name', 'type', 'severity', 'date_occurred', 'location', 'latitude', 'longitude', 'affected_population', 'description', 'status'];\n    public function camps() { return \$this->hasMany(Camp::class); }\n    public function dispatches() { return \$this->hasMany(Dispatch::class); }\n",
    'Warehouse.php' => "    protected \$fillable = ['name', 'location', 'latitude', 'longitude', 'capacity', 'manager_id', 'is_active'];\n    public function manager() { return \$this->belongsTo(User::class, 'manager_id'); }\n    public function inventoryItems() { return \$this->hasMany(InventoryItem::class); }\n",
    'InventoryItem.php' => "    protected \$fillable = ['item_name', 'category', 'quantity', 'unit', 'expiry_date', 'warehouse_id', 'supplier', 'status', 'qr_code'];\n    public function warehouse() { return \$this->belongsTo(Warehouse::class); }\n",
    'MaterialReceipt.php' => "    protected \$fillable = ['receipt_no', 'inventory_item_id', 'quantity_received', 'source', 'supplier_name', 'received_at', 'received_by', 'invoice_image', 'status'];\n    public function item() { return \$this->belongsTo(InventoryItem::class, 'inventory_item_id'); }\n    public function receiver() { return \$this->belongsTo(User::class, 'received_by'); }\n",
    'Dispatch.php' => "    protected \$fillable = ['dispatch_no', 'disaster_id', 'warehouse_id', 'transport_vehicle_id', 'driver_id', 'status', 'dispatch_time', 'expected_delivery_time', 'actual_delivery_time', 'route_status'];\n    public function disaster() { return \$this->belongsTo(Disaster::class); }\n    public function warehouse() { return \$this->belongsTo(Warehouse::class); }\n    public function vehicle() { return \$this->belongsTo(TransportVehicle::class, 'transport_vehicle_id'); }\n    public function driver() { return \$this->belongsTo(User::class, 'driver_id'); }\n    public function trackings() { return \$this->hasMany(MovementTracking::class); }\n",
    'MovementTracking.php' => "    protected \$fillable = ['dispatch_id', 'current_latitude', 'current_longitude', 'location_name', 'status_update'];\n    public function dispatch() { return \$this->belongsTo(Dispatch::class); }\n",
    'TransportVehicle.php' => "    protected \$fillable = ['vehicle_number', 'vehicle_type', 'capacity', 'status'];\n    public function dispatches() { return \$this->hasMany(Dispatch::class); }\n",
    'Camp.php' => "    protected \$fillable = ['name', 'disaster_id', 'location', 'latitude', 'longitude', 'capacity', 'current_occupancy', 'manager_id', 'medical_facility_available'];\n    public function disaster() { return \$this->belongsTo(Disaster::class); }\n    public function manager() { return \$this->belongsTo(User::class, 'manager_id'); }\n    public function citizens() { return \$this->hasMany(Citizen::class); }\n",
    'Citizen.php' => "    protected \$fillable = ['name', 'aadhaar_number', 'phone', 'family_size', 'camp_id', 'qr_code', 'priority'];\n    public function camp() { return \$this->belongsTo(Camp::class); }\n    public function familyMembers() { return \$this->hasMany(FamilyMember::class); }\n    public function distributions() { return \$this->hasMany(Distribution::class); }\n",
    'FamilyMember.php' => "    protected \$fillable = ['citizen_id', 'name', 'age', 'gender', 'medical_condition'];\n    public function citizen() { return \$this->belongsTo(Citizen::class); }\n",
    'Distribution.php' => "    protected \$fillable = ['citizen_id', 'inventory_item_id', 'quantity', 'distributed_by', 'distributed_at', 'location_coordinates', 'proof_image', 'status'];\n    public function citizen() { return \$this->belongsTo(Citizen::class); }\n    public function item() { return \$this->belongsTo(InventoryItem::class, 'inventory_item_id'); }\n    public function distributor() { return \$this->belongsTo(User::class, 'distributed_by'); }\n",
    'Volunteer.php' => "    protected \$fillable = ['user_id', 'skills', 'type', 'is_available', 'assigned_camp_id', 'location_coordinates'];\n    public function user() { return \$this->belongsTo(User::class); }\n    public function camp() { return \$this->belongsTo(Camp::class, 'assigned_camp_id'); }\n",
    'Donation.php' => "    protected \$fillable = ['donor_name', 'email', 'phone', 'type', 'amount', 'material_description', 'receipt_number', 'is_verified'];\n",
    'EmergencyRequest.php' => "    protected \$fillable = ['requester_name', 'phone', 'location', 'latitude', 'longitude', 'request_details', 'request_type', 'proof_image', 'status', 'priority'];\n",
    'Notification.php' => "    protected \$fillable = ['user_id', 'title', 'message', 'type', 'is_read'];\n    public function user() { return \$this->belongsTo(User::class); }\n",
    'ActivityLog.php' => "    protected \$fillable = ['user_id', 'action', 'module', 'details', 'ip_address'];\n    public function user() { return \$this->belongsTo(User::class); }\n",
];

foreach ($models as $filename => $additions) {
    $filePath = $dir . $filename;
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        // Remove the last '}' and append additions
        $content = preg_replace('/}(?!.*})/', $additions . "}\n", $content);
        file_put_contents($filePath, $content);
        echo "Updated $filename\n";
    }
}
