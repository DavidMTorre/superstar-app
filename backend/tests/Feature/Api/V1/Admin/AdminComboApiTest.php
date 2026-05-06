<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Combo;
use App\Models\ProductoConfiteria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminComboApiTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_crud_combos(): void
    {
        Sanctum::actingAs($this->admin());
        $a = ProductoConfiteria::query()->create(['nombre' => 'A', 'precio' => 5, 'estado' => 'disponible']);
        $b = ProductoConfiteria::query()->create(['nombre' => 'B', 'precio' => 3, 'estado' => 'disponible']);

        $this->getJson('/api/v1/admin/combos')->assertOk()->assertJsonPath('exito', true);

        $r = $this->postJson('/api/v1/admin/combos', [
            'nombre' => 'Dúo',
            'precio' => 7.5,
            'productos' => [
                ['producto_id' => $a->id, 'cantidad' => 1],
                ['producto_id' => $b->id, 'cantidad' => 2],
            ],
        ]);
        $r->assertCreated();
        $id = (int) $r->json('datos.combo.id');

        $this->putJson("/api/v1/admin/combos/{$id}", [
            'nombre' => 'Dúo plus',
            'precio' => 8,
            'productos' => [
                ['producto_id' => $a->id, 'cantidad' => 2],
            ],
        ])->assertOk()->assertJsonPath('datos.combo.nombre', 'Dúo plus');

        $this->deleteJson("/api/v1/admin/combos/{$id}")->assertOk();
        $this->assertNull(Combo::query()->find($id));
    }
}
