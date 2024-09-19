<?php

namespace App\Models;
use App\Models\Entrada;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Evento extends Model
{
    use HasFactory;

protected $fillable=['nombre','descripcion','fecha','user_id','hora'];
protected $with=['entradas'];

protected $casts = [
    'created_at' => 'datetime:d-m-Y H:i',
        'updated_at' => 'datetime:d-m-Y H:i',
];

    public $timestamps = true;

   public function getCreatedAtAttribute($value)
{
    return Carbon::parse($value)->subHours(3)->format('d/m/Y H:i');
}

// Or for updated_at:

public function getUpdatedAtAttribute($value)
{
    return Carbon::parse($value)->subHours(3)->format('d/m/Y H:i');
}
public function Entradas(){
    return $this->hasMany(Entrada,'evento_id')
}
}