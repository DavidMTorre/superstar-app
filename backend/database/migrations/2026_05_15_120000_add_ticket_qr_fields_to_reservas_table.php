<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('reservas')) {
            return;
        }

        Schema::table('reservas', function (Blueprint $table): void {
            if (! Schema::hasColumn('reservas', 'token_qr')) {
                $table->string('token_qr')->nullable()->unique()->after('metadata');
            }
            if (! Schema::hasColumn('reservas', 'ticket_usado')) {
                $table->boolean('ticket_usado')->default(false)->after('token_qr');
            }
            if (! Schema::hasColumn('reservas', 'hora_ingreso')) {
                $table->timestamp('hora_ingreso')->nullable()->after('ticket_usado');
            }
        });

        if (Schema::hasColumn('reservas', 'token_qr') && Schema::hasTable('pagos')) {
            $pagos = DB::table('pagos')->whereNotNull('codigo_ticket_qr')->get(['reserva_id', 'codigo_ticket_qr']);
            foreach ($pagos as $pago) {
                DB::table('reservas')
                    ->where('id', $pago->reserva_id)
                    ->whereNull('token_qr')
                    ->update(['token_qr' => $pago->codigo_ticket_qr]);
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('reservas')) {
            return;
        }

        Schema::table('reservas', function (Blueprint $table): void {
            if (Schema::hasColumn('reservas', 'hora_ingreso')) {
                $table->dropColumn('hora_ingreso');
            }
            if (Schema::hasColumn('reservas', 'ticket_usado')) {
                $table->dropColumn('ticket_usado');
            }
            if (Schema::hasColumn('reservas', 'token_qr')) {
                $table->dropUnique(['token_qr']);
                $table->dropColumn('token_qr');
            }
        });
    }
};
