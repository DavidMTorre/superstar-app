<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ($user->rol ?? 'cliente') !== 'admin') {
            return response()->json([
                'exito' => false,
                'mensaje' => 'No autorizado para acceder al panel de administración.',
            ], 403);
        }

        return $next($request);
    }
}
