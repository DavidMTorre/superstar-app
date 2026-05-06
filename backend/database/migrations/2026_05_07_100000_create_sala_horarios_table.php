<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sala_horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained('salas')->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana');
            $table->time('hora_apertura');
            $table->time('hora_cierre');
            $table->timestamps();

            $table->unique(['sala_id', 'dia_semana']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sala_horarios');
    }
};
