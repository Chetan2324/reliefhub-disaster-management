<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    //
    protected $fillable = ['citizen_id', 'name', 'age', 'gender', 'medical_condition'];
    public function citizen() { return $this->belongsTo(Citizen::class); }
}

