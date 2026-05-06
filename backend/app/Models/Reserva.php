<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reserva extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'codigo_reserva',
        'user_id',
        'guest_id',
        'pelicula_id',
        'sala_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'cantidad_personas',
        'precio_total',
        'estado',
        'metadata',
        'fecha_uso_acceso',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'fecha' => 'date',
            'fecha_uso_acceso' => 'datetime',
            'precio_total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Pelicula, $this>
     */
    public function pelicula(): BelongsTo
    {
        return $this->belongsTo(Pelicula::class);
    }

    /**
     * @return BelongsTo<Sala, $this>
     */
    public function sala(): BelongsTo
    {
        return $this->belongsTo(Sala::class);
    }

    /**
     * @return HasOne<Pago, $this>
     */
    public function pago(): HasOne
    {
        return $this->hasOne(Pago::class);
    }

    /**
     * @return HasMany<ReservaProducto, $this>
     */
    public function reservaProductos(): HasMany
    {
        return $this->hasMany(ReservaProducto::class);
    }
}
