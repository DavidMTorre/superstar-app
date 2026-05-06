<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salas', function (Blueprint $table) {
            $table->time('hora_apertura')->default('08:00:00')->after('tiempo_limpieza');
            $table->time('hora_cierre')->default('22:00:00')->after('hora_apertura');
        });
    }

    public function down(): void
    {
        Schema::table('salas', function (Blueprint $table) {
            $table->dropColumn(['hora_apertura', 'hora_cierre']);
        });
    }
};
