<div class="row justify-content-center mt-5">
    <div class="col-sm-4 shadow p-3">
      <h5 class="text-center">Escanear codigo QR</h5>
      <div class="row text-center">
        <a id="btn-scan-qr" >
          <img src="https://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2017/07/1499401426qr_icon.svg" class="img-fluid text-center" width="175">
        <a/>
        <canvas hidden="" id="qr-canvas" class="img-fluid"></canvas>
        </div>
        <div class="row mx-5 my-3">
        <button class="btn btn-success btn-sm rounded-3 mb-2" onclick="encenderCamara()">Encender camara</button>
        <button class="btn btn-danger btn-sm rounded-3" onclick="cerrarCamara()">Detener camara</button>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-12" >
      <h1 id="messageapi">mensaje </h1>
    </div>
  </div>
  <div class="row">
    <div class="col-4 bg-secondary" id="loading-animation">
      Cargando...
    </div>
    <div class="col-4 bg-success" id="success-animation">
        PROCEDA
      </div>
      <div class="col-4 bg-danger" id="error-animation">
      ERROR      
      </div>
    
  </div>
  <audio id="audioScaner" src="{{asset('public/sonido.mp3')}}"></audio>

    <script src="{{asset('public/qrCode.min.js')}}"></script>
  <script src="{{asset('public/index.js')}}"></script>