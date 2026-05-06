<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserva_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->constrained('reservas')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos_confiteria')->restrictOnDelete();
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_unitario', 8, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();

            $table->index(['reserva_id', 'producto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reserva_productos');
    }
};
