<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminReservaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReservaController extends Controller
{
    public function index(Request $request, AdminReservaService $service): JsonResponse
    {
        $estadoReserva = $request->query('estado_reserva');
        $estadoReserva = is_string($estadoReserva) ? $estadoReserva : null;

        $estadoPago = $request->query('estado_pago');
        $estadoPago = is_string($estadoPago) ? $estadoPago : null;

        $fechaDesde = $request->query('fecha_desde');
        $fechaDesde = is_string($fechaDesde) ? $fechaDesde : null;

        $fechaHasta = $request->query('fecha_hasta');
        $fechaHasta = is_string($fechaHasta) ? $fechaHasta : null;

        return response()->json([
            'exito' => true,
            'datos' => [
                'reservas' => $service->listar($estadoReserva, $estadoPago, $fechaDesde, $fechaHasta)->values()->all(),
            ],
        ]);
    }
}
