<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add a Disaster
        $disaster = \App\Models\Disaster::create([
            'name' => 'Assam Floods 2026',
            'type' => 'Flood',
            'severity' => 'Critical',
            'date_occurred' => '2026-05-01',
            'location' => 'Guwahati, Assam',
            'latitude' => 26.1445,
            'longitude' => 91.7362,
            'affected_population' => 150000,
            'description' => 'Severe flooding due to continuous heavy rainfall.',
            'status' => 'Active',
        ]);

        // Add a Warehouse Manager
        $warehouseManagerRole = \App\Models\Role::where('slug', 'warehouse-manager')->first();
        $manager = \App\Models\User::create([
            'name' => 'John Warehouse Manager',
            'email' => 'manager@disasterrelief.com',
            'password' => \Illuminate\Support\Facades\Hash::make('Password@123'),
            'role_id' => $warehouseManagerRole->id,
        ]);

        // Add a Warehouse
        $warehouse = \App\Models\Warehouse::create([
            'name' => 'Central Relief Hub - Guwahati',
            'location' => 'Dispur, Assam',
            'capacity' => 100000,
            'manager_id' => $manager->id,
        ]);

        // Add Inventory Items
        \App\Models\InventoryItem::create([
            'item_name' => 'Rice Bags (50kg)',
            'category' => 'Food',
            'quantity' => 5000,
            'unit' => 'Bags',
            'warehouse_id' => $warehouse->id,
            'status' => 'Available',
        ]);

        \App\Models\InventoryItem::create([
            'item_name' => 'Medical Kits Type A',
            'category' => 'Medicines',
            'quantity' => 2000,
            'unit' => 'Kits',
            'warehouse_id' => $warehouse->id,
            'status' => 'Available',
        ]);

        // Add Camps
        $camp = \App\Models\Camp::create([
            'name' => 'Main City Relief Camp',
            'disaster_id' => $disaster->id,
            'location' => 'Govt School Ground, Dispur',
            'latitude' => 26.1433,
            'longitude' => 91.7898,
            'capacity' => 500,
            'current_occupancy' => 450, // High occupancy
            'manager_id' => $manager->id,
            'medical_facility_available' => true,
        ]);

        \App\Models\Camp::create([
            'name' => 'Secondary Outpost Beta',
            'disaster_id' => $disaster->id,
            'location' => 'Community Center, Sector 5',
            'latitude' => 26.1522,
            'longitude' => 91.7611,
            'capacity' => 200,
            'current_occupancy' => 50, // Low occupancy
            'manager_id' => $manager->id,
            'medical_facility_available' => false,
        ]);

        // Add a Citizen User and Profile
        $citizenRole = \App\Models\Role::where('slug', 'citizen')->first();
        $citizenUser = \App\Models\User::create([
            'name' => 'Chetan',
            'email' => 'chetan123@gmail.com',
            'password' => \Illuminate\Support\Facades\Hash::make('123'),
            'role_id' => $citizenRole->id,
        ]);

        $citizen = \App\Models\Citizen::create([
            'user_id' => $citizenUser->id,
            'name' => 'Chetan',
            'aadhaar_number' => '123456789012',
            'phone' => '9876543210',
            'family_size' => 4,
            'camp_id' => $camp->id,
            'priority' => 'High',
        ]);

        // Add Emergency Requests (Alerts)
        \App\Models\EmergencyRequest::create([
            'requester_name' => 'Amit Kumar',
            'phone' => '9876543211',
            'location' => 'Sector 4, Guwahati',
            'latitude' => 26.1500,
            'longitude' => 91.7500,
            'request_details' => 'Medical assistance required immediately for 2 injured individuals.',
            'request_type' => 'Medical',
            'status' => 'Pending',
            'priority' => 'Critical',
        ]);

        \App\Models\EmergencyRequest::create([
            'requester_name' => 'Sunita Devi',
            'phone' => '9876543212',
            'location' => 'Dispur, Flood Zone B',
            'latitude' => 26.1400,
            'longitude' => 91.7600,
            'request_details' => 'Trapped in home, water level rising rapidly. Need evacuation.',
            'request_type' => 'Evacuation',
            'status' => 'Pending',
            'priority' => 'High',
        ]);

        // Add Activity Logs (Live Feed)
        \App\Models\ActivityLog::create([
            'user_id' => $manager->id,
            'action' => 'Medical Kits Type A dispatched to Camp Alpha',
            'module' => 'dispatch',
            'ip_address' => '127.0.0.1'
        ]);

        \App\Models\ActivityLog::create([
            'user_id' => null,
            'action' => 'Emergency Alert triggered in Sector 4',
            'module' => 'emergency',
            'ip_address' => '127.0.0.1'
        ]);

        \App\Models\ActivityLog::create([
            'user_id' => $manager->id,
            'action' => 'New volunteer team registered in Kamrup',
            'module' => 'volunteer',
            'ip_address' => '127.0.0.1'
        ]);
    }
}
