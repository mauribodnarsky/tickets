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
       
      
       $writer= // Crear el directorio si no existe
Storage::makeDirectory('public/eventos/'.$this->evento->nombre.'/tickets', 0755, true);

// Generar y guardar el código QR
$path = storage_path('app/public/eventos/'.$this->evento->nombre.'/tickets/' . $this->ticket->id . '.png');
$writer = QrCode::size(500)
    ->format('png')
    ->generate($this->ticket->id, $path);
        return $this->from('tickets@estarweb.com.ar', 'ESTARWEB TICKETS')
        ->view('emails.ticketenviado',['qr',$this->ticket->id])->attach($path);    }
}
