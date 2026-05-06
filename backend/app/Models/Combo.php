<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Combo extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'precio',
        'estado',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsToMany<ProductoConfiteria, $this>
     */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductoConfiteria::class,
            'combo_productos',
            'combo_id',
            'producto_confiteria_id'
        )->withPivot('cantidad');
    }
}
