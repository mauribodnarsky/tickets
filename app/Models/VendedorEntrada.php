<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use App\Models\Entrada;
class VendedorEntrada extends Model
{
    use HasFactory;
    
protected $fillable=['user_id','entradas_vendidas','email','limite_venta'];
protected $with=['entradas'];
protected $table='vendedores_entradas';
protected $casts = [
    'created_at' => 'datetime:d-m-Y H:i',
        'updated_at' => 'datetime:d-m-Y H:i',
];

    public $timestamps = true;

   public function getCreatedAtAttribute($value)
{
    return Carbon::parse($value)->subHours(3)->format('d/m/Y H:i');
}



public function Entradas(){
    return $this->hasMany(Entrada::class,'user_id');
}

public function getUpdatedAtAttribute($value)
{
    return Carbon::parse($value)->subHours(3)->format('d/m/Y H:i');
}

}

