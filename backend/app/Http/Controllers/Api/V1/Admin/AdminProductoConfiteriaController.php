<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\PatchProductoConfiteriaEstadoRequest;
use App\Http\Requests\Api\V1\Admin\StoreProductoConfiteriaRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProductoConfiteriaRequest;
use App\Services\AdminProductoConfiteriaService;
use Illuminate\Http\JsonResponse;

class AdminProductoConfiteriaController extends Controller
{
    public function index(AdminProductoConfiteriaService $service): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'datos' => [
                'productos' => $service->listar()->values()->all(),
            ],
            'mensaje' => 'Listado de productos.',
        ]);
    }

    public function store(StoreProductoConfiteriaRequest $request, AdminProductoConfiteriaService $service): JsonResponse
    {
        $producto = $service->crear($request->validated());

        return response()->json([
            'exito' => true,
            'datos' => ['producto' => $producto],
            'mensaje' => 'Producto creado correctamente.',
        ], 201);
    }

    public function update(UpdateProductoConfiteriaRequest $request, int $id, AdminProductoConfiteriaService $service): JsonResponse
    {
        $producto = $service->actualizar($id, $request->validated());

        if ($producto === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Producto no encontrado.',
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['producto' => $producto],
            'mensaje' => 'Producto actualizado correctamente.',
        ]);
    }

    public function destroy(int $id, AdminProductoConfiteriaService $service): JsonResponse
    {
        $resultado = $service->eliminar($id);

        if (! $resultado['ok']) {
            /** @var array{ok: false, mensaje: string, codigo_http: int} $resultado */
            return response()->json([
                'exito' => false,
                'mensaje' => $resultado['mensaje'],
            ], $resultado['codigo_http']);
        }

        return response()->json([
            'exito' => true,
            'datos' => null,
            'mensaje' => 'Producto eliminado correctamente.',
        ]);
    }

    public function cambiarEstado(PatchProductoConfiteriaEstadoRequest $request, int $id, AdminProductoConfiteriaService $service): JsonResponse
    {
        $estado = (string) $request->validated('estado');
        $producto = $service->cambiarEstado($id, $estado);

        if ($producto === null) {
            return response()->json([
                'exito' => false,
                'mensaje' => 'Producto no encontrado.',
            ], 404);
        }

        return response()->json([
            'exito' => true,
            'datos' => ['producto' => $producto],
            'mensaje' => 'Estado del producto actualizado.',
        ]);
    }
}
