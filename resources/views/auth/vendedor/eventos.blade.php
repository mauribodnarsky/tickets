@extends('layouts.app')


    <div class="row justify-content-center">
    <div class="col-12">
     
        @if(isset($eventos))
        <div class="row">
            <div class="col-12">
            <h3 class="py-2 my-2 text-center retro-team">Hola vendedor!</h3>

                <h1 class="py-2 my-2 retro-team">EVENTOS</h1>
            </div>
        </div>
            @foreach($eventos as $evento)
            @if ($evento->id % 2 == 0) 

            <div class="row my-2 fila-evento fila-par ">
                <div class="col-12 col-md-5 d-flex align-items-center all-ages ">
                    {{$evento->nombre}}
                </div>
              <!--  <div class="col-2">
                <form method="POST" action="{{ route('eventos.delete')}}">
                @csrf
                    <input type="hidden" value="{{$evento->id}}" name="id">
                    <input type="submit" value="BORRAR" class="btn btn-success p-3">
                </form>
                </div>-->
                <div class="col-12 col-md-7">
                <div class="row">
                    <div class="col-12 col-sm-6 my-1">
                    <a class="btn btn-warning w-100 text-center " href="verevento/{{$evento->id}}">VER EVENTO</a>
                    </div>
       
            <div class="col-12 col-sm-6 my-1">
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#enviarentradas" data-bs-toggle="modal" onclick="enviarEntradas('{{$evento->nombre}}','{{$evento->id}}')">ENVIAR ENTRADAS</button>
              </div>
             
                </div>
             </div>
            </div>
            @else    <div class="row my-2 fila-evento fila-impar ">
                <div class="col-12 col-md-5 d-flex align-items-center all-ages ">
                    {{$evento->nombre}}
                </div>
              <!--  <div class="col-2">
                <form method="POST" action="{{ route('eventos.delete')}}">
                @csrf
                    <input type="hidden" value="{{$evento->id}}" name="id">
                    <input type="submit" value="BORRAR" class="btn btn-success p-3">
                </form>
                </div>-->
                <div class="col-12 col-md-7">
                <div class="row">
                    <div class="col-12 col-sm-6 my-1">
                    <a class="btn btn-warning w-100 text-center " href="verevento/{{$evento->id}}">VER EVENTO</a>
                    </div>
               
         
            <div class="col-12 col-sm-6 my-1">
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#enviarentradas" data-bs-toggle="modal" onclick="enviarEntradas('{{$evento->nombre}}','{{$evento->id}}')">ENVIAR ENTRADAS</button>
              </div>
             
                </div>
             </div>
            </div>
            @endif
        

            @endforeach
        @endif
    </div>
    </div>



<!-- Modal -->
<div class="modal fade" id="enviarentradas" tabindex="-1" aria-labelledby="crearentradasLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="crearentradasLabel">ENVIAR TICKETS</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form method="POST" action="{{ route('eventos.enviartickets')}}"   >
            @csrf 
            <h1  id="crearEntradaTitulo" class="fs-4"></h1>
            <label for="cantidad">Ingrese a que email enviar los tickets</label>
            <input type="text" class="form-control" name="email"  >

            <input type="hidden" id="enviarEntradaId" name="id">
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








<script>

  function  enviarEntradas(nombre,id){
    document.getElementById("enviarEntradaId").value=id

  }

</script>