<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sala_horarios', function (Blueprint $table) {
            $table->boolean('activo')->default(true)->after('hora_cierre');
        });
    }

    public function down(): void
    {
        Schema::table('sala_horarios', function (Blueprint $table) {
            $table->dropColumn('activo');
        });
    }
};
