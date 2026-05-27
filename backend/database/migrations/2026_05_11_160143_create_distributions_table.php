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
        Schema::create('distributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disaster_id')->nullable()->constrained('disasters')->cascadeOnDelete();
            $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->integer('quantity');
            $table->foreignId('distributed_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('token')->unique()->nullable();
            $table->dateTime('distributed_at')->useCurrent();
            $table->dateTime('verified_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->string('location_coordinates')->nullable();
            $table->string('proof_image')->nullable();
            $table->enum('status', ['Pending', 'Verified', 'Delivered', 'Failed'])->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distributions');
    }
};
