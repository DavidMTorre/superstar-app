<?php

namespace Database\Factories;

use App\Models\Pelicula;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pelicula>
 */
class PeliculaFactory extends Factory
{
    protected $model = Pelicula::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titulo' => fake()->sentence(3),
            'descripcion' => fake()->paragraph(),
            'categoria' => fake()->randomElement(['Acción', 'Drama', 'Comedia', 'Ciencia ficción']),
            'duracion' => fake()->numberBetween(70, 200),
            'imagen_url' => fake()->optional()->imageUrl(),
            'estado' => 'disponible',
            'metadata' => null,
        ];
    }

    public function noDisponible(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'no_disponible',
        ]);
    }
}
