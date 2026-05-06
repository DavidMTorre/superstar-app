<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->constrained('reservas')->restrictOnDelete();
            $table->string('metodo_pago')->index();
            $table->string('estado')->default('pendiente')->index();
            $table->decimal('monto', 10, 2);
            $table->timestamp('fecha_pago')->nullable();
            $table->timestamps();

            $table->unique('reserva_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
