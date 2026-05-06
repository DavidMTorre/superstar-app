<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->uuid('codigo_reserva')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_id')->nullable()->index();
            $table->foreignId('pelicula_id')->constrained('peliculas')->restrictOnDelete();
            $table->date('fecha_funcion');
            $table->time('hora_funcion');
            $table->unsignedTinyInteger('cantidad_personas');
            $table->string('estado')->default('reservado')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['pelicula_id', 'fecha_funcion']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
