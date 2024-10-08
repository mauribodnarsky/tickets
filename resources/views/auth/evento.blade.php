@extends('layouts.app')

<div class="container">
    <div class="row justify-content-center">
        <div class="col-10 offset-1">
        <h2 class="text-start">EVENTO {{$evento->nombre}}</h2>
        <h5>CANTIDAD DE ENTRADAS GENERADAS: {{sizeof($entradas)}}</h5>
                <h5>CANTIDAD DE ENTRADAS INGRESADAS: {{sizeof($ingresados)}}</h5>
                <h5>CANTIDAD DE ENTRADAS SIN INGRESAR: {{sizeof($noingresados)}}</h5>

 
    </div>
</div>
</div>


<div class="row">
    <div class="col-10 offset-1">
        @foreach($entradas as $ticket)
        <div class="row" id="ticket{{$ticket->id}}"  onclick="generarticket('{{$ticket->id}}')" > 
          <div class="col-12">
            <div class="row my-2 ticket  "  style="background-image: url({{$ticket->diseno}});">
    <div class="col-12">
    <div class="row"><div class="col-4 qr fondo-entrada">
        <div class="visible-print text-center">





{!!  QrCode::size(150)->generate($ticket->id) !!}
    
</div>
    </div>
    <div  class="col-8 text-center my-auto ">
        <h1 class="d-block fs-1">{{$evento->nombre}}</h1>
        <h2 class="d-block fs-3 text-danger">{{$evento->descripcion}}</h2>

        <h4 class="d-block fs-5">{{$evento->fecha}}</h4>
</div></div>
                
    </div>

        
    </div>
    
    </div>

        
    </div>
    @endforeach
</div>

<div id="elementH"></div>

<style>
    .ticket{
        border: solid 5px lightgray;
        margin-bottom: 10px;
    }
    .qr{
        padding: 2em 0em;

        border-right: dashed 2px goldenrod;
    }
    .fondo-entrada{
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }
</style>

<!-- jQuery library -->
<script
  src="https://code.jquery.com/jquery-3.7.1.js"
  integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="
  crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>

 function generarticket(element){
   var  elementhtml=document.getElementById("ticket"+element)
   console.log(elementhtml)
   var opt = {
  filename:     "{{$evento->nombre}}.pdf",
};

var entrada=html2pdf(elementhtml,opt);
 }
</script>