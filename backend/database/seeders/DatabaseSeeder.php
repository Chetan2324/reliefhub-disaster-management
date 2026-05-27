<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Roles
        $roles = [
            'Super Admin',
            'Disaster Management Officer',
            'Warehouse Manager',
            'Volunteer',
            'Transport Officer',
            'NGO Partner',
            'Citizen'
        ];

        foreach ($roles as $roleName) {
            \App\Models\Role::create([
                'name' => $roleName,
                'slug' => strtolower(str_replace(' ', '-', $roleName)),
            ]);
        }

        // Seed Admin User
        $adminRole = \App\Models\Role::where('slug', 'super-admin')->first();

        User::create([
            'name' => 'System Administrator',
            'email' => 'chetansharma32652@gmail.com',
            'password' => \Illuminate\Support\Facades\Hash::make('123'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $citizenRole = \App\Models\Role::where('slug', 'citizen')->first();
        User::create([
            'name' => 'Chetan Citizen',
            'email' => 'chetan123@gmail.com',
            'password' => \Illuminate\Support\Facades\Hash::make('123'),
            'role_id' => $citizenRole->id,
            'is_active' => true,
        ]);

        // Seed Default Disaster
        $disaster = \App\Models\Disaster::create([
            'name' => 'Operation Alpha Rescue',
            'type' => 'Flood',
            'severity' => 'High',
            'location' => 'Central District',
            'latitude' => 26.1445,
            'longitude' => 91.7362,
            'description' => 'Major flooding across the central river grid.',
            'status' => 'Active',
            'date_occurred' => now(),
        ]);

        // Seed 3 Camps
        \App\Models\Camp::insert([
            [
                'name' => 'Main City Relief Camp',
                'disaster_id' => $disaster->id,
                'location' => 'Downtown Square',
                'latitude' => 26.1445,
                'longitude' => 91.7362,
                'capacity' => 1000,
                'current_occupancy' => 850,
                'medical_facility_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Emergency Medical Base',
                'disaster_id' => $disaster->id,
                'location' => 'North Sector Hospital Grounds',
                'latitude' => 26.1550,
                'longitude' => 91.7450,
                'capacity' => 500,
                'current_occupancy' => 420,
                'medical_facility_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Community Shelter Alpha',
                'disaster_id' => $disaster->id,
                'location' => 'South River Bank High School',
                'latitude' => 26.1300,
                'longitude' => 91.7200,
                'capacity' => 800,
                'current_occupancy' => 300,
                'medical_facility_available' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
