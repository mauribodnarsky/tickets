<?php

namespace App\Mail;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\Entrada;
use App\Models\Evento;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

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
       
      
       $writer= QrCode::size(500)
        ->format('png')
        ->generate($this->ticket->id, storage_path('app/eventos/1/tickets/qrcode.png'));    
        return $this->from('tickets@estarweb.com.ar', 'ESTARWEB TICKETS')
        ->view('emails.ticketenviado',['qr',""])->attachData($writer, 'name.pdf', [
            'mime' => 'application/pdf',
        ]);    }
}
