<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_exitoso(): void
    {
        $payload = [
            'nombre' => 'María Pérez',
            'correo' => 'maria@example.com',
            'contraseña' => 'secreto6',
            'telefono' => '987654321',
            'fecha_nacimiento' => '2001-06-15',
            'genero' => 'femenino',
        ];

        $response = $this->postJson('/api/v1/auth/registro', $payload);

        $response->assertCreated()
            ->assertExactJson([
                'exito' => true,
                'datos' => [
                    'usuario' => [
                        'id' => 1,
                        'nombre' => 'María Pérez',
                        'correo' => 'maria@example.com',
                        'telefono' => '987654321',
                        'fecha_nacimiento' => '2001-06-15',
                        'genero' => 'femenino',
                        'rol' => 'cliente',
                    ],
                ],
                'mensaje' => 'Usuario registrado correctamente',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'maria@example.com',
            'name' => 'María Pérez',
            'telefono' => '987654321',
            'genero' => 'femenino',
        ]);

        $user = User::query()->where('email', 'maria@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('secreto6', $user->password));
    }

    public function test_registro_correo_duplicado(): void
    {
        User::factory()->create([
            'email' => 'dup@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/registro', [
            'nombre' => 'Otro',
            'correo' => 'dup@example.com',
            'contraseña' => 'secreto6',
            'telefono' => '987654322',
            'fecha_nacimiento' => '2000-01-01',
            'genero' => 'otro',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Error de validación',
            ])
            ->assertJsonPath('errores.correo.0', 'El correo ya está registrado.');
    }

    public function test_registro_campos_obligatorios(): void
    {
        $response = $this->postJson('/api/v1/auth/registro', []);

        $response->assertStatus(422)
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Error de validación',
            ]);

        $json = $response->json();
        $this->assertArrayHasKey('errores', $json);
        $this->assertArrayHasKey('nombre', $json['errores']);
        $this->assertArrayHasKey('correo', $json['errores']);
        $this->assertArrayHasKey('contraseña', $json['errores']);
        $this->assertArrayHasKey('telefono', $json['errores']);
        $this->assertArrayHasKey('fecha_nacimiento', $json['errores']);
        $this->assertArrayHasKey('genero', $json['errores']);
    }

    public function test_registro_formato_correo_y_telefono(): void
    {
        $base = [
            'nombre' => 'Test',
            'contraseña' => 'secreto6',
            'fecha_nacimiento' => '2000-01-01',
            'genero' => 'otro',
        ];

        $correoInvalido = $this->postJson('/api/v1/auth/registro', array_merge($base, [
            'correo' => 'no-es-correo',
            'telefono' => '987654321',
        ]));

        $correoInvalido->assertStatus(422)
            ->assertJsonPath('errores.correo.0', 'El correo no tiene un formato válido.');

        $telefonoInvalido = $this->postJson('/api/v1/auth/registro', array_merge($base, [
            'correo' => 'valido@example.com',
            'telefono' => 'abc123',
        ]));

        $telefonoInvalido->assertStatus(422)
            ->assertJsonPath('errores.telefono.0', 'El teléfono no tiene un formato válido.');
    }

    public function test_invitado_genera_guest_id(): void
    {
        $antes = User::query()->count();

        $response = $this->postJson('/api/v1/auth/invitado', []);

        $response->assertOk()
            ->assertJson([
                'exito' => true,
                'mensaje' => 'Sesión de invitado iniciada',
            ])
            ->assertJsonStructure([
                'datos' => [
                    'guest_id',
                ],
            ]);

        $guestId = $response->json('datos.guest_id');
        $this->assertIsString($guestId);
        $this->assertStringStartsWith('guest_', $guestId);
        $this->assertSame($antes, User::query()->count());
    }

    public function test_login_exitoso(): void
    {
        User::factory()->create([
            'name' => 'Ana López',
            'email' => 'ana@example.com',
            'password' => 'claveSegura1',
            'telefono' => '612345678',
            'fecha_nacimiento' => '1995-03-20',
            'genero' => 'femenino',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'correo' => 'ana@example.com',
            'contraseña' => 'claveSegura1',
        ]);

        $response->assertOk()
            ->assertJson([
                'exito' => true,
                'mensaje' => 'Inicio de sesión exitoso',
            ])
            ->assertJsonPath('datos.usuario.id', 1)
            ->assertJsonPath('datos.usuario.nombre', 'Ana López')
            ->assertJsonPath('datos.usuario.correo', 'ana@example.com')
            ->assertJsonPath('datos.usuario.telefono', '612345678')
            ->assertJsonPath('datos.usuario.fecha_nacimiento', '1995-03-20')
            ->assertJsonPath('datos.usuario.genero', 'femenino')
            ->assertJsonPath('datos.usuario.rol', 'cliente')
            ->assertJsonStructure([
                'datos' => [
                    'usuario',
                    'token',
                    'token_type',
                ],
            ]);

        $json = $response->json();
        $this->assertArrayNotHasKey('contraseña', $json['datos']['usuario']);
        $this->assertIsString($json['datos']['token']);
        $this->assertNotSame('', $json['datos']['token']);
    }

    public function test_login_contraseña_incorrecta(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'correcta12',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'correo' => 'user@example.com',
            'contraseña' => 'otraClave',
        ]);

        $response->assertUnauthorized()
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'Credenciales incorrectas',
            ]);
    }

    public function test_login_usuario_no_existe(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'correo' => 'nadie@example.com',
            'contraseña' => 'cualquiera1',
        ]);

        $response->assertUnauthorized()
            ->assertExactJson([
                'exito' => false,
                'mensaje' => 'Credenciales incorrectas',
            ]);
    }

    public function test_login_campos_vacios(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJson([
                'exito' => false,
                'mensaje' => 'Error de validación',
            ]);

        $json = $response->json();
        $this->assertArrayHasKey('errores', $json);
        $this->assertArrayHasKey('correo', $json['errores']);
        $this->assertArrayHasKey('contraseña', $json['errores']);
    }
}
