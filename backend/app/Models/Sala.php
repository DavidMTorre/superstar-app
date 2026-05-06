<?php

namespace App\Models;

use Database\Factories\SalaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sala extends Model
{
    /** @use HasFactory<SalaFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'estado',
        'precio',
        'tiempo_limpieza',
        'hora_apertura',
        'hora_cierre',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'tiempo_limpieza' => 'integer',
        ];
    }

    /**
     * @return HasMany<Reserva, $this>
     */
    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    /**
     * Horarios de atención por día de la semana (0=domingo … 6=sábado).
     *
     * @return HasMany<SalaHorario, $this>
     */
    public function horarios(): HasMany
    {
        return $this->hasMany(SalaHorario::class);
    }
}
