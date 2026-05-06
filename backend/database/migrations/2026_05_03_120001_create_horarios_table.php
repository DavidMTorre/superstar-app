<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelicula_id')->constrained('peliculas')->restrictOnDelete();
            $table->foreignId('sala_id')->constrained('salas')->restrictOnDelete();
            $table->date('fecha');
            $table->time('hora');
            $table->string('estado')->default('disponible')->index();
            $table->timestamps();

            $table->unique(['sala_id', 'fecha', 'hora']);
            $table->index(['pelicula_id', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};
