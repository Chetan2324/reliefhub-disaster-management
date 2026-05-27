<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispatch extends Model
{
    //
    protected $fillable = ['dispatch_no', 'disaster_id', 'warehouse_id', 'transport_vehicle_id', 'driver_id', 'status', 'dispatch_time', 'expected_delivery_time', 'actual_delivery_time', 'route_status'];
    public function disaster() { return $this->belongsTo(Disaster::class); }
    public function warehouse() { return $this->belongsTo(Warehouse::class); }
    public function vehicle() { return $this->belongsTo(TransportVehicle::class, 'transport_vehicle_id'); }
    public function driver() { return $this->belongsTo(User::class, 'driver_id'); }
    public function trackings() { return $this->hasMany(MovementTracking::class); }
}

