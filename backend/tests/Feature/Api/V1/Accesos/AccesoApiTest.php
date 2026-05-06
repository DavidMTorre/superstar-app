<?php

namespace Tests\Feature\Api\V1\Accesos;

use App\Models\Pelicula;
use App\Models\Pago;
use App\Models\Reserva;
use App\Models\Sala;
use App\Support\TicketQr;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AccesoApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-07-01 14:00:00'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function crearReservaActiva(): Reserva
    {
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible']);
        $sala = Sala::factory()->create([
            'precio' => 25.00,
            'tiempo_limpieza' => 15,
        ]);

        return Reserva::query()->create([
            'codigo_reserva' => (string) Str::uuid(),
            'user_id' => null,
            'guest_id' => 'guest_acceso',
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => now()->addDay()->format('Y-m-d'),
            'hora_inicio' => '19:00:00',
            'hora_fin' => '21:30:00',
            'cantidad_personas' => 2,
            'precio_total' => number_format((float) $sala->precio, 2, '.', ''),
            'estado' => 'reservado',
            'metadata' => [
                'pago_estado' => 'pendiente',
            ],
        ]);
    }

    private function obtenerCodigoQrPagado(Reserva $reserva): string
    {
        $this->postJson('/api/v1/pagos', [
            'codigo_reserva' => $reserva->codigo_reserva,
            'metodo_pago' => 'yape',
            'monto' => 30,
        ])->assertCreated();

        $reserva->refresh();

        return (string) $reserva->pago?->codigo_ticket_qr;
    }

    public function test_acceso_valido(): void
    {
        $reserva = $this->crearReservaActiva();
        $codigoQr = $this->obtenerCodigoQrPagado($reserva);

        $this->assertNotSame('', $codigoQr);

        $response = $this->postJson('/api/v1/accesos/validar', [
            'codigo_qr' => $codigoQr,
        ]);

        $response->assertOk()
            ->assertExactJson([
                'exito' => true,
                'mensaje' => 'Acceso permitido',
            ]);

        $reserva->refresh();
        $this->assertSame('utilizada', $reserva->estado);
        $this->assertNotNull($reserva->fecha_uso_acceso);
    }

    public function test_qr_invalido(): void
    {
        $response = $this->postJson('/api/v1/accesos/validar', [
            'codigo_qr' => 'cadena_que_no_existe_en_base_de_datos_xxxxx',
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'QR inválido.',
            ]);
    }

    public function test_acceso_duplicado(): void
    {
        $reserva = $this->crearReservaActiva();
        $codigoQr = $this->obtenerCodigoQrPagado($reserva);

        $this->postJson('/api/v1/accesos/validar', [
            'codigo_qr' => $codigoQr,
        ])->assertOk();

        $segundo = $this->postJson('/api/v1/accesos/validar', [
            'codigo_qr' => $codigoQr,
        ]);

        $segundo->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'Este ticket ya fue utilizado.',
            ]);
    }

    public function test_reserva_no_pagada(): void
    {
        $reserva = $this->crearReservaActiva();
        $codigoQr = TicketQr::generar($reserva);

        Pago::query()->create([
            'reserva_id' => $reserva->id,
            'metodo_pago' => 'efectivo',
            'estado' => 'pendiente',
            'monto' => '15.00',
            'fecha_pago' => null,
            'codigo_ticket_qr' => $codigoQr,
        ]);

        $response = $this->postJson('/api/v1/accesos/validar', [
            'codigo_qr' => $codigoQr,
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'La reserva no está pagada.',
            ]);
    }
}
