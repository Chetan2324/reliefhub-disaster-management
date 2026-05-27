<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Distribution extends Model
{
    //
    protected $fillable = ['disaster_id', 'citizen_id', 'inventory_item_id', 'quantity', 'distributed_by', 'token', 'distributed_at', 'verified_at', 'delivered_at', 'location_coordinates', 'proof_image', 'status'];
    public function disaster() { return $this->belongsTo(Disaster::class); }
    public function citizen() { return $this->belongsTo(Citizen::class); }
    public function item() { return $this->belongsTo(InventoryItem::class, 'inventory_item_id'); }
    public function distributor() { return $this->belongsTo(User::class, 'distributed_by'); }
}

