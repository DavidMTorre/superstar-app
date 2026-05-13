<?php

namespace Tests\Feature\Api\V1\Tickets;

use App\Models\Pelicula;
use App\Models\Pago;
use App\Models\ProductoConfiteria;
use App\Models\Reserva;
use App\Models\ReservaProducto;
use App\Models\Sala;
use App\Models\User;
use App\Support\TicketQr;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-07-01 14:00:00'));
        config(['app.frontend_url' => 'http://localhost:5173']);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /**
     * @return array{reserva: Reserva, token: string}
     */
    private function crearReservaPagada(bool $conUsuario = false): array
    {
        $usuario = $conUsuario
            ? User::factory()->create(['name' => 'Juan Perez'])
            : null;

        $pelicula = Pelicula::factory()->create([
            'titulo' => 'Batman',
            'imagen_url' => 'https://cdn.example/poster.jpg',
            'estado' => 'disponible',
        ]);
        $sala = Sala::factory()->create(['nombre' => 'VIP 1']);

        $reserva = Reserva::query()->create([
            'codigo_reserva' => 'RES-TKT-'.Str::upper(Str::random(6)),
            'user_id' => $usuario?->id,
            'guest_id' => $usuario === null ? 'guest_x' : null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-07-10',
            'hora_inicio' => '19:00:00',
            'hora_fin' => '21:30:00',
            'cantidad_personas' => 2,
            'precio_total' => '40.00',
            'estado' => 'reservado',
            'metadata' => ['pago_estado' => 'pendiente'],
        ]);

        $codigoQr = TicketQr::generar($reserva);

        Pago::query()->create([
            'reserva_id' => $reserva->id,
            'metodo_pago' => 'yape',
            'estado' => 'pagado',
            'monto' => '55.00',
            'fecha_pago' => now(),
            'codigo_ticket_qr' => $codigoQr,
        ]);

        $reserva->refresh();
        $reserva->token_qr = $codigoQr;
        $reserva->metadata = array_merge($reserva->metadata ?? [], ['pago_estado' => 'pagado']);
        $reserva->save();

        $prod = ProductoConfiteria::query()->create([
            'nombre' => 'Canchita',
            'precio' => 5.00,
            'estado' => 'disponible',
        ]);

        ReservaProducto::query()->create([
            'reserva_id' => $reserva->id,
            'producto_id' => $prod->id,
            'cantidad' => 1,
            'precio_unitario' => '5.00',
            'subtotal' => '5.00',
            'origen' => 'directo',
        ]);

        return ['reserva' => $reserva->fresh(), 'token' => $codigoQr];
    }

    public function test_get_ticket_publico_404(): void
    {
        $response = $this->getJson('/api/v1/tickets/token-inexistente-xxxxx');

        $response->assertNotFound()
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Ticket no encontrado',
            ]);
    }

    public function test_get_ticket_publico_ok(): void
    {
        ['token' => $token] = $this->crearReservaPagada(true);

        $response = $this->getJson('/api/v1/tickets/'.rawurlencode($token));

        $response->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonPath('datos.pelicula', 'Batman')
            ->assertJsonPath('datos.sala', 'VIP 1')
            ->assertJsonPath('datos.asientos', 2)
            ->assertJsonPath('datos.token_qr', $token);

        $qr = $response->json('datos.qr_imagen');
        $this->assertIsString($qr);
        $this->assertStringStartsWith('data:image/', $qr);
    }

    public function test_generar_qr_en_respuesta_pago(): void
    {
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible']);
        $sala = Sala::factory()->create();

        $reserva = Reserva::query()->create([
            'codigo_reserva' => (string) Str::uuid(),
            'user_id' => null,
            'guest_id' => 'guest_pago_qr',
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => now()->addDay()->format('Y-m-d'),
            'hora_inicio' => '18:30:00',
            'hora_fin' => '20:45:00',
            'cantidad_personas' => 2,
            'precio_total' => number_format((float) $sala->precio, 2, '.', ''),
            'estado' => 'reservado',
            'metadata' => ['pago_estado' => 'pendiente'],
        ]);

        $response = $this->postJson('/api/v1/pagos', [
            'codigo_reserva' => $reserva->codigo_reserva,
            'metodo_pago' => 'yape',
            'monto' => 45.5,
        ]);

        $response->assertCreated();
        $qr = $response->json('datos.ticket.qr_imagen');
        $this->assertIsString($qr);
        $this->assertStringStartsWith('data:image/', $qr);
        $this->assertSame($response->json('datos.ticket.codigo_qr'), $response->json('datos.ticket.token_qr'));
    }

    public function test_validar_ticket_sin_autenticacion(): void
    {
        $response = $this->postJson('/api/v1/tickets/validar', [
            'token_qr' => 'algo-token-de-prueba',
        ]);

        $response->assertUnauthorized();
    }

    public function test_validar_ticket_no_admin(): void
    {
        $usuario = User::factory()->create(['rol' => 'cliente']);
        Sanctum::actingAs($usuario);

        $response = $this->postJson('/api/v1/tickets/validar', [
            'token_qr' => 'algo-token-de-prueba',
        ]);

        $response->assertForbidden();
    }

    public function test_validar_ticket_autorizado(): void
    {
        ['token' => $token] = $this->crearReservaPagada(true);
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/tickets/validar', [
            'token_qr' => $token,
        ]);

        $response->assertOk()
            ->assertExactJson([
                'exito' => true,
                'mensaje' => 'Acceso autorizado',
                'datos' => [
                    'pelicula' => 'Batman',
                    'sala' => 'VIP 1',
                    'hora' => '19:00',
                    'cliente' => 'Juan Perez',
                ],
            ]);

        $reserva = Reserva::query()->where('token_qr', $token)->first();
        $this->assertNotNull($reserva);
        $this->assertTrue((bool) $reserva->ticket_usado);
        $this->assertNotNull($reserva->hora_ingreso);
    }

    public function test_validar_ticket_ya_usado(): void
    {
        ['token' => $token] = $this->crearReservaPagada(false);
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/tickets/validar', ['token_qr' => $token])->assertOk();

        $segundo = $this->postJson('/api/v1/tickets/validar', ['token_qr' => $token]);

        $segundo->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'Ticket ya utilizado',
                'datos' => null,
            ]);
    }

    public function test_validar_ticket_invalido(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/tickets/validar', [
            'token_qr' => 'token_no_existe_en_absoluto_xxxxx',
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'Ticket inválido',
                'datos' => null,
            ]);
    }

    public function test_validar_ticket_expirado(): void
    {
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible']);
        $sala = Sala::factory()->create();

        $reserva = Reserva::query()->create([
            'codigo_reserva' => 'RES-EXP',
            'user_id' => null,
            'guest_id' => 'guest_exp',
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-07-01',
            'hora_inicio' => '10:00:00',
            'hora_fin' => '12:00:00',
            'cantidad_personas' => 1,
            'precio_total' => '15.00',
            'estado' => 'reservado',
            'metadata' => ['pago_estado' => 'pagado'],
        ]);

        $codigoQr = TicketQr::generar($reserva);

        Pago::query()->create([
            'reserva_id' => $reserva->id,
            'metodo_pago' => 'efectivo',
            'estado' => 'pagado',
            'monto' => '15.00',
            'fecha_pago' => now(),
            'codigo_ticket_qr' => $codigoQr,
        ]);

        $reserva->refresh();
        $reserva->token_qr = $codigoQr;
        $reserva->save();

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/tickets/validar', [
            'token_qr' => $codigoQr,
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'La función ya finalizó',
                'datos' => null,
            ]);
    }

    public function test_endpoint_ver_ticket_detalle(): void
    {
        ['token' => $token, 'reserva' => $reserva] = $this->crearReservaPagada(true);

        $response = $this->getJson('/api/v1/tickets/'.rawurlencode($token));

        $response->assertOk()
            ->assertJsonPath('datos.codigo_reserva', $reserva->codigo_reserva)
            ->assertJsonPath('datos.total', 55);
    }
}
