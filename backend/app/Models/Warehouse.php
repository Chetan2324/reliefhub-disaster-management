<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    //
    protected $fillable = ['name', 'location', 'latitude', 'longitude', 'capacity', 'manager_id', 'is_active'];
    public function manager() { return $this->belongsTo(User::class, 'manager_id'); }
    public function inventoryItems() { return $this->hasMany(InventoryItem::class); }
}

