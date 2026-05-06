<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private readonly UserRepository $userRepository
    ) {}

    /**
     * @param  array{nombre: string, correo: string, contraseña: string, telefono: string, fecha_nacimiento: string, genero: string}  $datos
     * @return array{usuario: array{id: int, nombre: string, correo: string, telefono: string, fecha_nacimiento: string, genero: string, rol: string}}
     */
    public function registrarUsuario(array $datos): array
    {
        $user = $this->userRepository->create([
            'name' => $datos['nombre'],
            'email' => $datos['correo'],
            'password' => $datos['contraseña'],
            'telefono' => $datos['telefono'],
            'fecha_nacimiento' => $datos['fecha_nacimiento'],
            'genero' => $datos['genero'],
            'rol' => 'cliente',
        ]);

        return [
            'usuario' => $this->usuarioPublico($user),
        ];
    }

    /**
     * Valida credenciales y devuelve el modelo usuario o null.
     */
    public function validarCredenciales(string $correo, string $contraseña): ?User
    {
        $user = $this->userRepository->findByEmail($correo);

        if ($user === null) {
            return null;
        }

        if (! Hash::check($contraseña, $user->password)) {
            return null;
        }

        return $user;
    }

    /**
     * @param  array{correo: string, contraseña: string}  $datos
     * @return array{usuario: array{id: int, nombre: string, correo: string, telefono: string, fecha_nacimiento: string, genero: string, rol: string}}|null
     */
    public function iniciarSesion(array $datos): ?array
    {
        $user = $this->validarCredenciales($datos['correo'], $datos['contraseña']);

        if ($user === null) {
            return null;
        }

        return [
            'usuario' => $this->usuarioPublico($user),
        ];
    }

    /**
     * @return array{guest_id: string}
     */
    public function crearSesionInvitado(): array
    {
        return [
            'guest_id' => 'guest_'.Str::lower(Str::replace('-', '', Str::uuid()->toString())),
        ];
    }

    /**
     * @return array{id: int, nombre: string, correo: string, telefono: string, fecha_nacimiento: string, genero: string, rol: string}
     */
    public function usuarioPublico(User $user): array
    {
        return [
            'id' => (int) $user->id,
            'nombre' => $user->name,
            'correo' => $user->email,
            'telefono' => $user->telefono,
            'fecha_nacimiento' => $user->fecha_nacimiento->format('Y-m-d'),
            'genero' => $user->genero,
            'rol' => $user->rol ?? 'cliente',
        ];
    }
}
