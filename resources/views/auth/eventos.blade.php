@extends('layouts.app')

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Crear   
 Evento</div>

                <div class="card-body">
                    <form method="POST" action="{{ route('eventos.store')}}">
                        @csrf

                        <div class="form-group">
                            <label for="name">Nombre</label>
                            <input type="text" class="form-control" id="name" name="name" required>
                        </div>

                        <div class="form-group">
                            <label   
 for="description">Descripción</label>
                            <textarea class="form-control" id="description" name="description" rows="3"   
 required></textarea>
                        </div>

                        <div class="form-group">
                            <label   
 for="date">Fecha</label>
                            <input type="date" class="form-control" id="date" name="date" required>
                        </div>

                        <div class="form-group">
                            <label   
 for="time">Hora</label>
                            <input type="time" class="form-control" id="time" name="time" required>   

                        </div>

                        <button type="submit" class="btn btn-primary">Crear</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-12">
        @if(isset($eventos))
            @foreach($eventos as $evento)
            <div class="row">
                <div class="col-7">
                    {{$evento->nombre}}
                </div>
            </div>
            @endforeach
        @endif
    </div>
</div>