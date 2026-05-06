<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catálogo de películas. `metadata` reserva extensión futura (recomendaciones, scores, tags).
     */
    public function up(): void
    {
        Schema::create('peliculas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('categoria')->index();
            $table->unsignedSmallInteger('duracion');
            $table->string('imagen_url')->nullable();
            $table->string('estado')->default('disponible')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['estado', 'categoria']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peliculas');
    }
};
