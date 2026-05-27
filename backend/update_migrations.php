<?php
$dir = __DIR__ . '/database/migrations/';
$files = scandir($dir);

// First rename roles and permissions so they run before users
foreach ($files as $file) {
    if (strpos($file, 'create_roles_table') !== false && strpos($file, '0000_00_00') === false) {
        rename($dir . $file, $dir . '0000_00_00_000000_create_roles_table.php');
    }
    if (strpos($file, 'create_permissions_table') !== false && strpos($file, '0000_00_00') === false) {
        rename($dir . $file, $dir . '0000_00_00_000001_create_permissions_table.php');
    }
}

$files = scandir($dir); // re-read

$schemas = [
    'roles' => "\$table->id();\n            \$table->string('name')->unique();\n            \$table->string('slug')->unique();\n            \$table->text('description')->nullable();\n            \$table->timestamps();",
    'permissions' => "\$table->id();\n            \$table->string('name')->unique();\n            \$table->string('slug')->unique();\n            \$table->timestamps();",
    'users' => "\$table->id();\n            \$table->string('name');\n            \$table->string('email')->unique();\n            \$table->timestamp('email_verified_at')->nullable();\n            \$table->string('password');\n            \$table->foreignId('role_id')->nullable()->constrained('roles')->nullOnDelete();\n            \$table->string('phone')->nullable();\n            \$table->boolean('is_active')->default(true);\n            \$table->rememberToken();\n            \$table->timestamps();\n            \$table->softDeletes();",
    'disasters' => "\$table->id();\n            \$table->string('name');\n            \$table->string('type');\n            \$table->enum('severity', ['Low', 'Medium', 'High', 'Critical']);\n            \$table->date('date_occurred')->nullable();\n            \$table->string('location');\n            \$table->decimal('latitude', 10, 8)->nullable();\n            \$table->decimal('longitude', 11, 8)->nullable();\n            \$table->integer('affected_population')->nullable();\n            \$table->text('description')->nullable();\n            \$table->enum('status', ['Active', 'Under Control', 'Critical', 'Resolved'])->default('Active');\n            \$table->timestamps();\n            \$table->softDeletes();",
    'warehouses' => "\$table->id();\n            \$table->string('name');\n            \$table->string('location');\n            \$table->decimal('latitude', 10, 8)->nullable();\n            \$table->decimal('longitude', 11, 8)->nullable();\n            \$table->integer('capacity')->comment('in standard units/boxes');\n            \$table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();\n            \$table->boolean('is_active')->default(true);\n            \$table->timestamps();",
    'inventory_items' => "\$table->id();\n            \$table->string('item_name');\n            \$table->string('category');\n            \$table->integer('quantity');\n            \$table->string('unit');\n            \$table->date('expiry_date')->nullable();\n            \$table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();\n            \$table->string('supplier')->nullable();\n            \$table->enum('status', ['Available', 'Low Stock', 'Out of Stock', 'Expired'])->default('Available');\n            \$table->string('qr_code')->nullable()->unique();\n            \$table->timestamps();\n            \$table->softDeletes();",
    'material_receipts' => "\$table->id();\n            \$table->string('receipt_no')->unique();\n            \$table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();\n            \$table->integer('quantity_received');\n            \$table->string('source')->comment('Donation, Govt, NGO, etc.');\n            \$table->string('supplier_name')->nullable();\n            \$table->dateTime('received_at');\n            \$table->foreignId('received_by')->constrained('users')->cascadeOnDelete();\n            \$table->string('invoice_image')->nullable();\n            \$table->enum('status', ['Pending Approval', 'Approved', 'Rejected'])->default('Pending Approval');\n            \$table->timestamps();",
    'transport_vehicles' => "\$table->id();\n            \$table->string('vehicle_number')->unique();\n            \$table->enum('vehicle_type', ['Truck', 'Ambulance', 'Boat', 'Helicopter', 'Van']);\n            \$table->integer('capacity');\n            \$table->string('status')->default('Available');\n            \$table->timestamps();",
    'dispatches' => "\$table->id();\n            \$table->string('dispatch_no')->unique();\n            \$table->foreignId('disaster_id')->constrained('disasters')->cascadeOnDelete();\n            \$table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();\n            \$table->foreignId('transport_vehicle_id')->nullable()->constrained('transport_vehicles')->nullOnDelete();\n            \$table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();\n            \$table->enum('status', ['Packed', 'Dispatched', 'In Transit', 'Delayed', 'Delivered'])->default('Packed');\n            \$table->dateTime('dispatch_time')->nullable();\n            \$table->dateTime('expected_delivery_time')->nullable();\n            \$table->dateTime('actual_delivery_time')->nullable();\n            \$table->text('route_status')->nullable();\n            \$table->timestamps();",
    'movement_trackings' => "\$table->id();\n            \$table->foreignId('dispatch_id')->constrained('dispatches')->cascadeOnDelete();\n            \$table->decimal('current_latitude', 10, 8);\n            \$table->decimal('current_longitude', 11, 8);\n            \$table->string('location_name');\n            \$table->string('status_update');\n            \$table->timestamps();",
    'camps' => "\$table->id();\n            \$table->string('name');\n            \$table->foreignId('disaster_id')->constrained('disasters')->cascadeOnDelete();\n            \$table->string('location');\n            \$table->decimal('latitude', 10, 8)->nullable();\n            \$table->decimal('longitude', 11, 8)->nullable();\n            \$table->integer('capacity');\n            \$table->integer('current_occupancy')->default(0);\n            \$table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();\n            \$table->boolean('medical_facility_available')->default(false);\n            \$table->timestamps();",
    'citizens' => "\$table->id();\n            \$table->string('name');\n            \$table->string('aadhaar_number')->unique();\n            \$table->string('phone')->nullable();\n            \$table->integer('family_size');\n            \$table->foreignId('camp_id')->nullable()->constrained('camps')->nullOnDelete();\n            \$table->string('qr_code')->unique()->nullable();\n            \$table->enum('priority', ['Normal', 'High', 'Critical'])->default('Normal');\n            \$table->timestamps();",
    'family_members' => "\$table->id();\n            \$table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();\n            \$table->string('name');\n            \$table->integer('age');\n            \$table->string('gender');\n            \$table->string('medical_condition')->nullable();\n            \$table->timestamps();",
    'distributions' => "\$table->id();\n            \$table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();\n            \$table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();\n            \$table->integer('quantity');\n            \$table->foreignId('distributed_by')->constrained('users')->cascadeOnDelete();\n            \$table->dateTime('distributed_at')->useCurrent();\n            \$table->string('location_coordinates')->nullable();\n            \$table->string('proof_image')->nullable();\n            \$table->enum('status', ['Pending', 'Approved', 'Delivered', 'Rejected'])->default('Delivered');\n            \$table->timestamps();",
    'volunteers' => "\$table->id();\n            \$table->foreignId('user_id')->constrained('users')->cascadeOnDelete();\n            \$table->string('skills')->nullable();\n            \$table->enum('type', ['Medical', 'Rescue', 'Logistics', 'Distribution', 'Transport']);\n            \$table->boolean('is_available')->default(true);\n            \$table->foreignId('assigned_camp_id')->nullable()->constrained('camps')->nullOnDelete();\n            \$table->string('location_coordinates')->nullable();\n            \$table->timestamps();",
    'donations' => "\$table->id();\n            \$table->string('donor_name');\n            \$table->string('email')->nullable();\n            \$table->string('phone')->nullable();\n            \$table->enum('type', ['Cash', 'Material']);\n            \$table->decimal('amount', 10, 2)->nullable();\n            \$table->string('material_description')->nullable();\n            \$table->string('receipt_number')->unique();\n            \$table->boolean('is_verified')->default(false);\n            \$table->timestamps();",
    'emergency_requests' => "\$table->id();\n            \$table->string('requester_name');\n            \$table->string('phone');\n            \$table->string('location');\n            \$table->decimal('latitude', 10, 8)->nullable();\n            \$table->decimal('longitude', 11, 8)->nullable();\n            \$table->text('request_details');\n            \$table->string('request_type');\n            \$table->string('proof_image')->nullable();\n            \$table->enum('status', ['Pending', 'In Progress', 'Resolved'])->default('Pending');\n            \$table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');\n            \$table->timestamps();",
    'notifications' => "\$table->id();\n            \$table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();\n            \$table->string('title');\n            \$table->text('message');\n            \$table->string('type');\n            \$table->boolean('is_read')->default(false);\n            \$table->timestamps();",
    'activity_logs' => "\$table->id();\n            \$table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();\n            \$table->string('action');\n            \$table->string('module');\n            \$table->text('details')->nullable();\n            \$table->string('ip_address')->nullable();\n            \$table->timestamps();",
];

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) !== 'php') continue;
    
    $filePath = $dir . $file;
    $content = file_get_contents($filePath);
    
    foreach ($schemas as $tableName => $schemaBody) {
        if (strpos($file, 'create_' . $tableName . '_table') !== false) {
            $pattern = '/Schema::create\(\'' . $tableName . '\', function \(Blueprint \$table\) \{(.*?)\}\);/s';
            $replacement = "Schema::create('" . $tableName . "', function (Blueprint \$table) {\n            " . $schemaBody . "\n        });";
            
            $newContent = preg_replace($pattern, $replacement, $content);
            if ($newContent !== null) {
                file_put_contents($filePath, $newContent);
                echo "Updated $tableName\n";
            }
            break;
        }
    }
}
