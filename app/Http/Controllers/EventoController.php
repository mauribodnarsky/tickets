<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Entrada;

class EventoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $eventos=Evento::all();
        
        return view('auth.eventos',['eventos'=>$eventos]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

        $data=$request->all();
        $data['user_id']=Auth::user()->id;
        $event=Evento::create($data);
        $eventos=Evento::all();
        return redirect('eventos');
    }
    public function delete(Request $request)
    {

        $data=$request->all();
        $event=Evento::deleted($data['id']);
        DB::delete('delete from eventos where id = ?', [$data['id']]);
        return redirect('eventos');
    }
    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function show(Evento $evento)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function edit(Evento $evento)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function creartickets(Request $request)
    {
        $data=$request->all();
        $file = $request->file('photo');
        $evento=DB::select('select * from eventos where id = ?', [$data['crearEntradaId']]);
        
        $contador=0;
        $html='';
        $value = "tickets.estarweb.com.ar/".$data['crearEntradaId'].'/event/'.$contador;
        Storage::makeDirectory('eventos/'.$data['crearEntradaId'].'/');
        $r=Storage::makeDirectory('eventos/'.$data['crearEntradaId'].'/tickets/');
$path = Storage::put('eventos/'.$data['crearEntradaId'], $file);
dd($path);
Storage::move(path, public_path('eventos/'.$data['crearEntradaId']);
$path=$path->move(public_path('eventos/'.$data['crearEntradaId']));
$tickets=[];


        while($data['cantidad']>$contador){
            QrCode::size(500)
            ->format('png')
            ->generate($value, storage_path('app/eventos/'.$data['crearEntradaId'].'/tickets/'.$contador.'.png'));
            $dataEntrada['evento_id']=$data['crearEntradaId'];
            $dataEntrada['type']='digital';
            $dataEntrada['type_ticket']='evento';
            $dataEntrada['diseno']= 'eventos/'.$data['crearEntradaId'].'/'.$file->getClientOriginalName();
            $entradacreada=Entrada::create($dataEntrada);
            $tickets[]=$entradacreada;
$contador=$contador+1;

        }

       $e= Pdf :: loadHTML ($html )-> setPaper ( ' a4 ' , ' horizontal ' )-> save ( storage_path('app/eventos/'.$data['crearEntradaId'].'/'.'fileprint.pdf ' ));
        $archivo=storage_path('app/eventos/'.$data['crearEntradaId'].'/'.'fileprint.pdf');
        return view('tickets',['archivo'=>$archivo,'tickets'=>$tickets,'dataEntrada'=>$dataEntrada,'data'=>$dataEntrada]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function destroy(Evento $evento)
    {
        //
    }
    public function generateQRCode()
{
$value = "estarweb.com.ar";
QrCode::size(500)
            ->format('png')
            ->generate($value, storage_path('app/eventos/1/tickets/qrcode.png'));
    return view('qrCode');
}
}
