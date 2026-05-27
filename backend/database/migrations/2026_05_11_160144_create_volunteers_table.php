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
        Schema::create('volunteers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('skills')->nullable();
            $table->enum('type', ['Medical', 'Rescue', 'Logistics', 'Distribution', 'Transport']);
            $table->boolean('is_available')->default(true);
            $table->foreignId('assigned_camp_id')->nullable()->constrained('camps')->nullOnDelete();
            $table->string('location_coordinates')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('volunteers');
    }
};
