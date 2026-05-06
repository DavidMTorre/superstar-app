<?php

namespace Tests\Feature\Api\V1\Confiteria;

use App\Models\Combo;
use App\Models\Pelicula;
use App\Models\ProductoConfiteria;
use App\Models\Reserva;
use App\Models\Sala;
use App\Models\SalaHorario;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConfiteriaApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-05-10 12:00:00'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_lista_productos_disponibles(): void
    {
        ProductoConfiteria::query()->create([
            'nombre' => 'Test snack',
            'descripcion' => null,
            'precio' => 5.50,
            'imagen_url' => null,
            'estado' => 'disponible',
            'metadata' => null,
        ]);

        ProductoConfiteria::query()->create([
            'nombre' => 'Agotado',
            'descripcion' => null,
            'precio' => 1.00,
            'imagen_url' => null,
            'estado' => 'agotado',
            'metadata' => null,
        ]);

        $this->getJson('/api/v1/confiteria/productos')
            ->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonCount(1, 'datos')
            ->assertJsonPath('datos.0.nombre', 'Test snack');
    }

    public function test_agregar_productos_a_reserva_sin_pago(): void
    {
        $fecha = Carbon::now()->addDay()->format('Y-m-d');
        $dow = (int) Carbon::parse($fecha)->format('w');

        $sala = Sala::factory()->create([
            'estado' => 'disponible',
            'precio' => 20.00,
            'tiempo_limpieza' => 15,
        ]);
        SalaHorario::query()->create([
            'sala_id' => $sala->id,
            'dia_semana' => $dow,
            'hora_apertura' => '08:00:00',
            'hora_cierre' => '23:00:00',
            'activo' => true,
        ]);

        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 90]);
        $user = User::factory()->create();

        $this->postJson('/api/v1/reservas', [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '18:00:00',
            'cantidad_personas' => 2,
            'usuario_id' => $user->id,
        ])->assertCreated();

        $codigo = (string) Reserva::query()->value('codigo_reserva');

        $p1 = ProductoConfiteria::query()->create([
            'nombre' => 'P1',
            'precio' => 10.00,
            'estado' => 'disponible',
        ]);
        $p2 = ProductoConfiteria::query()->create([
            'nombre' => 'P2',
            'precio' => 3.50,
            'estado' => 'disponible',
        ]);

        $this->postJson('/api/v1/confiteria/agregar', [
            'codigo_reserva' => $codigo,
            'productos' => [
                ['producto_id' => $p1->id, 'cantidad' => 2],
                ['producto_id' => $p2->id, 'cantidad' => 1],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonPath('datos.subtotal_confiteria', 23.5);

        $reserva = Reserva::query()->where('codigo_reserva', $codigo)->first();
        $this->assertNotNull($reserva);
        $this->assertTrue((bool) ($reserva->metadata['confiteria'] ?? false));
        $this->assertSame(2, $reserva->reservaProductos()->count());
    }

    public function test_lista_combos_publicos(): void
    {
        $p = ProductoConfiteria::query()->create([
            'nombre' => 'Item combo',
            'precio' => 10,
            'estado' => 'disponible',
        ]);
        $combo = Combo::query()->create(['nombre' => 'Mi combo', 'precio' => 15, 'estado' => 'disponible']);
        $combo->productos()->attach($p->id, ['cantidad' => 2]);

        $this->getJson('/api/v1/confiteria/combos')
            ->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonPath('datos.0.nombre', 'Mi combo')
            ->assertJsonPath('datos.0.productos.0.cantidad', 2);
    }

    public function test_agregar_solo_combo_expande_reserva_productos(): void
    {
        $fecha = Carbon::now()->addDay()->format('Y-m-d');
        $dow = (int) Carbon::parse($fecha)->format('w');

        $sala = Sala::factory()->create([
            'estado' => 'disponible',
            'precio' => 20.00,
            'tiempo_limpieza' => 15,
        ]);
        SalaHorario::query()->create([
            'sala_id' => $sala->id,
            'dia_semana' => $dow,
            'hora_apertura' => '08:00:00',
            'hora_cierre' => '23:00:00',
            'activo' => true,
        ]);

        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 90]);
        $user = User::factory()->create();

        $this->postJson('/api/v1/reservas', [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '18:00:00',
            'cantidad_personas' => 2,
            'usuario_id' => $user->id,
        ])->assertCreated();

        $codigo = (string) Reserva::query()->value('codigo_reserva');

        $p1 = ProductoConfiteria::query()->create(['nombre' => 'C1', 'precio' => 10.00, 'estado' => 'disponible']);
        $p2 = ProductoConfiteria::query()->create(['nombre' => 'C2', 'precio' => 10.00, 'estado' => 'disponible']);

        $combo = Combo::query()->create(['nombre' => 'Full', 'precio' => 18.00, 'estado' => 'disponible']);
        $combo->productos()->sync([
            $p1->id => ['cantidad' => 1],
            $p2->id => ['cantidad' => 1],
        ]);

        $this->postJson('/api/v1/confiteria/agregar', [
            'codigo_reserva' => $codigo,
            'productos' => [],
            'combos' => [
                ['combo_id' => $combo->id, 'cantidad' => 1],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('datos.subtotal_confiteria', 18);

        $reserva = Reserva::query()->where('codigo_reserva', $codigo)->first();
        $this->assertSame(2, $reserva->reservaProductos()->count());
        $this->assertEqualsWithDelta(
            18.0,
            (float) $reserva->reservaProductos()->sum('subtotal'),
            0.001
        );
    }
}
