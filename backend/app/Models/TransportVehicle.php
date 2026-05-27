<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransportVehicle extends Model
{
    //
    protected $fillable = ['vehicle_number', 'vehicle_type', 'capacity', 'status'];
    public function dispatches() { return $this->hasMany(Dispatch::class); }
}

