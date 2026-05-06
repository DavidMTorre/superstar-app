<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('pagos')->delete();
        DB::table('reservas')->delete();

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex(['pelicula_id', 'horario_id']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropForeign(['horario_id']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropUnique(['horario_id']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn('horario_id');
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->foreignId('sala_id')->after('pelicula_id')->constrained('salas')->restrictOnDelete();
            $table->date('fecha')->after('sala_id');
            $table->time('hora_inicio')->after('fecha');
            $table->time('hora_fin')->after('hora_inicio');
            $table->index(['sala_id', 'fecha']);
        });

        if (! Schema::hasColumn('salas', 'tiempo_limpieza')) {
            Schema::table('salas', function (Blueprint $table) {
                $table->integer('tiempo_limpieza')->default(15)->after('precio');
            });
        }

        Schema::dropIfExists('horarios');
    }

    public function down(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained('salas')->restrictOnDelete();
            $table->date('fecha');
            $table->time('hora');
            $table->string('estado')->default('disponible')->index();
            $table->timestamps();
            $table->unique(['sala_id', 'fecha', 'hora']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropForeign(['sala_id']);
            $table->dropIndex(['sala_id', 'fecha']);
            $table->dropColumn(['sala_id', 'fecha', 'hora_inicio', 'hora_fin']);
            $table->foreignId('horario_id')->after('pelicula_id')->unique()->constrained('horarios')->restrictOnDelete();
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->index(['pelicula_id', 'horario_id']);
        });

        if (Schema::hasColumn('salas', 'tiempo_limpieza')) {
            Schema::table('salas', function (Blueprint $table) {
                $table->dropColumn('tiempo_limpieza');
            });
        }
    }
};
