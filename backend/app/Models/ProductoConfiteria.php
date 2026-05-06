<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductoConfiteria extends Model
{
    protected $table = 'productos_confiteria';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
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
            'precio' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    /**
     * @return HasMany<ReservaProducto, $this>
     */
    public function reservaProductos(): HasMany
    {
        return $this->hasMany(ReservaProducto::class, 'producto_id');
    }

    /**
     * @return BelongsToMany<Combo, $this>
     */
    public function combos(): BelongsToMany
    {
        return $this->belongsToMany(
            Combo::class,
            'combo_productos',
            'producto_confiteria_id',
            'combo_id'
        )->withPivot('cantidad');
    }
}
