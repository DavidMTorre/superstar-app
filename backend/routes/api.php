<?php

use App\Http\Controllers\Api\V1\Auth\InvitadoController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\RegistroController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Peliculas\BuscarPeliculasController;
use App\Http\Controllers\Api\V1\Salas\ListarSalasPublicasController;
use App\Http\Controllers\Api\V1\Peliculas\ListarPeliculasController;
use App\Http\Controllers\Api\V1\Accesos\ValidarAccesoController;
use App\Http\Controllers\Api\V1\Tickets\TicketController;
use App\Http\Controllers\Api\V1\Admin\AdminComboController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminEstadisticasController;
use App\Http\Controllers\Api\V1\Admin\AdminPeliculaController;
use App\Http\Controllers\Api\V1\Admin\AdminReservaController;
use App\Http\Controllers\Api\V1\Admin\AdminSalaController;
use App\Http\Controllers\Api\V1\Admin\AdminSalaHorarioController;
use App\Http\Controllers\Api\V1\Admin\AdminProductoConfiteriaController;
use App\Http\Controllers\Api\V1\Admin\AdminUsuarioController;
use App\Http\Controllers\Api\V1\Pagos\RealizarPagoController;
use App\Http\Controllers\Api\V1\Perfil\PerfilController;
use App\Http\Controllers\Api\V1\Confiteria\AgregarProductosConfiteriaController;
use App\Http\Controllers\Api\V1\Confiteria\ListarCombosConfiteriaController;
use App\Http\Controllers\Api\V1\Confiteria\ListarProductosConfiteriaController;
use App\Http\Controllers\Api\V1\Disponibilidad\ListarDisponibilidadController;
use App\Http\Controllers\Api\V1\Reservas\CrearReservaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API REST — prefijo global "api" (bootstrap) + grupo "v1" => /api/v1/*
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class)->name('api.v1.health');

    Route::get('/peliculas/buscar', BuscarPeliculasController::class)->name('api.v1.peliculas.buscar');
    Route::get('/peliculas', ListarPeliculasController::class)->name('api.v1.peliculas.index');

    Route::get('/salas', ListarSalasPublicasController::class)->name('api.v1.salas.index');

    Route::get('/disponibilidad', ListarDisponibilidadController::class)->name('api.v1.disponibilidad.index');

    Route::post('/reservas', CrearReservaController::class)->name('api.v1.reservas.store');

    Route::get('/confiteria/productos', ListarProductosConfiteriaController::class)->name('api.v1.confiteria.productos');
    Route::get('/confiteria/combos', ListarCombosConfiteriaController::class)->name('api.v1.confiteria.combos');
    Route::post('/confiteria/agregar', AgregarProductosConfiteriaController::class)->name('api.v1.confiteria.agregar');

    Route::post('/pagos', RealizarPagoController::class)->name('api.v1.pagos.store');

    Route::post('/tickets/validar', [TicketController::class, 'validar'])
        ->middleware(['auth:sanctum', 'es_admin'])
        ->name('api.v1.tickets.validar');

    Route::get('/tickets/{token}', [TicketController::class, 'show'])
        ->where('token', '.+')
        ->name('api.v1.tickets.show');

    Route::post('/accesos/validar', ValidarAccesoController::class)->name('api.v1.accesos.validar');

    Route::prefix('auth')->group(function (): void {
        Route::post('/registro', RegistroController::class)->name('api.v1.auth.registro');
        Route::post('/login', LoginController::class)->name('api.v1.auth.login');
        Route::post('/invitado', InvitadoController::class)->name('api.v1.auth.invitado');
    });

    Route::prefix('perfil')
        ->middleware('auth:sanctum')
        ->group(function (): void {
            Route::get('/', [PerfilController::class, 'show'])->name('api.v1.perfil.show');
            Route::put('/password', [PerfilController::class, 'updatePassword'])->name('api.v1.perfil.password');
            Route::get('/reservas', [PerfilController::class, 'reservas'])->name('api.v1.perfil.reservas');
        });

    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'es_admin'])
        ->group(function (): void {
            Route::get('/dashboard', AdminDashboardController::class)->name('api.v1.admin.dashboard');
            Route::get('/estadisticas', AdminEstadisticasController::class)->name('api.v1.admin.estadisticas');
            Route::get('/peliculas', [AdminPeliculaController::class, 'index'])->name('api.v1.admin.peliculas.index');
            Route::post('/peliculas', [AdminPeliculaController::class, 'store'])->name('api.v1.admin.peliculas.store');
            Route::put('/peliculas/{id}', [AdminPeliculaController::class, 'update'])->whereNumber('id')->name('api.v1.admin.peliculas.update');
            Route::delete('/peliculas/{id}', [AdminPeliculaController::class, 'destroy'])->whereNumber('id')->name('api.v1.admin.peliculas.destroy');
            Route::get('/reservas', [AdminReservaController::class, 'index'])->name('api.v1.admin.reservas.index');
            Route::get('/usuarios', [AdminUsuarioController::class, 'index'])->name('api.v1.admin.usuarios.index');
            Route::put('/usuarios/{id}/rol', [AdminUsuarioController::class, 'updateRol'])->whereNumber('id')->name('api.v1.admin.usuarios.rol');

            Route::get('/salas', [AdminSalaController::class, 'index'])->name('api.v1.admin.salas.index');
            Route::post('/salas', [AdminSalaController::class, 'store'])->name('api.v1.admin.salas.store');
            Route::put('/salas/{id}', [AdminSalaController::class, 'update'])->whereNumber('id')->name('api.v1.admin.salas.update');
            Route::patch('/salas/{id}/estado', [AdminSalaController::class, 'patchEstado'])->whereNumber('id')->name('api.v1.admin.salas.estado');

            Route::get('/salas/{salaId}/horarios', [AdminSalaHorarioController::class, 'index'])->whereNumber('salaId')->name('api.v1.admin.salas.horarios.index');
            Route::post('/salas/{salaId}/horarios', [AdminSalaHorarioController::class, 'store'])->whereNumber('salaId')->name('api.v1.admin.salas.horarios.store');
            Route::put('/salas/{salaId}/horarios/{horarioId}', [AdminSalaHorarioController::class, 'update'])->whereNumber('salaId')->whereNumber('horarioId')->name('api.v1.admin.salas.horarios.update');
            Route::delete('/salas/{salaId}/horarios/{horarioId}', [AdminSalaHorarioController::class, 'destroy'])->whereNumber('salaId')->whereNumber('horarioId')->name('api.v1.admin.salas.horarios.destroy');

            Route::get('/combos', [AdminComboController::class, 'index'])->name('api.v1.admin.combos.index');
            Route::post('/combos', [AdminComboController::class, 'store'])->name('api.v1.admin.combos.store');
            Route::put('/combos/{id}', [AdminComboController::class, 'update'])->whereNumber('id')->name('api.v1.admin.combos.update');
            Route::delete('/combos/{id}', [AdminComboController::class, 'destroy'])->whereNumber('id')->name('api.v1.admin.combos.destroy');

            Route::prefix('confiteria')->group(function (): void {
                Route::get('/productos', [AdminProductoConfiteriaController::class, 'index'])->name('api.v1.admin.confiteria.productos.index');
                Route::post('/productos', [AdminProductoConfiteriaController::class, 'store'])->name('api.v1.admin.confiteria.productos.store');
                Route::put('/productos/{id}', [AdminProductoConfiteriaController::class, 'update'])->whereNumber('id')->name('api.v1.admin.confiteria.productos.update');
                Route::delete('/productos/{id}', [AdminProductoConfiteriaController::class, 'destroy'])->whereNumber('id')->name('api.v1.admin.confiteria.productos.destroy');
                Route::patch('/productos/{id}/estado', [AdminProductoConfiteriaController::class, 'cambiarEstado'])->whereNumber('id')->name('api.v1.admin.confiteria.productos.estado');
            });

        });
});
