<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservaProducto extends Model
{
    protected $table = 'reserva_productos';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'reserva_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'subtotal',
        'origen',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'precio_unitario' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Reserva, $this>
     */
    public function reserva(): BelongsTo
    {
        return $this->belongsTo(Reserva::class);
    }

    /**
     * @return BelongsTo<ProductoConfiteria, $this>
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(ProductoConfiteria::class, 'producto_id');
    }
}
