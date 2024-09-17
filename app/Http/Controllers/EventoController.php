<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Illuminate\Http\Request;
use Vcode\Qrcode\Qrcode;
use Illuminate\Support\Facades\Storage;
class EventoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function show(Evento $evento)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function edit(Evento $evento)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Evento $evento)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Evento  $evento
     * @return \Illuminate\Http\Response
     */
    public function destroy(Evento $evento)
    {
        //
    }
    public function generateQRCode()
{
    $qrcode = new Qrcode(array(
        'qrcode::google_config_default' => array(
            'chs' => "250x250",
            'cht' => "qr",
            'chld'=> "H|1",         // H(QML)|1, H|2, H|3, H|4, H|10, H|40,
            'choe'=> "UTF-8"        // UTF-8, Shift_JIS, ISO-8859-1
        ),
        'qrcode::template_simple' => './template',
        'qrcode::storage_dir'     => '/tmp'
    ));
$value = "estarweb.com.ar";
$qrcode->storageImage($value,"/evento/entradas/", "logo".$value.".png", 0.7);
$qrcode->render("250");
die();
$url=public_path()."/evento/entradas/"."logo1.png";
    return view('qrCode', ['url' => $url]);
}
}
