<div class="row">
    <div class="col-10">
        @foreach($tickets as $ticket)
            <div class="row">
    <div class="col-12">
    <div class="row"><div class="col-4">
        <div class="visible-print text-center">

{!!  QrCode::size(100)->generate('https://tickets.estarweb.com.ar/' . $data['evento_id'] . '/event/' . $ticket['id']) !!}
    <p>No escanear.</p>
</div>
    </div>
    <div class="col-8"><img src="{{$dataEntrada['diseno']}}" class="w-50 my-auto" /></div></div>;
                
    </div>

        
    </div>
    @endforeach
</div>