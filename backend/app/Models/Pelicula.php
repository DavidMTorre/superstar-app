<?php

namespace App\Models;

use Database\Factories\PeliculaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pelicula extends Model
{
    /** @use HasFactory<PeliculaFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'titulo',
        'descripcion',
        'categoria',
        'duracion',
        'imagen_url',
        'estado',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}
