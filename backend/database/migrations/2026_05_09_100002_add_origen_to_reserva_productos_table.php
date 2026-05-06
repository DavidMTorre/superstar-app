<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('reserva_productos')) {
            return;
        }

        if (Schema::hasColumn('reserva_productos', 'origen')) {
            return;
        }

        Schema::table('reserva_productos', function (Blueprint $table): void {
            $table->string('origen', 20)->default('directo')->after('subtotal');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('reserva_productos') || ! Schema::hasColumn('reserva_productos', 'origen')) {
            return;
        }

        Schema::table('reserva_productos', function (Blueprint $table): void {
            $table->dropColumn('origen');
        });
    }
};
