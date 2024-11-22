<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'QR ESTARWEB') }}</title>

    <!-- Scripts -->
    <script src="{{ asset('js/app.js') }}" defer></script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
  <script src="{{asset('qrCode.min.js')}}"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Fonts -->

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
 
<div class="row">
    <div class="col-10 offset-1"  id="content">
        @foreach($tickets as $ticket)
            <div class="row my-2 ticket " style="background-image: url({{$ticket->diseno}});">
    <div class="col-12">
    <div class="row"><div class="col-4 qr fondo-entrada">
        <div class="visible-print text-center">

{!!  QrCode::size(150)->generate($ticket['id']) !!}
   
</div>
    </div>
    <div  class="col-8 text-center my-auto ">
        <h1 class="d-block fs-1">{{$evento->nombre}}</h1>
        <h2 class="d-block fs-3 text-danger">{{$evento->descripcion}}</h2>

        <h4 class="d-block fs-5">{{$evento->fecha}}</h4>
</div></div>
                
    </div>

        
    </div>
    @endforeach
</div>

<div id="elementH"></div>

</body>
</html>
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

