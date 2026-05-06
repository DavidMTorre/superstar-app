<?php

namespace App\Http\Controllers\Api\V1\Peliculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Peliculas\BuscarPeliculasRequest;
use App\Services\PeliculaService;
use Illuminate\Http\JsonResponse;

class BuscarPeliculasController extends Controller
{
    public function __invoke(BuscarPeliculasRequest $request, PeliculaService $peliculaService): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => $peliculaService->buscar($request->filtrosBusqueda()),
            'mensaje' => 'Búsqueda realizada correctamente',
        ]);
    }
}
