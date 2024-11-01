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
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
<div class="row">
    <div class="col-10 offset-1">
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
    <img src="{{ $message->embed($qr, 'entrada.pdf') }}">
    <div class="col-12 qr  fondo-entrada  ">
        <div class="visible-print text-center mt-2  ">





    
</div>
#000000{{$ticket->id}}
    </div>

    </div>
                
    </div>

        
    </div>
    
    </div>

        
    </div>
</div>
</div>

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
</body>
</html>