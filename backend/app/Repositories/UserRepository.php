<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Collection;

class UserRepository
{
    /**
     * @param  array{name: string, email: string, password: string, telefono: string, fecha_nacimiento: string, genero: string, rol?: string}  $attributes
     */
    public function create(array $attributes): User
    {
        return User::query()->create($attributes);
    }

    public function findByEmail(string $email): ?User
    {
        return User::query()->where('email', $email)->first();
    }

    public function findById(int $id): ?User
    {
        return User::query()->find($id);
    }

    /**
     * @return Collection<int, User>
     */
    public function todosOrdenadosPorId(): Collection
    {
        return User::query()->orderBy('id')->get();
    }

    public function actualizar(User $user, array $attributes): void
    {
        $user->fill($attributes);
        $user->save();
    }

    public function contar(): int
    {
        return User::query()->count();
    }
}
