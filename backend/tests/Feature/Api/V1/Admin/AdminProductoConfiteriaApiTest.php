<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Pelicula;
use App\Models\ProductoConfiteria;
use App\Models\Reserva;
use App\Models\Sala;
use App\Models\SalaHorario;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductoConfiteriaApiTest extends TestCase
{
    use RefreshDatabase;

    private function crearAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_cliente_no_accede(): void
    {
        $cliente = User::factory()->create(['rol' => 'cliente']);
        Sanctum::actingAs($cliente);

        $this->getJson('/api/v1/admin/confiteria/productos')->assertForbidden();
    }

    public function test_admin_crud_y_patch_estado(): void
    {
        Sanctum::actingAs($this->crearAdmin());

        $this->getJson('/api/v1/admin/confiteria/productos')
            ->assertOk()
            ->assertJsonPath('exito', true);

        $crear = $this->postJson('/api/v1/admin/confiteria/productos', [
            'nombre' => 'Combo test',
            'precio' => 25.5,
            'descripcion' => 'Dos items',
            'metadata' => ['tipo' => 'combo'],
        ]);
        $crear->assertCreated()->assertJsonPath('datos.producto.nombre', 'Combo test');
        $id = (int) $crear->json('datos.producto.id');

        $this->putJson("/api/v1/admin/confiteria/productos/{$id}", [
            'nombre' => 'Combo test editado',
            'precio' => 26,
            'descripcion' => 'Actualizado',
            'estado' => 'agotado',
        ])
            ->assertOk()
            ->assertJsonPath('datos.producto.estado', 'agotado');

        $this->patchJson("/api/v1/admin/confiteria/productos/{$id}/estado", [
            'estado' => 'disponible',
        ])
            ->assertOk()
            ->assertJsonPath('datos.producto.estado', 'disponible');

        $this->deleteJson("/api/v1/admin/confiteria/productos/{$id}")
            ->assertOk()
            ->assertJsonPath('exito', true);

        $this->assertDatabaseMissing('productos_confiteria', ['id' => $id]);
    }

    public function test_no_eliminar_si_en_reserva(): void
    {
        Sanctum::actingAs($this->crearAdmin());

        $fecha = Carbon::parse('2026-06-15');
        $dow = (int) $fecha->format('w');

        $sala = Sala::factory()->create(['estado' => 'disponible']);
        SalaHorario::query()->create([
            'sala_id' => $sala->id,
            'dia_semana' => $dow,
            'hora_apertura' => '08:00:00',
            'hora_cierre' => '23:00:00',
            'activo' => true,
        ]);
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible']);

        $reserva = Reserva::query()->create([
            'codigo_reserva' => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            'user_id' => null,
            'guest_id' => null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha->format('Y-m-d'),
            'hora_inicio' => '10:00:00',
            'hora_fin' => '12:00:00',
            'cantidad_personas' => 2,
            'precio_total' => '20.00',
            'estado' => 'reservado',
            'metadata' => ['pago_estado' => 'pendiente'],
        ]);

        $p = ProductoConfiteria::query()->create([
            'nombre' => 'Con línea',
            'precio' => 5,
            'estado' => 'disponible',
        ]);

        DB::table('reserva_productos')->insert([
            'reserva_id' => $reserva->id,
            'producto_id' => $p->id,
            'cantidad' => 1,
            'precio_unitario' => '5.00',
            'subtotal' => '5.00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->deleteJson("/api/v1/admin/confiteria/productos/{$p->id}")
            ->assertStatus(422)
            ->assertJsonPath('exito', false);
    }
}
