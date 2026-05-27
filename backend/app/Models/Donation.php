<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    //
    protected $fillable = ['donor_name', 'email', 'phone', 'type', 'amount', 'material_description', 'receipt_number', 'is_verified'];
}

