@extends('layouts.app')
<div class="row">
    <div class="col-12">
        <button onclick="generarpdf()">Crear pdf</button>
    </div>
</div>
<div class="row">
    <div class="col-10 offset-1"  id="content">
        @foreach($tickets as $ticket)
            <div class="row my-2 ticket " >
    <div class="col-12">
    <div class="row"><div class="col-4 qr">
        <div class="visible-print text-center">





{!!  QrCode::size(150)->generate($ticket['id']) !!}
    
</div>
    </div>
    <div  class="col-8 text-center my-auto fondo-entrada" style="background-image: url({{$ticket->diseno}});">
        <h1 class="d-block fs-1">{{$evento->nombre}}</h1>
        <h2 class="d-block fs-3 text-danger">{{$evento->descripcion}}</h2>

        <h4 class="d-block fs-5">{{$evento->fecha}}</h4>
</div></div>
                
    </div>

        
    </div>
    @endforeach
</div>

<div id="elementH"></div>

<style>
    .ticket{
        border: solid 3px gray;
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

 function generarpdf(){
    
    var element = document.getElementById('content');
    html2pdf(element);

 }
</script>