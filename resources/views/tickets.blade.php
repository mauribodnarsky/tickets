<div class="row">
    <div class="col-10">
        @foreach($tickets as $ticket){
            <div class="row">
    <div class="col-12">
    <div class="row"><div class="col-4">
        <img src="https://tickets.estarweb.com.ar/creartickets/storage/app/eventos/{{$data['crearEntradaId']}}/tickets/{{$ticket['id']}}.png" class="w-50 my-auto" />
    </div>
    <div class="col-8"><img src="{{$dataEntrada['diseno']}}" class="w-50 my-auto" /></div></div>;

            {{$ticket['']}}
    </div>

        }
    </div>
</div>