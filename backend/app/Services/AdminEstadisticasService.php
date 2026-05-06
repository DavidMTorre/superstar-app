<?php

namespace App\Services;

use App\Models\Pago;
use App\Repositories\ReservaRepository;
use App\Repositories\UserRepository;

class AdminEstadisticasService
{
    public function __construct(
        private readonly ReservaRepository $reservaRepository,
        private readonly UserRepository $userRepository
    ) {}

    /**
     * @return array{total_reservas: int, total_ingresos: string, total_usuarios: int}
     */
    public function resumen(): array
    {
        $ingresos = Pago::query()
            ->where('estado', 'pagado')
            ->sum('monto');

        return [
            'total_reservas' => $this->reservaRepository->contarTotal(),
            'total_ingresos' => number_format((float) $ingresos, 2, '.', ''),
            'total_usuarios' => $this->userRepository->contar(),
        ];
    }
}
