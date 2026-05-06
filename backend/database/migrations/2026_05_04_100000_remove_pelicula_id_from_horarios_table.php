<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('horarios', 'pelicula_id')) {
            return;
        }

        Schema::table('horarios', function (Blueprint $table) {
            $table->dropForeign(['pelicula_id']);
        });

        Schema::table('horarios', function (Blueprint $table) {
            $table->dropIndex(['pelicula_id', 'fecha']);
        });

        Schema::table('horarios', function (Blueprint $table) {
            $table->dropColumn('pelicula_id');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('horarios', 'pelicula_id')) {
            return;
        }

        Schema::table('horarios', function (Blueprint $table) {
            $table->foreignId('pelicula_id')->after('id')->constrained('peliculas')->restrictOnDelete();
            $table->index(['pelicula_id', 'fecha']);
        });
    }
};
