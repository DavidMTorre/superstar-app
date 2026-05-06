<?php

namespace Database\Seeders;

use App\Models\Combo;
use App\Models\ProductoConfiteria;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        foreach (['Sala 1', 'Sala 2', 'Sala 3'] as $nombre) {
            Sala::query()->firstOrCreate(
                ['nombre' => $nombre],
                ['estado' => 'disponible']
            );
        }

        User::factory()->admin()->create([
            'name' => 'Administrador',
            'email' => 'admin@minicine.test',
            'password' => 'password',
        ]);

        User::factory()->create([
            'name' => 'Cliente Demo',
            'email' => 'cliente@minicine.test',
            'password' => 'password',
        ]);

        $snacks = [
            ['nombre' => 'Popcorn mediano', 'descripcion' => 'Maíz con mantequilla', 'precio' => 12.00],
            ['nombre' => 'Gaseosa 600 ml', 'descripcion' => 'Bebida fría', 'precio' => 8.50],
            ['nombre' => 'Nachos con queso', 'descripcion' => 'Porción para compartir', 'precio' => 15.00],
            ['nombre' => 'Snack mix', 'descripcion' => 'Mix surtido', 'precio' => 9.00],
        ];

        foreach ($snacks as $row) {
            ProductoConfiteria::query()->firstOrCreate(
                ['nombre' => $row['nombre']],
                [
                    'descripcion' => $row['descripcion'],
                    'precio' => $row['precio'],
                    'imagen_url' => null,
                    'estado' => 'disponible',
                    'metadata' => $row['metadata'] ?? null,
                ]
            );
        }

        $pop = ProductoConfiteria::query()->where('nombre', 'Popcorn mediano')->first();
        $beb = ProductoConfiteria::query()->where('nombre', 'Gaseosa 600 ml')->first();
        if ($pop !== null && $beb !== null) {
            $combo = Combo::query()->firstOrCreate(
                ['nombre' => 'Pack pareja'],
                [
                    'precio' => 18.00,
                    'estado' => 'disponible',
                ]
            );
            $combo->productos()->sync([
                $pop->id => ['cantidad' => 1],
                $beb->id => ['cantidad' => 1],
            ]);
        }
    }
}
