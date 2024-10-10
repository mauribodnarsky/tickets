<?php
use App\Http\Controllers\EventoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserAuthController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});



Route::post('register',[UserAuthController::class,'register']);
Route::post('login',[UserAuthController::class,'login']);
Route::post('logout',[UserAuthController::class,'logout'])
  ->middleware('auth:sanctum');
  Route::post('/marcardescargada', [EventoController::class, 'descargarEntradaApi'])->middleware(['auth:sanctum']);

  Route::get('/escaneadas', [EventoController::class, 'escaneadas'])->middleware(['auth:sanctum']);

Route::post('/verifyticket', [EventoController::class, 'verificarticket'])->middleware(['auth:sanctum']);
