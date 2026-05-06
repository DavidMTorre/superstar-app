<?php

namespace Tests\Feature\Api\V1\Pagos;

use App\Models\Pelicula;
use App\Models\Pago;
use App\Models\Reserva;
use App\Models\Sala;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class RealizarPagoApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-06-01 10:00:00'));
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
            'tiempo_limpieza' => 15,
        ]);

        return Reserva::query()->create([
            'codigo_reserva' => (string) Str::uuid(),
            'user_id' => null,
            'guest_id' => 'guest_prueba',
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => now()->addDay()->format('Y-m-d'),
            'hora_inicio' => '18:30:00',
            'hora_fin' => '20:45:00',
            'cantidad_personas' => 2,
            'precio_total' => number_format((float) $sala->precio, 2, '.', ''),
            'estado' => 'reservado',
            'metadata' => [
                'pago_estado' => 'pendiente',
            ],
        ]);
    }

    public function test_pago_exitoso(): void
    {
        $reserva = $this->crearReservaActiva();

        $response = $this->postJson('/api/v1/pagos', [
            'codigo_reserva' => $reserva->codigo_reserva,
            'metodo_pago' => 'yape',
            'monto' => 45.5,
        ]);

        $response->assertCreated()
            ->assertJson([
                'exito' => true,
                'mensaje' => 'Pago procesado correctamente',
            ])
            ->assertJsonStructure([
                'datos' => [
                    'pago' => ['id', 'reserva_id', 'metodo_pago', 'estado', 'monto', 'fecha_pago'],
                    'ticket' => ['codigo_qr'],
                ],
            ]);

        $this->assertSame('pagado', $response->json('datos.pago.estado'));
        $this->assertSame('yape', $response->json('datos.pago.metodo_pago'));
        $this->assertSame(45.5, $response->json('datos.pago.monto'));
        $this->assertNotEmpty($response->json('datos.ticket.codigo_qr'));

        $codigoTicket = $response->json('datos.ticket.codigo_qr');

        $this->assertDatabaseHas('pagos', [
            'reserva_id' => $reserva->id,
            'metodo_pago' => 'yape',
            'estado' => 'pagado',
            'codigo_ticket_qr' => $codigoTicket,
        ]);

        $reserva->refresh();
        $this->assertSame('pagado', $reserva->metadata['pago_estado']);
    }

    public function test_reserva_inexistente(): void
    {
        $codigoInexistente = '01995e99-bec7-74da-a32e-cf8f9f9f9f9f';

        $response = $this->postJson('/api/v1/pagos', [
            'codigo_reserva' => $codigoInexistente,
            'metodo_pago' => 'efectivo',
            'monto' => 10,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Error de validación',
            ])
            ->assertJsonPath('errores.codigo_reserva.0', 'No existe una reserva con el código indicado.');
    }

    public function test_pago_duplicado(): void
    {
        $reserva = $this->crearReservaActiva();

        Pago::query()->create([
            'reserva_id' => $reserva->id,
            'metodo_pago' => 'plin',
            'estado' => 'pagado',
            'monto' => '20.00',
            'fecha_pago' => now(),
        ]);

        $response = $this->postJson('/api/v1/pagos', [
            'codigo_reserva' => $reserva->codigo_reserva,
            'metodo_pago' => 'tarjeta',
            'monto' => 30,
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'Esta reserva ya tiene un pago registrado.',
            ]);
    }

    public function test_metodo_invalido(): void
    {
        $reserva = $this->crearReservaActiva();

        $response = $this->postJson('/api/v1/pagos', [
            'codigo_reserva' => $reserva->codigo_reserva,
            'metodo_pago' => 'bitcoin',
            'monto' => 10,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Error de validación',
            ])
            ->assertJsonPath('errores.metodo_pago.0', 'El método de pago debe ser: yape, plin, tarjeta o efectivo.');
    }
}
