<?php

namespace App\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\Entrada;
use App\Models\Evento;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class EnviarTicketsFisicos extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public $tickets;
    public $evento;
    public $qr;

    public function __construct(Array $tickets,Evento $evento)
    {
        $this->tickets = $tickets;
        $this->evento = $evento;

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {

        // Create QR code
       
      
Storage::makeDirectory('public/eventos/'.$this->evento->nombre.'/tickets', 0755, true);

// Generar y guardar el código QR
$secret_key = 'lamejorticketeradetodas';
$secret_iv = 'lamejorticketeradetodasiv';
$encrypt_method = "AES-256-CBC";	


// hash
$key = hash('sha256', $secret_key);

// iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
$iv = substr(hash('sha256', $secret_iv), 0, 16);


foreach($this->tickets as $entrada){


    $encryptedString = openssl_encrypt($entrada->id, $encrypt_method, $key, 0, $iv);
    $encripted_id = str_replace('/', '-',base64_encode($encryptedString));
    $entrada->id=$encripted_id; 
}	;
$pdf = Pdf::loadView('emails.ticketsfisicos',['qr',$this->tickets]);

return $this->from('tickets@estarweb.com.ar', 'ESTARWEB TICKETS')
->attach($pdf);      
    
    }
}
