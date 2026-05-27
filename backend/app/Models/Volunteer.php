<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Volunteer extends Model
{
    //
    protected $fillable = ['user_id', 'skills', 'type', 'is_available', 'assigned_camp_id', 'location_coordinates'];
    public function user() { return $this->belongsTo(User::class); }
    public function camp() { return $this->belongsTo(Camp::class, 'assigned_camp_id'); }
}

