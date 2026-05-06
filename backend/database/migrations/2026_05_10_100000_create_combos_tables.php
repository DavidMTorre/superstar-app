<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('combos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->decimal('precio', 8, 2);
            $table->enum('estado', ['disponible', 'agotado'])->default('disponible');
            $table->timestamps();
        });

        Schema::create('combo_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('combo_id')->constrained('combos')->cascadeOnDelete();
            $table->foreignId('producto_confiteria_id')->constrained('productos_confiteria')->cascadeOnDelete();
            $table->unsignedInteger('cantidad');
            $table->unique(['combo_id', 'producto_confiteria_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_productos');
        Schema::dropIfExists('combos');
    }
};
