<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Disaster extends Model
{
    //
    protected $fillable = ['name', 'type', 'severity', 'date_occurred', 'location', 'latitude', 'longitude', 'affected_population', 'description', 'status'];
    public function camps() { return $this->hasMany(Camp::class); }
    public function dispatches() { return $this->hasMany(Dispatch::class); }
}

