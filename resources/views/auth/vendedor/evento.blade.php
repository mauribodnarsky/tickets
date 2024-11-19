@extends('layouts.app')

    <div class="row justify-content-center h-25" style="background-image: url({{$evento->diseno}});background-repeat:no-repeat;background-size:contain;background-attachment:fixed;">
        <div class="col-10 offset-1">
        <h2 class="text-start retro-team">{{$evento->nombre}}</h2>
      
    </div>
</div>
</div>
<div class="row mt-2">
    <div class="col-6 col-md-4 my-2 caja-reportes text-center ">
    <h5 class="retro-team my-2">TICKETS DIGITALES VENDIDOS</h5>
    <H6 class="all-ages">{{sizeof($entradas)}}</H6>
    </div>
    <div class="col-6 col-md-4 my-2 caja-reportes text-center">
    <h5 class="retro-team my-2">TICKETS DIGITALES VENDIDOS</h5>
    <H6 class="all-ages">{{sizeof($entradas)}}</H6>
    </div>
    <div class="col-6 col-md-4 my-2 caja-reportes text-center">
    <h5 class="retro-team my-2">TICKETS DIGITALES VENDIDOS</h5>
    <H6 class="all-ages">{{sizeof($entradas)}}</H6>
    </div>
    <div class="col-6 col-md-4 my-2 caja-reportes text-center">
    <h5 class="retro-team my-2">TICKETS DIGITALES VENDIDOS</h5>
    <H6 class="all-ages">{{sizeof($entradas)}}</H6>
    </div>
</div>

<div class="row">
    <div class="col-10 offset-1">
        @foreach($entradas as $ticket)
        <div class="row" id="ticket{{$ticket->id}}"   > 
          <div class="col-12">
            <div class="row my-2 ticket  "  >
    <div class="col-12">
    <div class="row"  >
    <div  class="col-12 text-center  my-auto event-info align-items-center py-1 " style="background-image: url('{{$ticket->diseno}}');background-size: cover;background-position:center;" >
        
        <h1 class="d-block fs-1 text-white">{{$evento->nombre}}</h1>
        <h2 class="d-block fs-3 text-white">{{$evento->descripcion}}</h2>

        <h4 class="d-block fs-5 text-white">{{$evento->fecha}}</h4>
    </div>
            <div class="col-12 qr  fondo-entrada  ">
        <div class="visible-print text-center mt-2  ">





{!!  QrCode::generate($ticket->id) !!}
    
</div>
#000000{{$ticket->id}}
    </div>

    </div>
                
    </div>

        
    </div>
    
    </div>

        
    </div>
    <div class="row">
        <div class="col-12 text-center">
            <button class="w-25 btn btn-primary" id="btndescarga{{$ticket->id}}" onclick="generarticket('{{$evento->id}}','{{$ticket->id}}')">Descargar</button>
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
    
    .fondo-entrada{
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }
    .visible-print svg{
        width:90% !important;
        height:auto !important;
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
    alert("despues de descargar una entrada descarga para ver las que quedan disponibles")
      var  botondescarga=document.getElementById("btndescarga"+element)
    botondescarga.remove()
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
            body: JSON.stringify({ entrada_id: element })
        })
        .then(response => response.json())
        .then(data => {
          })
             .catch(error => {
            alert('Error:', error);
        });
            html2pdf().set(opt).from(elementhtml).save();

    };

</script>