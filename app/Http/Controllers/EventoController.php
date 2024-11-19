<?php

namespace App\Http\Controllers;

use App\Mail\AsignarVendedor;
use App\Mail\EnviarTicketsFisicos;
use App\Mail\TicketMail;
use Illuminate\Support\Facades\DB;
use App\Models\Evento;
USE Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\Entrada;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\VendedorEntrada;
use Illuminate\Support\Facades\Mail;
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
        if($user->rol=='organizador'){
        $eventos=Evento::all()->where('user_id','==',$user->id);
        
        return view('auth.organizador.eventos',['eventos'=>$eventos]);
        }
        if($user->rol=='vendedor'){
            $eventos=[];
            $eventosDelegados=VendedorEntrada::all()->where('email','==',$user->email);
            foreach($eventosDelegados as $eventodelegado){
                $eventos=Evento::all()->where('id','==',$eventodelegado->evento_id);
                
            }
        
        return view('auth.vendedor.eventos',['eventos'=>$eventos]);
        }
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
        $entradas=DB::select('select * from entradas where ingreso = ? ORDER BY hora_ingreso DESC', [1]);   
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
        $encrypt_method = "AES-256-CBC";
		$secret_key = 'lamejorticketeradetodas';
		$secret_iv = 'lamejorticketeradetodasiv';
	
		// hash
		$key = hash('sha256', $secret_key);
		
		// iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
		$iv = substr(hash('sha256', $secret_iv), 0, 16);
	
		$id = openssl_decrypt(base64_decode(str_replace('/', '-',$id)), $encrypt_method, $key, 0, $iv);
		
			
        $evento=DB::select('select * FROM entradas where id = ?', [$id]);
        if(isset($evento[0]->ingreso) && $evento[0]->ingreso==false){
            $estado = DB::update('update entradas set ingreso = true, hora_ingreso=? where id = ?', [Carbon::now(), $id]);
            $message='EXCELENTE... Entrada válida! Proceda!';
        }else{
            $message='UUUUPPPS... entrada ya ingresada o invalida';
            $estado=false;
        }

        $evento=DB::select('select * FROM entradas where id = ?', [$id]);
        return response()->json(["response"=>$evento,"estado"=>$estado,'message'=>$message],200);
    }


    public function descargarEntradaApi(Request $request)
{
    $data=$request->all();
    $entrada=$data['entrada_id'];
    $eventoconsulta=Entrada::where('id', intval($entrada))->update(['descargada' => true]);
    $eventoconsulta=Entrada::where('id', intval($entrada))->get();

  
    return response()->json(["response"=>$eventoconsulta]);
}
    public function verUno($evento)
    {
        $user=Auth::user();
;
      if($user->rol=='organizador'){
        $eventoconsulta=DB::select('select * FROM eventos where id = ? and user_id=? ', [$evento,$user->id]);

        $evento=$eventoconsulta[0];
        $entradas=DB::select('select * FROM entradas where evento_id = ?', [$evento->id]);    
        $vendedores = VendedorEntrada::where('evento_id', $evento->id)->get();
    
        $ticketdigitalesvendidos = Entrada::where('email_vendida','!=', 'NULL')->where('type', "digital")->where('evento_id', $evento->id)->get();
        $ticketdigitalesdisponibles = Entrada::whereNull('email_vendida')->where('type', 'digital')->where('evento_id', $evento->id)->get();
            
        $ticketfisicosvendidos = Entrada::where('email_vendida','!=', 'NULL')->where('type', "fisico")->where('evento_id', $evento->id)->get();
        $ticketfisicosdisponibles = Entrada::whereNull('email_vendida')->where('type', "fisico")->where('evento_id', $evento->id)->get();
    
        $ingresados=DB::select('select * FROM entradas where evento_id = ? and hora_ingreso!=NULL', [$evento->id]);        
        $noingresados=DB::select('select * FROM entradas where hora_ingreso=NULL and evento_id = ?', [$evento->id]);        

        return view('auth.organizador.evento',["vendedores"=>$vendedores,"ticketdigitalesvendidos"=>$ticketdigitalesvendidos,"ticketfisicosvendidos"=>$ticketfisicosvendidos,"ticketfisicosdisponibles"=>$ticketfisicosdisponibles,"ticketdigitalesdisponibles"=>$ticketdigitalesdisponibles, "evento"=>$evento,"entradas"=>$entradas,"ingresados"=>$ingresados,"noingresados"=>$noingresados]);
      }
      if($user->rol=='vendedor'){
        $eventoconsulta=DB::select('select * FROM eventos where id = ?   ', [$evento]);

        $evento=$eventoconsulta[0];
        $entradas=DB::select('select * FROM entradas where evento_id = ?', [$user->id]);    
        return view('auth.vendedor.evento',[ "evento"=>$evento,"entradas"=>$entradas]);
      }
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if($request->file('photo')){

            $file = $request->file('photo');
            $filename=$file->getClientOriginalName();
            $path = $file->store('public/eventos/');
    $logourl = Storage::url($path);

    }else{
        $logourl = '';
        $path='';

    }
        $data=$request->all();
        $data['user_id']=Auth::user()->id;
        $data['diseno']=$logourl;
        $event=Evento::create($data);
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function creartickets(Request $request)
    {
        $data=$request->all();
     
        $evento=Evento::find([$data['crearEntradaId']]);
        $contadorticketdigitales=0;

        $contadorticketfisicos=0;
        $html='';
   
        if($request->file('photo')){

            $file = $request->file('photo');
            $filename=$file->getClientOriginalName();
            $path = $file->store('public/eventos/'.$data['crearEntradaId']);
    $logourl = Storage::url($path);

    }else{
        $logourl = '';
        $path='';

    }
         
        $ticketsfisicos=[];
        $ticketsdigitales=[];

        while($data['cantidad_fisico']>$contadorticketfisicos){
             $dataEntrada['evento_id']=$data['crearEntradaId'];
            $dataEntrada['type']='fisico';
            $dataEntrada['type_ticket']='general';
            $dataEntrada['diseno']=$logourl;
            $entradacreada=Entrada::create($dataEntrada);
            $ticketsfisicos[]=$entradacreada;
            $contadorticketfisicos=$contadorticketfisicos+1;
    
        }
        while($data['cantidad_digital']>$contadorticketdigitales){
            $dataEntrada['evento_id']=$data['crearEntradaId'];
           $dataEntrada['type']='digital';
           $dataEntrada['type_ticket']='general';
           $dataEntrada['diseno']=$logourl;
           $entradacreada=Entrada::create($dataEntrada);
           $ticketsdigitales[]=$entradacreada;
           $contadorticketdigitales=$contadorticketdigitales+1;
       }
       $user=Auth::user();
       
       Mail::to($user->email)->send(new EnviarTicketsFisicos($ticketsfisicos,$evento[0]));

       redirect('https://tickets.estarweb.com.ar/verevento/'.$evento[0]->id);

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
    public function enviartickets(Request $request)
    {
        $data=$request->all();
     
    $id=$data['evento_id'];
    $evento = Evento::find($id);
    $ticketdigitalesvendidos = Entrada::whereNull('email_vendida')->where('type', $data['type'])->where('evento_id', $evento->id)->get();
    $ticket=$ticketdigitalesvendidos[0];
    $ticket->email_vendida=$data['email'];
    $ticket->save();
    
    $secretKey = "entradalalalalalsfofk";
    $ticket->id =  str_replace('/', '-',openssl_encrypt($ticket->id, 'AES-256-CBC', $secretKey));

    Mail::to($data['email'])->send(new TicketMail($ticket,$evento));
    
}


public function asignarvendedor(Request $request)
{
    $data=$request->all();
$evento_id=$data['asignarVendedorId'];

$email=$data['email'];
$limite_venta=$data['cantidad'];
$evento = Evento::find($evento_id);
$existe_usuario=DB::select('select * from users where email = ? AND rol="vendedor"', [$email]);
if(sizeof($existe_usuario)>0){
    DB::insert('insert into vendedores_entradas values  (NULL,?,?,0,?,?,CURRENT_TIMESTAMP(),CURRENT_TIMESTAMP()) ',[$existe_usuario[0]->id,$evento_id,$email,$limite_venta]);
}
if(sizeof($existe_usuario)==0){
    DB::insert('insert into vendedores_entradas  values (NULL, NULL,?,0,?,?,CURRENT_TIMESTAMP(),CURRENT_TIMESTAMP())',[$evento_id,$email,$limite_venta]);
}
redirect('https://tickets.estarweb.com.ar/verevento/'.$evento_id);

//Mail::to($data['email'])->send(new AsignarVendedor($evento));

}
}
