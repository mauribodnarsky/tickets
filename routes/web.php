<?php

use App\Http\Controllers\EventoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('auth.login');
});
Route::post('/eventos', [EventoController::class, 'store'])->middleware(['auth'])->name('eventos.store');
Route::get('/eventos', [EventoController::class, 'index'])->middleware(['auth'])->name('eventos.index');
Route::get('/lector', [EventoController::class, 'lector'])->middleware(['auth'])->name('eventos.lector');
Route::get('verevento/{evento}', [EventoController::class, 'verUno'])->middleware(['auth']);

Route::post('/borrar', [EventoController::class, 'delete'])->middleware(['auth'])->name('eventos.delete');
Route::post('/creartickets', [EventoController::class, 'creartickets'])->middleware(['auth'])->name('eventos.creartickets');
Route::post('/enviartickets', [EventoController::class, 'enviartickets'])->middleware(['auth'])->name('eventos.enviartickets');
Route::post('/asignarvendedor', [EventoController::class, 'asignarvendedor'])->middleware(['auth'])->name('eventos.asignarvendedor');

Route::get('/dashboard', [EventoController::class, 'index'])->middleware(['auth'])->name('eventos.index');

Route::controller(EventoController::class)->group(function () {
    Route::get('/generateqrcode', 'generateQRCode')->middleware(['auth'])->name('generateqrcode');
});

require __DIR__.'/auth.php';
