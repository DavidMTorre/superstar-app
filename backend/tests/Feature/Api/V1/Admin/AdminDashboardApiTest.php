<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    private function crearAdmin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_cliente_no_accede_dashboard(): void
    {
        $cliente = User::factory()->create(['rol' => 'cliente']);
        Sanctum::actingAs($cliente);

        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
    }

    public function test_admin_obtiene_resumen_dashboard(): void
    {
        Sanctum::actingAs($this->crearAdmin());

        $r = $this->getJson('/api/v1/admin/dashboard');

        $r->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonStructure([
                'datos' => [
                    'reservas_total',
                    'ingresos_entradas',
                    'ingresos_confiteria',
                    'ingresos_combos',
                    'productos_top',
                    'ventas_por_dia',
                    'total_usuarios',
                ],
            ]);

        $this->assertIsInt($r->json('datos.reservas_total'));
        $this->assertIsNumeric($r->json('datos.ingresos_entradas'));
        $this->assertIsArray($r->json('datos.productos_top'));
        $this->assertIsArray($r->json('datos.ventas_por_dia'));
    }
}
