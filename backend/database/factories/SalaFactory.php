<?php

namespace Database\Factories;

use App\Models\Sala;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sala>
 */
class SalaFactory extends Factory
{
    protected $model = Sala::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => 'Sala '.fake()->unique()->numberBetween(1, 99),
            'estado' => 'disponible',
            'precio' => fake()->randomFloat(2, 8, 80),
            'tiempo_limpieza' => 15,
        ];
    }

    public function inactiva(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'inactiva',
        ]);
    }
}
