@extends('layouts.app')

<div class="row justify-content-center">
  <div class="col-12">
    <a href="http://lector.estarweb.com.ar/" target="_blank">IR AL LECTOR QR</a>
  </div>
</div>
    <div class="row justify-content-center">
    <div class="col-12">
      <div class="row">
        <div class="col-12 col-md-8 offset-md-2 col-lg-4 text-center">
          <button class="btn btn-warning w-100 text-center" data-bs-target="#modalcrearEvento" data-bs-toggle="modal">NUEVO Evento</button>
        </div>
      </div>
        @if(isset($eventos))
        <div class="row">
            <div class="col-12">
                <h2 class="py-2 my-2 retro-team">EVENTOS</h2>
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
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#asignarvendedormodal" data-bs-toggle="modal" onclick="asignarVendedor('{{$evento->id}}')">ASIGNAR VENDEDORES</button>
              </div>

            <div class="col-12 col-sm-6 my-1">
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#crearentradas" data-bs-toggle="modal" onclick="crearEntradas('{{$evento->nombre}}','{{$evento->id}}')">CREAR ENTRADAS</button>
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
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#asignarvendedormodal" data-bs-toggle="modal" onclick="asignarVendedor('{{$evento->id}}')">ASIGNAR VENDEDORES</button>
              </div>

            <div class="col-12 col-sm-6 my-1">
                    <button class="btn btn-warning w-100 text-center " data-bs-target="#crearentradas" data-bs-toggle="modal" onclick="crearEntradas('{{$evento->nombre}}','{{$evento->id}}')">CREAR ENTRADAS</button>
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
<div class="modal fade" id="crearentradas" tabindex="-1" aria-labelledby="crearentradasLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="crearentradasLabel">CREAR TICKETS</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form method="POST" action="{{ route('eventos.creartickets')}}" enctype='multipart/form-data'  >
            @csrf 
            <h1  id="crearEntradaTitulo" class="fs-4"></h1>

            <input type="hidden" id="crearEntradaId" name="crearEntradaId">
            <label for="cantidad">Cantidad de entradas fisicas</label>
            <input type="number" class="form-control" name="cantidad_fisico"  >
            <label for="cantidad">Cantidad de entradas digitales</label>
            <input type="number" class="form-control" name="cantidad_digital"  >
            
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




<!-- Modal -->
<div class="modal fade" id="modalcrearevento" tabindex="-1" aria-labelledby="modalcreareventoLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalcreareventoLabel">CREAR EVENTO</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <div class="col-12">
            <div class="card">
                <div class="card-header">Datos del evento</div>

                <div class="card-body text-center fs-4">
                    <form method="POST" action="{{ route('eventos.store')}}" enctype='multipart/form-data'>
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
                        <label for="photo">Banner</label>
                        <input type="file" name="photo"  >
                        </div>
                        <div class="form-group">
                            <label for="name">Ubicación</label>
                            <input type="text" class="form-control" id="ubicacion" placeholder="Puedes insertar el enlace a la ubicación en google maps" name="ubicacion" required>
                        </div>
                        <div class="form-group">
                            <label for="name">Categoria</label>
                            <input type="text" class="form-control" id="categoria" placeholder="FIESTA" name="categoria" required>
                        </div>
                        <div class="form-group">
                            <label   
 for="date">Fecha</label>
                            <input type="datetime-local" class="form-control" id="date" name="fecha" required>
                        </div>

                        
                        <button type="submit" class="btn btn-warning garet-bookmy-3 text-center w-75">Crear Evento</button>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</div>





















<!-- Asignar vendedores-->



<!-- Modal -->
<div class="modal fade" id="asignarvendedormodal" tabindex="-1" aria-labelledby="asignarvendedorLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="asignarvendedorLabel">ASIGNAR VENDEDOR</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form method="POST" action="{{ route('eventos.asignarvendedor')}}"   >
            @csrf 
            <label for="cantidad">Ingrese el email del usuario (en caso que no esté registrado el vendedor deberá hacerlo)</label>
            <input type="text" name="email"  class="form-control">

            <input type="hidden" id="asignarVendedorId" name="asignarVendedorId">
            <label for="cantidad">Ingrese la cantidad de entradas que desea otorgarle</label>
            <input type="number" class="form-control" value="1" min="0" name="cantidad"  >
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
  function  enviarEntradas(nombre,id){
    document.getElementById("enviarEntradaId").value=id

  }

  function  asignarVendedor(id){
    document.getElementById("asignarVendedorId").value=id

  }
</script>