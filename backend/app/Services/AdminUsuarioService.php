<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Collection;

class AdminUsuarioService
{
    public function __construct(
        private readonly UserRepository $userRepository
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function listar(): Collection
    {
        return $this->userRepository->todosOrdenadosPorId()->map(fn (User $u) => $this->serializar($u));
    }

    /**
     * @return array<string, mixed>|null
     */
    public function actualizarRol(int $id, string $rol): ?array
    {
        $usuario = $this->userRepository->findById($id);

        if ($usuario === null) {
            return null;
        }

        $this->userRepository->actualizar($usuario, ['rol' => $rol]);

        return $this->serializar($usuario->fresh());
    }

    /**
     * @return array<string, mixed>
     */
    private function serializar(User $user): array
    {
        return [
            'id' => $user->id,
            'nombre' => $user->name,
            'correo' => $user->email,
            'telefono' => $user->telefono,
            'fecha_nacimiento' => $user->fecha_nacimiento->format('Y-m-d'),
            'genero' => $user->genero,
            'rol' => $user->rol ?? 'cliente',
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}
