@extends('layouts.app')

<div class="container">
    <div class="row justify-content-center">
        <div class="col-10 offset-1">
        <h2 class="text-start">EVENTO {{$evento->nombre}}</h2>
        <h5>CANTIDAD DE ENTRADAS GENERADAS: {{sizeof($entradas)}}</h5>
        <h5>CANTIDAD DE ENTRADAS DESCARGADAS: {{sizeof($descargadas)}}</h5>

        <h5>CANTIDAD DE ENTRADAS INGRESADAS: {{sizeof($ingresados)}}</h5>
                <h5>CANTIDAD DE ENTRADAS SIN INGRESAR: {{sizeof($noingresados)}}</h5>

 
    </div>
</div>
</div>


<div class="row">
    <div class="col-10 offset-1">
        @foreach($entradas as $ticket)
        <div class="row" id="ticket{{$ticket->id}}"   > 
          <div class="col-12">
            <div class="row my-2 ticket  "  >
    <div class="col-12">
    <div class="row">
        <div class="col-12 qr  fondo-entrada h-50">
        <div class="visible-print text-center">





{!!  QrCode::generate($ticket->id) !!}
    
</div>
    </div>
    <div  class="col-12 text-center tezt-warning my-auto event-info align-items-center " style="background-image: url('{{$ticket->diseno}}');background-size: cover;background-position:center;" >
        <h1 class="d-block fs-1">{{$evento->nombre}}</h1>
        <h2 class="d-block fs-3 text-danger">{{$evento->descripcion}}</h2>

        <h4 class="d-block fs-5">{{$evento->fecha}}</h4>
    </div>
    </div>
                
    </div>

        
    </div>
    
    </div>

        
    </div>
    <div class="row">
        <div class="col-12 text-center">
            <button class="w-25 btn btn-primary" onclick="generarticket('{{$evento->id}}','{{$ticket->id}}')">Descargar</button>
        </div>
    </div>
    @endforeach
</div>
<input type="hidden" id="csrftoken" value="{{ csrf_token() }}">
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
    .visible-print svg{
        width:80% !important;
        height:auto !important;
    }
        .event-info{
        height:50vh !important;
    }

</style>

<!-- jQuery library -->
<script
  src="https://code.jquery.com/jquery-3.7.1.js"
  integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="
  crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.1/html2pdf.bundle.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>

 function generarticket(verevento,element){
   var  elementhtml=document.getElementById("ticket"+element)
    var opt = {
            margin: [5, 10, 0.25, 10],
              image:        { type: 'pdf', quality: 0.98 },
              filename:     "{{$evento->nombre}}"+"_ticket"+element+".pdf",
    };
 var csrfToken=document.getElementById("csrftoken").value
    fetch('/api/marcardescargada', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ entrada_id: 123 })
        })
        .then(response => response.json())
        .then(data => {
            html2pdf().set(opt).from(elementhtml).save();
            window.location.href="/verevento/"+verevento
            // Aquí puedes realizar acciones adicionales, como actualizar la interfaz de usuario
        })
             .catch(error => {
            console.error('Error:', error);
        });

    };

</script>