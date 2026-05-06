<?php

namespace Tests\Feature\Api\V1\Peliculas;

use App\Models\Pelicula;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PeliculasApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_obtener_peliculas_destacadas(): void
    {
        foreach (range(1, 11) as $i) {
            Pelicula::factory()->create([
                'titulo' => "Acción {$i}",
                'categoria' => 'Acción',
                'estado' => 'disponible',
            ]);
        }

        Pelicula::factory()->create([
            'titulo' => 'No lista',
            'categoria' => 'Acción',
            'estado' => 'no_disponible',
        ]);

        Pelicula::factory()->count(2)->create([
            'categoria' => 'Drama',
            'estado' => 'disponible',
        ]);

        $response = $this->getJson('/api/v1/peliculas');

        $response->assertOk()
            ->assertJson([
                'exito' => true,
                'mensaje' => 'Cartelera obtenida correctamente',
            ])
            ->assertJsonStructure([
                'datos' => [
                    'por_categoria' => [
                        'Acción' => [
                            ['id', 'titulo', 'descripcion', 'categoria', 'duracion', 'imagen_url', 'estado'],
                        ],
                        'Drama',
                    ],
                ],
            ]);

        $porCategoria = $response->json('datos.por_categoria');
        $this->assertCount(10, $porCategoria['Acción']);
        $this->assertCount(2, $porCategoria['Drama']);
    }

    public function test_busqueda_con_resultados(): void
    {
        Pelicula::factory()->create([
            'titulo' => 'Matrix Recargado',
            'categoria' => 'Ciencia ficción',
            'estado' => 'disponible',
        ]);

        Pelicula::factory()->create([
            'titulo' => 'Otra cosa',
            'categoria' => 'Drama',
            'estado' => 'disponible',
        ]);

        $porTitulo = $this->getJson('/api/v1/peliculas/buscar?query='.rawurlencode('Matrix'));
        $porTitulo->assertOk()
            ->assertJsonPath('datos.total', 1)
            ->assertJsonPath('datos.peliculas.0.titulo', 'Matrix Recargado');

        $porCategoria = $this->getJson('/api/v1/peliculas/buscar?categoria='.rawurlencode('Drama'));
        $porCategoria->assertOk()
            ->assertJsonPath('datos.total', 1)
            ->assertJsonPath('datos.peliculas.0.categoria', 'Drama');
    }

    public function test_busqueda_sin_resultados(): void
    {
        Pelicula::factory()->create(['titulo' => 'Solo esto', 'estado' => 'disponible']);

        $response = $this->getJson('/api/v1/peliculas/buscar?query='.rawurlencode('inexistente_xyz'));

        $response->assertOk()
            ->assertJson([
                'exito' => true,
                'datos' => [
                    'peliculas' => [],
                    'total' => 0,
                ],
            ]);
    }

    public function test_validacion_query_buscar(): void
    {
        $response = $this->getJson('/api/v1/peliculas/buscar');

        $response->assertStatus(422)
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Error de validación',
            ])
            ->assertJsonPath('errores.query.0', 'Debe indicar al menos un criterio de búsqueda (título o categoría).');
    }
}
