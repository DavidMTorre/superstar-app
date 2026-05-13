<?php

namespace Tests\Feature\Api\V1\Perfil;

use App\Models\Pelicula;
use App\Models\ProductoConfiteria;
use App\Models\Reserva;
use App\Models\ReservaProducto;
use App\Models\Sala;
use App\Models\User;
use App\Support\TicketQr;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PerfilApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-06-15 14:00:00'));
        Config::set('app.frontend_url', 'http://localhost:5173');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_obtener_perfil_autenticado(): void
    {
        $usuario = User::factory()->create([
            'name' => 'Juan Perez',
            'email' => 'juan@gmail.com',
            'password' => Hash::make('12345678'),
        ]);

        Sanctum::actingAs($usuario);

        $response = $this->getJson('/api/v1/perfil');

        $response->assertOk()
            ->assertExactJson([
                'exito' => true,
                'datos' => [
                    'id' => $usuario->id,
                    'nombre' => 'Juan Perez',
                    'correo' => 'juan@gmail.com',
                    'fecha_registro' => $usuario->created_at->format('Y-m-d'),
                ],
            ]);
    }

    public function test_perfil_usuario_no_autenticado(): void
    {
        $response = $this->getJson('/api/v1/perfil');

        $response->assertUnauthorized();
    }

    public function test_cambiar_password_ok(): void
    {
        $usuario = User::factory()->create([
            'password' => Hash::make('claveVieja1'),
        ]);

        Sanctum::actingAs($usuario);

        $response = $this->putJson('/api/v1/perfil/password', [
            'password_actual' => 'claveVieja1',
            'password_nueva' => 'claveNueva12',
            'password_nueva_confirmation' => 'claveNueva12',
        ]);

        $response->assertOk()
            ->assertExactJson([
                'exito' => true,
                'mensaje' => 'Contraseña actualizada correctamente',
            ]);

        $usuario->refresh();
        $this->assertTrue(Hash::check('claveNueva12', $usuario->password));
    }

    public function test_cambiar_password_actual_incorrecta(): void
    {
        $usuario = User::factory()->create([
            'password' => Hash::make('soloEsta1'),
        ]);

        Sanctum::actingAs($usuario);

        $response = $this->putJson('/api/v1/perfil/password', [
            'password_actual' => 'otraDistinta2',
            'password_nueva' => 'claveNueva12',
            'password_nueva_confirmation' => 'claveNueva12',
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'La contraseña actual es incorrecta',
            ]);
    }

    public function test_historial_reservas_usuario(): void
    {
        $usuario = User::factory()->create();
        $pelicula = Pelicula::factory()->create([
            'titulo' => 'Batman',
            'imagen_url' => 'https://cdn.example/poster.jpg',
        ]);
        $sala = Sala::factory()->create(['nombre' => 'Sala VIP 1']);

        $reserva = Reserva::query()->create([
            'codigo_reserva' => 'RES-PRUEBA-001',
            'user_id' => $usuario->id,
            'guest_id' => null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-07-01',
            'hora_inicio' => '19:00:00',
            'hora_fin' => '21:30:00',
            'cantidad_personas' => 2,
            'precio_total' => '30.00',
            'estado' => 'reservado',
            'metadata' => [],
        ]);

        $producto = ProductoConfiteria::query()->create([
            'nombre' => 'Combo Canchita',
            'precio' => 10.00,
            'estado' => 'disponible',
        ]);

        ReservaProducto::query()->create([
            'reserva_id' => $reserva->id,
            'producto_id' => $producto->id,
            'cantidad' => 2,
            'precio_unitario' => '10.00',
            'subtotal' => '20.00',
            'origen' => 'producto',
        ]);

        $codigoQr = TicketQr::generar($reserva->fresh());

        $reserva->pago()->create([
            'metodo_pago' => 'yape',
            'estado' => 'pagado',
            'monto' => '55.00',
            'fecha_pago' => now(),
            'codigo_ticket_qr' => $codigoQr,
        ]);

        Sanctum::actingAs($usuario);

        $response = $this->getJson('/api/v1/perfil/reservas');

        $response->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonPath('datos.proximas.0.codigo_reserva', 'RES-PRUEBA-001')
            ->assertJsonPath('datos.proximas.0.pelicula', 'Batman')
            ->assertJsonPath('datos.proximas.0.imagen_url', 'https://cdn.example/poster.jpg')
            ->assertJsonPath('datos.proximas.0.sala', 'Sala VIP 1')
            ->assertJsonPath('datos.proximas.0.fecha', '2026-07-01')
            ->assertJsonPath('datos.proximas.0.hora_inicio', '19:00')
            ->assertJsonPath('datos.proximas.0.hora_fin', '21:30')
            ->assertJsonPath('datos.proximas.0.cantidad_personas', 2)
            ->assertJsonPath('datos.proximas.0.subtotal_confiteria', 20)
            ->assertJsonPath('datos.proximas.0.total_pagado', 55)
            ->assertJsonPath('datos.proximas.0.estado_pago', 'pagado')
            ->assertJsonPath('datos.proximas.0.qr_url', 'http://localhost:5173/ticket/'.rawurlencode($codigoQr))
            ->assertJsonPath('datos.proximas.0.codigo_qr', $codigoQr)
            ->assertJsonPath('datos.proximas.0.productos_confiteria.0.nombre', 'Combo Canchita')
            ->assertJsonPath('datos.proximas.0.productos_confiteria.0.cantidad', 2)
            ->assertJsonPath('datos.proximas.0.productos_confiteria.0.subtotal', 20)
            ->assertJsonCount(0, 'datos.historial');
    }

    public function test_separacion_proximas_e_historial(): void
    {
        $usuario = User::factory()->create();
        $pelicula = Pelicula::factory()->create();
        $sala = Sala::factory()->create();

        Reserva::query()->create([
            'codigo_reserva' => 'RES-FUTURO',
            'user_id' => $usuario->id,
            'guest_id' => null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-06-20',
            'hora_inicio' => '10:00:00',
            'hora_fin' => '12:00:00',
            'cantidad_personas' => 1,
            'precio_total' => '15.00',
            'estado' => 'reservado',
            'metadata' => [],
        ]);

        Reserva::query()->create([
            'codigo_reserva' => 'RES-PASADO',
            'user_id' => $usuario->id,
            'guest_id' => null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-06-10',
            'hora_inicio' => '18:00:00',
            'hora_fin' => '20:00:00',
            'cantidad_personas' => 3,
            'precio_total' => '45.00',
            'estado' => 'reservado',
            'metadata' => [],
        ]);

        Sanctum::actingAs($usuario);

        $response = $this->getJson('/api/v1/perfil/reservas');

        $response->assertOk()
            ->assertJsonPath('datos.proximas.0.codigo_reserva', 'RES-FUTURO')
            ->assertJsonPath('datos.historial.0.codigo_reserva', 'RES-PASADO');

        $json = $response->json();
        $this->assertCount(1, $json['datos']['proximas']);
        $this->assertCount(1, $json['datos']['historial']);
    }

    public function test_historial_no_incluye_reservas_de_otros_usuarios(): void
    {
        $usuarioA = User::factory()->create();
        $usuarioB = User::factory()->create();
        $pelicula = Pelicula::factory()->create();
        $sala = Sala::factory()->create();

        Reserva::query()->create([
            'codigo_reserva' => 'RES-DE-B',
            'user_id' => $usuarioB->id,
            'guest_id' => null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-07-01',
            'hora_inicio' => '19:00:00',
            'hora_fin' => '21:00:00',
            'cantidad_personas' => 1,
            'precio_total' => '15.00',
            'estado' => 'reservado',
            'metadata' => [],
        ]);

        Sanctum::actingAs($usuarioA);

        $response = $this->getJson('/api/v1/perfil/reservas');

        $response->assertOk()
            ->assertJsonPath('datos.proximas', [])
            ->assertJsonPath('datos.historial', []);
    }
}
