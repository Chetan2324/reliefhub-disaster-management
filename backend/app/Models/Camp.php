<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Camp extends Model
{
    //
    protected $fillable = ['name', 'disaster_id', 'location', 'latitude', 'longitude', 'capacity', 'current_occupancy', 'manager_id', 'medical_facility_available'];
    public function disaster() { return $this->belongsTo(Disaster::class); }
    public function manager() { return $this->belongsTo(User::class, 'manager_id'); }
    public function citizens() { return $this->hasMany(Citizen::class); }
}

