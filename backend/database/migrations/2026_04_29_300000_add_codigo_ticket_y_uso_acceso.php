<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pagos', function (Blueprint $table) {
            $table->string('codigo_ticket_qr')->nullable()->unique();
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->timestamp('fecha_uso_acceso')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn('fecha_uso_acceso');
        });

        Schema::table('pagos', function (Blueprint $table) {
            $table->dropUnique(['codigo_ticket_qr']);
            $table->dropColumn('codigo_ticket_qr');
        });
    }
};
