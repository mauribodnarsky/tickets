@extends('layouts.app')

<div class="container">
<div class="row justify-content-center align-items-end h-25" style="background-image: url({{$evento->diseno}});background-repeat:no-repeat;background-size:contain;background-attachment:fixed;">
        <div class="col-12">
        <h2 class="text-start retro-team">{{$evento->nombre}}</h2>
      
    </div>
</div>
<div class="row mt-3">
    <div class="col-12">
        <H1>Vendedores</H1>
    </div>
    <div class="col-6">
    <H2>Email</H2>
    </div>
    <div class="col-3">
    <h2>Entradas vendidas</h2>
    </div>
        <div class="col-3">
        <h2>Estado</h2>
        </div>
    
</div>
@foreach($vendedores as $vendedor)
<div class="row">
    <div class="col-6">
        {{$vendedor->email}}
    </div>
    <div class="col-3">
    {{$vendedor->entradas_vendidas}}
    </div>
    @if($vendedor->user_id==null)
        <div class="col-3">
            Pendiente
        </div>
    @else
        <div class="col-3">
            Activo
        </div>
    
    @endif
</div>
@endforeach

</div>
<div class="row">
      <div class="col-12 col-sm-6 my-1">
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#enviarentradas" data-bs-toggle="modal" onclick="enviarentradasdigitales('{{$evento->nombre}}','{{$evento->id}}')">ENVIAR ENTRADA DIGITAL</button>
              </div>
   
    <div class="col-12 col-sm-6 my-1">
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#enviarentradas" data-bs-toggle="modal" onclick="enviarentradasfisicas('{{$evento->nombre}}','{{$evento->id}}')">ENVIAR ENTRADAS FISICA</button>
              </div>
      </div>

<div class="row mt-2">
    @if(isset($ticketdigitalesvendidos))
    <div class="col-6 col-md-4 my-2 caja-reportes text-center ">
    <h5 class="retro-team my-2">TICKETS DIGITALES VENDIDOS</h5>
    <H6 class="all-ages">{{sizeof($ticketdigitalesvendidos)}}</H6>
    </div>
    @endif
    @if(isset($ticketfisicosvendidos))
    <div class="col-6 col-md-4 my-2 caja-reportes text-center">
    <h5 class="retro-team my-2">TICKETS FISICOS VENDIDOS</h5>
    <H6 class="all-ages">{{sizeof($ticketfisicosvendidos)}}</H6>
    </div>
    @endif
    @if(isset($ticketdigitalesdisponibles))
    
    <div class="col-6 col-md-4 my-2 caja-reportes text-center">
      <div class="row">
        <div class="col-12">
        <h5 class="retro-team my-2">TICKETS DIGITALES DISPONIBLES</h5>
    <H6 class="all-ages">{{sizeof($ticketdigitalesdisponibles)}}</H6>
   
        </div>
      </div>
    
   
    </div>
    </div>
    @endif
    @if(isset($ticketfisicosdisponibles))
    
    <div class="col-6 col-md-4 my-2 caja-reportes text-center">
    <h5 class="retro-team my-2">TICKETS FISICOS VENDIDOS</h5>
    <H6 class="all-ages">{{sizeof($ticketfisicosdisponibles)}}</H6>
    </div>
    @endif
</div>
</div>

<!-- Modal -->
<div class="modal fade" id="enviarentradas" tabindex="-1" aria-labelledby="enviarentradasLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="enviarentradasLabel">ENVIAR TICKETS</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form method="POST" action="{{ route('eventos.enviartickets')}}"   >
            @csrf 
            <h1  id="crearEntradaTitulo" class="fs-4"></h1>
            <label for="cantidad">Ingrese a que email enviar los tickets</label>
            <input type="text" class="form-control" name="email"  >
            <input type="hidden"  value="{{$evento->id}}" name="evento_id">

            <input type="hidden" id="typeEntrada" name="type" value="0">
            <label for="cantidad">Ingrese la cantidad de entradas que desea enviar</label>
            <input type="number" class="form-control" name="cantidad" value="1" min="0"   >
            <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
      </div>

        </form>
      </div>
    </div>
  </div>
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


    function enviarentradasfisicas(){
    document.getElementById("typeEntrada").value="fisico"
}
function enviarentradasdigitales(){
    document.getElementById("typeEntrada").value="digital"
}
</script>
