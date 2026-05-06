<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Sala;
use App\Models\SalaHorario;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminSalaHorarioApiTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_crud_horarios_sala(): void
    {
        Sanctum::actingAs($this->admin());
        $sala = Sala::factory()->create();

        $this->getJson("/api/v1/admin/salas/{$sala->id}/horarios")->assertOk()
            ->assertJsonPath('datos.horarios', []);

        $this->postJson("/api/v1/admin/salas/{$sala->id}/horarios", [
            'dia_semana' => 3,
            'hora_apertura' => '09:00',
            'hora_cierre' => '21:30',
        ])->assertCreated()
            ->assertJsonPath('datos.horario.dia_semana', 3);

        $hid = (int) SalaHorario::query()->where('sala_id', $sala->id)->value('id');
        $this->assertGreaterThan(0, $hid);

        $this->putJson("/api/v1/admin/salas/{$sala->id}/horarios/{$hid}", [
            'hora_apertura' => '10:00',
            'hora_cierre' => '22:00',
        ])->assertOk()
            ->assertJsonPath('datos.horario.hora_apertura', '10:00')
            ->assertJsonPath('datos.horario.activo', true);

        $this->putJson("/api/v1/admin/salas/{$sala->id}/horarios/{$hid}", [
            'activo' => false,
        ])->assertOk()
            ->assertJsonPath('datos.horario.activo', false);

        $this->deleteJson("/api/v1/admin/salas/{$sala->id}/horarios/{$hid}")
            ->assertOk();

        $this->getJson("/api/v1/admin/salas/{$sala->id}/horarios")->assertOk()
            ->assertJsonPath('datos.horarios', []);
    }

    public function test_apertura_mayor_igual_cierre_rechazado(): void
    {
        Sanctum::actingAs($this->admin());
        $sala = Sala::factory()->create();

        $this->postJson("/api/v1/admin/salas/{$sala->id}/horarios", [
            'dia_semana' => 1,
            'hora_apertura' => '20:00',
            'hora_cierre' => '08:00',
        ])->assertStatus(422);
    }
}
