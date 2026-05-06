<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('reservas', 'horario_id')) {
            return;
        }

        DB::table('pagos')->delete();
        DB::table('reservas')->delete();

        if (Schema::hasColumn('reservas', 'fecha_funcion')) {
            Schema::table('reservas', function (Blueprint $table) {
                $table->index('pelicula_id');
            });

            Schema::table('reservas', function (Blueprint $table) {
                $table->dropIndex(['pelicula_id', 'fecha_funcion']);
            });

            Schema::table('reservas', function (Blueprint $table) {
                $table->dropColumn(['fecha_funcion', 'hora_funcion']);
            });
        }

        Schema::table('reservas', function (Blueprint $table) {
            $table->foreignId('horario_id')->after('pelicula_id')->unique()->constrained('horarios')->restrictOnDelete();
            $table->decimal('precio_total', 10, 2)->default('10.00')->after('cantidad_personas');
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->index(['pelicula_id', 'horario_id']);
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('reservas', 'horario_id')) {
            return;
        }

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex(['pelicula_id', 'horario_id']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropForeign(['horario_id']);
            $table->dropColumn(['horario_id', 'precio_total']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->date('fecha_funcion');
            $table->time('hora_funcion');
            $table->index(['pelicula_id', 'fecha_funcion']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex(['pelicula_id']);
        });
    }
};
