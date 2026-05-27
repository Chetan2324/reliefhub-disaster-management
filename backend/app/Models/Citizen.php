<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    //
    protected $fillable = ['user_id', 'name', 'aadhaar_number', 'phone', 'family_size', 'camp_id', 'qr_code', 'priority'];

    public function user() { return $this->belongsTo(User::class); }
    public function camp() { return $this->belongsTo(Camp::class); }
    public function familyMembers() { return $this->hasMany(FamilyMember::class); }
    public function distributions() { return $this->hasMany(Distribution::class); }
}
