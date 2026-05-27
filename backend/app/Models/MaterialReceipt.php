<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialReceipt extends Model
{
    //
    protected $fillable = ['receipt_no', 'inventory_item_id', 'quantity_received', 'source', 'supplier_name', 'received_at', 'received_by', 'invoice_image', 'status'];
    public function item() { return $this->belongsTo(InventoryItem::class, 'inventory_item_id'); }
    public function receiver() { return $this->belongsTo(User::class, 'received_by'); }
}

