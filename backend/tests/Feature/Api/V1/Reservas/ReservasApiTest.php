<?php

namespace Tests\Feature\Api\V1\Reservas;

use App\Models\Pelicula;
use App\Models\Reserva;
use App\Models\Sala;
use App\Models\SalaHorario;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservasApiTest extends TestCase
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

    /**
     * @param  array<string, mixed>  $salaAttrs
     */
    private function salaDisponible(array $salaAttrs = []): Sala
    {
        return Sala::factory()->create(array_merge([
            'estado' => 'disponible',
            'precio' => 15.00,
            'tiempo_limpieza' => 15,
        ], $salaAttrs));
    }

    private function fechaManiana(): string
    {
        return Carbon::now()->addDay()->format('Y-m-d');
    }

    /** Horario de atención para el día de la semana de $fechaYmd (0=dom … 6=sáb). */
    private function configurarHorarioParaFecha(
        Sala $sala,
        string $fechaYmd,
        string $horaApertura = '00:00:00',
        string $horaCierre = '23:59:59'
    ): void {
        $dow = (int) Carbon::parse($fechaYmd)->format('w');
        SalaHorario::query()->create([
            'sala_id' => $sala->id,
            'dia_semana' => $dow,
            'hora_apertura' => $horaApertura,
            'hora_cierre' => $horaCierre,
        ]);
    }

    /**
     * @param  array<string, mixed>  $salaAttrs
     */
    private function salaDisponibleConHorario(
        string $fechaReserva,
        array $salaAttrs = [],
        string $apertura = '00:00:00',
        string $cierre = '23:59:59'
    ): Sala {
        $sala = $this->salaDisponible($salaAttrs);
        $this->configurarHorarioParaFecha($sala, $fechaReserva, $apertura, $cierre);

        return $sala;
    }

    private function payloadBase(User|null $user, Pelicula $pelicula, Sala $sala, array $extra = []): array
    {
        $base = [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $this->fechaManiana(),
            'hora_inicio' => '18:00',
            'cantidad_personas' => 2,
        ];

        if ($user !== null) {
            $base['usuario_id'] = $user->id;
        } else {
            $base['guest_id'] = 'guest_test_xyz';
        }

        return array_merge($base, $extra);
    }

    public function test_reserva_exitosa_usuario_registrado(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 90]);
        $sala = $this->salaDisponibleConHorario($this->fechaManiana());

        $response = $this->postJson('/api/v1/reservas', $this->payloadBase($user, $pelicula, $sala));

        $response->assertCreated()
            ->assertJson([
                'exito' => true,
                'mensaje' => 'Reserva registrada correctamente',
            ])
            ->assertJsonStructure([
                'datos' => [
                    'reserva' => [
                        'codigo_reserva',
                        'usuario_id',
                        'guest_id',
                        'pelicula_id',
                        'pelicula_titulo',
                        'sala',
                        'sala_precio',
                        'fecha_funcion',
                        'hora_funcion',
                        'hora_fin',
                        'cantidad_personas',
                        'precio_total',
                        'estado',
                        'metadata',
                    ],
                ],
            ]);

        $this->assertSame($user->id, $response->json('datos.reserva.usuario_id'));
        $this->assertNull($response->json('datos.reserva.guest_id'));
        $this->assertSame('reservado', $response->json('datos.reserva.estado'));
        $this->assertSame('pendiente', $response->json('datos.reserva.metadata.pago_estado'));
        $this->assertEqualsWithDelta(15.0, (float) $response->json('datos.reserva.precio_total'), 0.001);

        $this->assertDatabaseHas('reservas', [
            'user_id' => $user->id,
            'guest_id' => null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'cantidad_personas' => 2,
            'estado' => 'reservado',
        ]);
    }

    public function test_exceso_de_personas(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible']);
        $sala = $this->salaDisponibleConHorario($this->fechaManiana());

        $response = $this->postJson('/api/v1/reservas', array_merge(
            $this->payloadBase($user, $pelicula, $sala),
            ['cantidad_personas' => 5]
        ));

        $response->assertStatus(422)
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Error de validación',
            ])
            ->assertJsonPath('errores.cantidad_personas.0', 'El máximo es 4 personas por reserva.');
    }

    public function test_pelicula_no_disponible(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->noDisponible()->create();
        $sala = $this->salaDisponible();

        $response = $this->postJson('/api/v1/reservas', $this->payloadBase($user, $pelicula, $sala));

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'La película no está disponible para reservas.',
            ]);

        $this->assertDatabaseCount('reservas', 0);
    }

    public function test_usuario_invitado_con_guest_id(): void
    {
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible']);
        $sala = $this->salaDisponibleConHorario($this->fechaManiana());

        $response = $this->postJson('/api/v1/reservas', $this->payloadBase(null, $pelicula, $sala, [
            'guest_id' => 'guest_abc123def456',
        ]));

        $response->assertCreated()
            ->assertJsonPath('datos.reserva.guest_id', 'guest_abc123def456')
            ->assertJsonPath('datos.reserva.usuario_id', null);

        $this->assertDatabaseHas('reservas', [
            'guest_id' => 'guest_abc123def456',
            'user_id' => null,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'cantidad_personas' => 2,
        ]);
    }

    public function test_solapamiento_rechazado(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 60]);
        $fecha = $this->fechaManiana();
        $sala = $this->salaDisponibleConHorario($fecha, ['tiempo_limpieza' => 15]);

        $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '10:00',
            'cantidad_personas' => 2,
        ])->assertCreated();

        $r2 = $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '10:30',
            'cantidad_personas' => 1,
        ]);

        $r2->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'Horario no disponible para esta sala',
            ]);

        $this->assertDatabaseCount('reservas', 1);
    }

    public function test_reserva_consecutiva_sin_solapamiento_ok(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 60]);
        $fecha = $this->fechaManiana();
        $sala = $this->salaDisponibleConHorario($fecha, ['tiempo_limpieza' => 15]);

        $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '10:00',
            'cantidad_personas' => 2,
        ])->assertCreated();

        $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '11:15',
            'cantidad_personas' => 2,
        ])->assertCreated();

        $this->assertDatabaseCount('reservas', 2);
    }

    public function test_limpieza_incluida_en_hora_fin(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 100]);
        $fecha = $this->fechaManiana();
        $sala = $this->salaDisponibleConHorario($fecha, ['tiempo_limpieza' => 20]);

        $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '14:00:00',
            'cantidad_personas' => 1,
        ])->assertCreated();

        $r = Reserva::query()->first();
        $this->assertNotNull($r);
        $this->assertSame('14:00:00', $r->hora_inicio);
        $this->assertSame('16:00:00', $r->hora_fin);
    }

    public function test_sala_sin_horario_configurado(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible']);
        $sala = $this->salaDisponible();

        $response = $this->postJson('/api/v1/reservas', $this->payloadBase($user, $pelicula, $sala));

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'La sala no atiende este día',
            ]);

        $this->assertDatabaseCount('reservas', 0);
    }

    public function test_reserva_antes_de_apertura(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 60]);
        $fecha = $this->fechaManiana();
        $sala = $this->salaDisponible();
        $this->configurarHorarioParaFecha($sala, $fecha, '12:00:00', '22:00:00');

        $response = $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '10:00',
            'cantidad_personas' => 2,
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'La hora es antes de apertura',
            ]);
    }

    public function test_reserva_excede_horario_cierre(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 90]);
        $fecha = $this->fechaManiana();
        $sala = $this->salaDisponible(['tiempo_limpieza' => 15]);
        $this->configurarHorarioParaFecha($sala, $fecha, '08:00:00', '18:00:00');

        $response = $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '17:00',
            'cantidad_personas' => 2,
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'La reserva excede el horario de atención',
            ]);
    }

    public function test_reserva_dentro_de_horario_atencion_ok(): void
    {
        $user = User::factory()->create();
        $pelicula = Pelicula::factory()->create(['estado' => 'disponible', 'duracion' => 60]);
        $fecha = $this->fechaManiana();
        $sala = $this->salaDisponible(['tiempo_limpieza' => 15]);
        $this->configurarHorarioParaFecha($sala, $fecha, '08:00:00', '22:00:00');

        $this->postJson('/api/v1/reservas', [
            'usuario_id' => $user->id,
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => '14:00',
            'cantidad_personas' => 2,
        ])->assertCreated();
    }
}
