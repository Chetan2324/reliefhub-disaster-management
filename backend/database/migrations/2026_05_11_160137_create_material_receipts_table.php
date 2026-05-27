<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('material_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_no')->unique();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->integer('quantity_received');
            $table->string('source')->comment('Donation, Govt, NGO, etc.');
            $table->string('supplier_name')->nullable();
            $table->dateTime('received_at');
            $table->foreignId('received_by')->constrained('users')->cascadeOnDelete();
            $table->string('invoice_image')->nullable();
            $table->enum('status', ['Pending Approval', 'Approved', 'Rejected'])->default('Pending Approval');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_receipts');
    }
};
