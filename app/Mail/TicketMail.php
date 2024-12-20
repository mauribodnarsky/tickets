<?php

namespace App\Mail;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\Entrada;
use App\Models\Evento;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class TicketMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public $ticket;
    public $evento;
    public $qr;

    public function __construct(Entrada $ticket,Evento $evento)
    {
        $this->ticket = $ticket;
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

$plaintext = $this->ticket->id;
$encrypt_method = "AES-256-CBC";	
	$secret_key = 'lamejorticketeradetodas';
$secret_iv = 'lamejorticketeradetodasiv';


// hash
$key = hash('sha256', $secret_key);

// iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
$iv = substr(hash('sha256', $secret_iv), 0, 16);

    $encryptedString = openssl_encrypt($plaintext, $encrypt_method, $key, 0, $iv);
    $encryptedString = str_replace('/', '-',base64_encode($encryptedString));





$path = storage_path('app/public/eventos/'.$this->evento->nombre.'/tickets/' . $this->ticket->id . '.png');
$writer = QrCode::size(2000)
    ->format('png')
    ->generate($encryptedString, $path);

    
        return $this->from('tickets@estarweb.com.ar', 'ESTARWEB TICKETS')
        ->view('emails.ticketenviado',['qr',$this->ticket->id])->attach($path);    }
}
