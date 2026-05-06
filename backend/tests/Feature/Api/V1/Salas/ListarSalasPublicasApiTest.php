<?php

namespace Tests\Feature\Api\V1\Salas;

use App\Models\Sala;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListarSalasPublicasApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_solo_salas_disponibles(): void
    {
        Sala::factory()->create(['nombre' => 'A', 'estado' => 'disponible', 'precio' => 12.5, 'tiempo_limpieza' => 20]);
        Sala::factory()->inactiva()->create(['nombre' => 'B']);

        $response = $this->getJson('/api/v1/salas');

        $response->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonCount(1, 'datos.salas')
            ->assertJsonPath('datos.salas.0.nombre', 'A')
            ->assertJsonPath('datos.salas.0.precio', 12.5)
            ->assertJsonPath('datos.salas.0.tiempo_limpieza', 20)
            ->assertJsonStructure([
                'datos' => [
                    'salas' => [
                        [
                            'horarios',
                        ],
                    ],
                ],
            ]);
    }
}
