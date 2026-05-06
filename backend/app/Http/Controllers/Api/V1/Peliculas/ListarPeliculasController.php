<?php

namespace App\Http\Controllers\Api\V1\Peliculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Peliculas\ListarPeliculasRequest;
use App\Services\PeliculaService;
use Illuminate\Http\JsonResponse;

class ListarPeliculasController extends Controller
{
    public function __invoke(ListarPeliculasRequest $request, PeliculaService $service): JsonResponse
    {
        $v = $request->validated();
        $buscar = isset($v['buscar']) ? trim((string) $v['buscar']) : '';
        $categoria = isset($v['categoria']) ? trim((string) $v['categoria']) : '';

        if ($buscar === '' && $categoria === '') {
            return response()->json([
                'exito' => true,
                'datos' => $service->obtenerCarteleraDestacada(),
                'mensaje' => 'Cartelera obtenida correctamente',
            ]);
        }

        $filtros = [];
        if ($buscar !== '') {
            $filtros['buscar'] = $buscar;
        }
        if ($categoria !== '') {
            $filtros['categoria'] = $categoria;
        }

        return response()->json([
            'exito' => true,
            'datos' => $service->listarPeliculas($filtros),
            'mensaje' => 'Películas obtenidas correctamente',
        ]);
    }
}
