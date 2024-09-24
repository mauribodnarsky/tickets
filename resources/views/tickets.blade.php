@extends('layouts.app')
<div class="row">
    <div class="col-12">
        <button onclick="generarpdf()">Crear pdf</button>
    </div>
</div>
<div class="row">
    <div class="col-10 offset-1"  id="content">
        @foreach($tickets as $ticket)
            <div class="row ticket my-3">
    <div class="col-12">
    <div class="row"><div class="col-6 qr">
        <div class="visible-print text-center">





{!!  QrCode::size(150)->generate($ticket['id']) !!}
    
</div>
    </div>
    <div class="col-6 text-center my-auto">
        <h1 class="d-block fs-1">{{$evento->nombre}}</h1>
        <h2 class="d-block fs-3 text-danger">{{$evento->descripcion}}</h2>

        <h4 class="d-block fs-5">{{$evento->fecha}}</h4>
</div></div>
                
    </div>

        
    </div>
    @endforeach
</div>

<div id="elementH"></div>

<style>
    .ticket{
        padding: 2em 0em;
        border: solid 3px gray;

    }
    .qr{
        border-right: dashed 2px goldenrod;
    }
</style>

<!-- jQuery library -->
<script
  src="https://code.jquery.com/jquery-3.7.1.js"
  integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="
  crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<script>
 function generarpdf(){
    var doc = new jsPDF();
var elementHTML = $('#content').html();
var specialElementHandlers = {
    '#elementH': function (element, renderer) {
        return true;
    }
};
doc.fromHTML(elementHTML, 15, 15, {
    'width': 170,
    'elementHandlers': specialElementHandlers
});

// Save the PDF
doc.save('sample-document.pdf');
 }
</script>