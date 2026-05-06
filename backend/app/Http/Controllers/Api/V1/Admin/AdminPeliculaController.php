<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StorePeliculaRequest;
use App\Http\Requests\Api\V1\Admin\UpdatePeliculaRequest;
use App\Services\AdminPeliculaService;
use Illuminate\Http\JsonResponse;

class AdminPeliculaController extends Controller
{
    public function index(AdminPeliculaService $service): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => [
                'peliculas' => $service->listar()->values()->all(),
            ],
        ]);
    }

    public function store(StorePeliculaRequest $request, AdminPeliculaService $service): JsonResponse
    {
        $pelicula = $service->crear($request->validated());

        return response()->json([
            'exito' => true,
            'datos' => ['pelicula' => $pelicula],
            'mensaje' => 'Película creada correctamente.',
        ], 201);
    }

    public function update(UpdatePeliculaRequest $request, int $id, AdminPeliculaService $service): JsonResponse
    {
        $pelicula = $service->actualizar($id, $request->validated());

        if ($pelicula === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Película no encontrada.',
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['pelicula' => $pelicula],
            'mensaje' => 'Película actualizada correctamente.',
        ]);
    }

    public function destroy(int $id, AdminPeliculaService $service): JsonResponse
    {
        $resultado = $service->eliminar($id);

        if (! $resultado['ok']) {
            if (($resultado['codigo'] ?? '') === 'no_encontrada') {
                return response()->json([
                    'exito' => false,
                    'mensaje' => 'Película no encontrada.',
                ], 404);
            }

            return response()->json([
                'exito' => false,
                'mensaje' => 'No se puede eliminar: existen reservas asociadas a esta película.',
            ], 409);
        }

        return response()->json([
            'exito' => true,
            'mensaje' => 'Película eliminada correctamente.',
        ]);
    }
}
