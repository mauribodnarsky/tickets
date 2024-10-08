@extends('layouts.app')
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
  <audio id="audioScaner" src="{{asset('/sonido.mp3')}}"></audio>

    <script src="{{asset('/qrCode.min.js')}}"></script>

    <script>
      
//crea elemento
const video = document.createElement("video");

//nuestro camvas
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

//div donde llegara nuestro canvas
const btnScanQR = document.getElementById("btn-scan-qr");

//lectura desactivada
let scanning = false;

//funcion para encender la camara
const encenderCamara = () => {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      scanning = true;
      btnScanQR.hidden = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.srcObject = stream;
      video.play();
      tick();
      scan();
    });
};

//funciones para levantar las funiones de encendido de la camara
function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

  scanning && requestAnimationFrame(tick);
}

function scan() {
  try {
    qrcode.decode();
  } catch (e) {
    setTimeout(scan, 300);
  }
}

//apagara la camara
const cerrarCamara = () => {
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  canvasElement.hidden = true;
  btnScanQR.hidden = false;
};

const activarSonido = () => {
  var audio = document.getElementById('audioScaner');
  audio.play();
}


//callback cuando termina de leer el codigo QR
qrcode.callback = (respuesta_lector) => {
    alert(respuesta_lector)
  document.getElementById("messageapi").innerHTML+="<H2>respuesta "+respuesta_lector+"</H2>"
  fetch("http://tickets.estarweb.com.ar/api/verifyticket",{
    headers: {
      'Authorization': 'Bearer ' + '{{ $token }}'
  },  
      method: "POST", // O POST, PUT, DELETE según tu API
      dataType: "json",
      data:{
        "link_event":respuesta_lector
      
      }}).then(response=>{
        console.log(response)
        document.getElementById("messageapi").innerText="respuesta"+response
      })
      .then(error=>alert("Error"+error))
   
    Swal.fire(respuesta)
    activarSonido();
    //encenderCamara();    
    cerrarCamara();    

  
};
//evento para mostrar la camara sin el boton 
window.addEventListener('load', (e) => {
  encenderCamara();
})







    </script>