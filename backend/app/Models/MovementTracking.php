<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovementTracking extends Model
{
    //
    protected $fillable = ['dispatch_id', 'current_latitude', 'current_longitude', 'location_name', 'status_update'];
    public function dispatch() { return $this->belongsTo(Dispatch::class); }
}

