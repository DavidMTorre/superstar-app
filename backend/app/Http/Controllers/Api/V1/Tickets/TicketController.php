<?php

namespace App\Http\Controllers\Api\V1\Tickets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Tickets\ValidarTicketRequest;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class TicketController extends Controller
{
    public function show(string $token, TicketService $ticketService): JsonResponse
    {
        $payload = $ticketService->obtenerTicketPublico($token);

        if ($payload === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Ticket no encontrado',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'exito' => true,
            'datos' => $payload,
        ]);
    }

    public function validar(ValidarTicketRequest $request, TicketService $ticketService): JsonResponse
    {
        $resultado = $ticketService->validarParaEmpleado($request->datosValidacion()['token_qr']);

        return response()->json([
            'exito' => $resultado['exito'],
            'mensaje' => $resultado['mensaje'],
            'datos' => $resultado['datos'],
        ], $resultado['codigo_http']);
    }
}
