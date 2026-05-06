<?php

namespace Tests\Feature\Api\V1\Disponibilidad;

use App\Models\Pelicula;
use App\Models\Sala;
use App\Models\SalaHorario;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DisponibilidadApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-05-01 12:00:00'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_sin_horario_para_el_dia_devuelve_lista_vacia(): void
    {
        $fecha = Carbon::now()->addDay()->format('Y-m-d');
        $dow = (int) Carbon::parse($fecha)->format('w');

        $sala = Sala::factory()->create(['estado' => 'disponible', 'tiempo_limpieza' => 15]);
        $otroDia = ($dow + 1) % 7;
        SalaHorario::query()->create([
            'sala_id' => $sala->id,
            'dia_semana' => $otroDia,
            'hora_apertura' => '08:00:00',
            'hora_cierre' => '22:00:00',
            'activo' => true,
        ]);

        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 90]);

        $this->getJson('/api/v1/disponibilidad?'.http_build_query([
            'pelicula_id' => $pelicula->id,
            'fecha' => $fecha,
        ]))
            ->assertOk()
            ->assertJsonPath('exito', true)
            ->assertJsonPath('datos', []);
    }

    public function test_horario_activo_genera_slots(): void
    {
        $fecha = Carbon::now()->addDay()->format('Y-m-d');
        $dow = (int) Carbon::parse($fecha)->format('w');

        $sala = Sala::factory()->create(['estado' => 'disponible', 'tiempo_limpieza' => 15]);
        SalaHorario::query()->create([
            'sala_id' => $sala->id,
            'dia_semana' => $dow,
            'hora_apertura' => '10:00:00',
            'hora_cierre' => '12:00:00',
            'activo' => true,
        ]);

        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 90]);

        $this->getJson('/api/v1/disponibilidad?'.http_build_query([
            'pelicula_id' => $pelicula->id,
            'fecha' => $fecha,
        ]))
            ->assertOk()
            ->assertJsonPath('exito', true);

        $datos = $this->getJson('/api/v1/disponibilidad?'.http_build_query([
            'pelicula_id' => $pelicula->id,
            'fecha' => $fecha,
        ]))->json('datos');

        $this->assertIsArray($datos);
        $this->assertNotEmpty($datos);
        $this->assertSame($sala->id, $datos[0]['sala_id']);
    }

    public function test_horario_inactivo_no_muestra_sala(): void
    {
        $fecha = Carbon::now()->addDay()->format('Y-m-d');
        $dow = (int) Carbon::parse($fecha)->format('w');

        $sala = Sala::factory()->create(['estado' => 'disponible', 'tiempo_limpieza' => 15]);
        SalaHorario::query()->create([
            'sala_id' => $sala->id,
            'dia_semana' => $dow,
            'hora_apertura' => '08:00:00',
            'hora_cierre' => '22:00:00',
            'activo' => false,
        ]);

        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 90]);

        $this->getJson('/api/v1/disponibilidad?'.http_build_query([
            'pelicula_id' => $pelicula->id,
            'fecha' => $fecha,
        ]))
            ->assertOk()
            ->assertJsonPath('datos', []);
    }
}
