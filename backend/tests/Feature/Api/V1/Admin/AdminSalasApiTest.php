<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Sala;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminSalasApiTest extends TestCase
{
    use RefreshDatabase;

    private function crearAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_cliente_no_accede_admin_salas(): void
    {
        $cliente = User::factory()->create(['rol' => 'cliente']);
        Sanctum::actingAs($cliente);

        $this->getJson('/api/v1/admin/salas')->assertForbidden();
    }

    public function test_admin_lista_y_crea_sala(): void
    {
        Sanctum::actingAs($this->crearAdmin());

        $this->getJson('/api/v1/admin/salas')->assertOk()->assertJsonPath('exito', true);

        $r = $this->postJson('/api/v1/admin/salas', [
            'nombre' => 'Sala VIP',
            'precio' => 10,
            'tiempo_limpieza' => 15,
        ]);
        $r->assertCreated()
            ->assertJsonPath('datos.sala.nombre', 'Sala VIP')
            ->assertJsonPath('datos.sala.estado', 'disponible');
        $this->assertEqualsWithDelta(10.0, (float) $r->json('datos.sala.precio'), 0.001);
        $this->assertSame(15, $r->json('datos.sala.tiempo_limpieza'));
    }

    public function test_admin_patch_estado_sala(): void
    {
        Sanctum::actingAs($this->crearAdmin());
        $this->postJson('/api/v1/admin/salas', [
            'nombre' => 'Sala X',
            'precio' => 10,
            'tiempo_limpieza' => 10,
        ])->assertCreated();
        $id = (int) Sala::query()->first()->id;

        $this->patchJson("/api/v1/admin/salas/{$id}/estado", ['estado' => 'inactiva'])
            ->assertOk()
            ->assertJsonPath('datos.sala.estado', 'inactiva');
    }
}
