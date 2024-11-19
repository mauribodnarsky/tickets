<?php

namespace App\Mail;

use App\Models\Evento;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AsignarVendedor extends Mailable
{
    use Queueable, SerializesModels;
    public $evento;
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Evento $evento)
    {
        $this->evento=$evento;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->from('tickets@estarweb.com.ar', 'ESTARWEB TICKETS')
        ->view('emails.ticketenviado',['evento',$this->evento]);
    }
}
