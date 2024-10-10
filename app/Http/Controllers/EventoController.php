<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Models\Evento;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\Entrada;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
class EventoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user=Auth::user();
      
        $eventos=Evento::all()->where('user_id','==',$user->id);
        
        return view('auth.eventos',['eventos'=>$eventos]);
    }

    public function lector()
    {
        $loginUserData = Auth::user();

        $user = User::where('email',$loginUserData->email)->first();
        $token = $user->createToken($user->name.'-AuthToken')->plainTextToken;
 

        return view('auth.lector',['token' => $token
    ]);
    }
    public function escaneadas()
    {
        $entradas=DB::select('select * from entradas where ingreso = ?', [1]);   
        return response()->json(['entradas'=>$entradas]);
    }
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function verificarticket(Request $request)
    {
        $data=$request->all();
        $id=$data['link_event'];
        $evento=DB::select('select * FROM entradas where id = ?', [$id]);
        if(isset($evento[0]->ingreso) && $evento[0]->ingreso==false){
            $estado=DB::update('update entradas set ingreso = true, hora_ingreso=? where id = ?', [Carbon::now(),$id]);
            $message='EXCELENTE... Entrada válida! Proceda!';
        }else{
            $message='UUUUPPPS... entrada ya ingresada o invalida';
            $estado=false;
        }

        $evento=DB::select('select * FROM entradas where id = ?', [$id]);
        return response()->json(["response"=>$evento,"estado"=>$estado,'message'=>$message],200);
    }



    public function verUno(Request $request,$evento)
    {
        $user=Auth::user();
      
        $eventoconsulta=DB::select('select * FROM eventos where id = ? and user_id=?', [$evento,$user->id]);

        $evento=$eventoconsulta[0];
        $entradas=DB::select('select * FROM entradas where evento_id = ?', [$evento->id]);        
        $ingresados=DB::select('select * FROM entradas where evento_id = ? and ingreso=1', [$evento->id]);        
        $noingresados=DB::select('select * FROM entradas where evento_id = ? and ingreso=0', [$evento->id]);        
        $noingresados=$noingresados;
        return view('auth.evento',["evento"=>$evento,"entradas"=>$entradas,"ingresados"=>$ingresados,"noingresados"=>$noingresados]);
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
     
        $evento=DB::select('select * from eventos where id = ?', [$data['crearEntradaId']]);

        $contador=0;
        $html='';
   
        if($request->file('photo')){

            $file = $request->file('photo');
            $filename=$file->getClientOriginalName();
            $path = $file->store('public/eventos/'.$data['crearEntradaId']);
            $logourl = 'https://tickets.estarweb.com.ar/'.Storage::url($path);

    }else{
        $logourl = '';
        $path='';

    }
         
        $tickets=[];

        while($data['cantidad']>$contador){
             $dataEntrada['evento_id']=$data['crearEntradaId'];
            $dataEntrada['type']='digital';
            $dataEntrada['type_ticket']='evento';
            $dataEntrada['diseno']=$logourl;
            $entradacreada=Entrada::create($dataEntrada);
            $tickets[]=$entradacreada;
            $contador=$contador+1;
    
        }
        return view('tickets',['tickets'=>$tickets,'dataEntrada'=>$dataEntrada,'evento'=>$evento[0]]);
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
