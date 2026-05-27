<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    //
    protected $fillable = ['item_name', 'category', 'quantity', 'unit', 'expiry_date', 'warehouse_id', 'supplier', 'status', 'qr_code'];
    public function warehouse() { return $this->belongsTo(Warehouse::class); }
}

