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
        Schema::create('citizens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('aadhaar_number')->unique();
            $table->string('phone')->nullable();
            $table->integer('family_size');
            $table->foreignId('camp_id')->nullable()->constrained('camps')->nullOnDelete();
            $table->string('qr_code')->unique()->nullable();
            $table->enum('priority', ['Normal', 'High', 'Critical'])->default('Normal');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizens');
    }
};
