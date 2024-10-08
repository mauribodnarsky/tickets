@extends('layouts.app')

<div class="container">
<div class="row justify-content-center">
  <div class="col-12">
    <a href="http://lector.estarweb.com.ar/" target="_blank">IR AL LECTOR QR</a>
  </div>
</div>
    <div class="row justify-content-center">
        <div class="col-5">
            <div class="card">
                <div class="card-header">Crear   
 Evento</div>

                <div class="card-body">
                    <form method="POST" action="{{ route('eventos.store')}}">
                        @csrf

                        <div class="form-group">
                            <label for="name">Nombre</label>
                            <input type="text" class="form-control" id="name" name="nombre" required>
                        </div>

                        <div class="form-group">
                            <label   
 for="description">Descripción</label>
                            <textarea class="form-control" id="description" name="descripcion" rows="3"   
 required></textarea>
                        </div>

                        <div class="form-group">
                            <label   
 for="date">Fecha</label>
                            <input type="datetime-local" class="form-control" id="date" name="fecha" required>
                        </div>

                        <div class="form-group">
                            <label   
 for="time">Hora</label>
                            <input type="time" class="form-control" id="time" name="hora" required>   

                        </div>

                        <button type="submit" class="btn btn-primary">Crear</button>
                    </form>
                </div>
            </div>
        </div>
    <div class="col-7">
        @if(isset($eventos))
        <div class="row">
            <div class="col-12">
                <h2 class="py-2 my-2 fs-1">EVENTOS</h2>
            </div>
        </div>
            @foreach($eventos as $evento)
            <div class="row my-2">
                <div class="col-7">
                    {{$evento->nombre}}
                </div>
              <!--  <div class="col-2">
                <form method="POST" action="{{ route('eventos.delete')}}">
                @csrf
                    <input type="hidden" value="{{$evento->id}}" name="id">
                    <input type="submit" value="BORRAR" class="btn btn-success p-3">
                </form>
                </div>-->
                <div class="col-5">
                <div class="row">
                    <div class="col-6">
                    <a class="btn btn-primary " href="verevento/{{$evento->id}}">VER EVENTO</a>
                    </div>
                    <div class="col-6">
                    <button class="btn btn-primary " data-bs-target="#crearentradas" data-bs-toggle="modal" onclick="crearEntradas('{{$evento->nombre}}','{{$evento->id}}')">CREAR ENTRADAS</button>
                    </div>
                </div>
             </div>
            </div>

            @endforeach
        @endif
    </div>
    </div>
</div>
<!-- Modal -->
<div class="modal fade" id="crearentradas" tabindex="-1" aria-labelledby="crearentradasLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="crearentradasLabel">CREAR TICKETS</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form method="POST" action="{{ route('eventos.creartickets')}}"enctype='multipart/form-data'  >
            @csrf 
            <h1  id="crearEntradaTitulo" class="fs-4"></h1>

            <input type="hidden" id="crearEntradaId" name="crearEntradaId">
            <label for="cantidad">Cantidad de entradas</label>
            <input type="number" name="cantidad"  >
            <label for="photo">Diseño de fondo</label>
            <input type="file" name="photo"  >
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
  function  crearEntradas(nombre,id){
    document.getElementById("crearEntradaId").value=id
    document.getElementById("crearEntradaTitulo").textContent='Crear entradas para '+nombre

  }
</script>