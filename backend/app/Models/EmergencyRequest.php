<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyRequest extends Model
{
    //
    protected $fillable = ['user_id', 'requester_name', 'phone', 'location', 'latitude', 'longitude', 'request_details', 'request_type', 'proof_image', 'status', 'priority'];
    
    public function user() {
        return $this->belongsTo(User::class);
    }
}

