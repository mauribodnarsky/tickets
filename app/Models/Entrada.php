<?php

namespace App\Models;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entrada extends Model
{
    protected $fillable=['evento_id','diseno','type','type_ticket','ingreso'];
    protected $table = 'entradas'; // Reemplaza 'tus_entradas' con el nombre real de tu tabla
    protected $casts = [
        'created_at' => 'datetime:d-m-Y H:i',
            'updated_at' => 'datetime:d-m-Y H:i',
    ];
    
        public $timestamps = true;
    
       public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->subHours(0)->format('d/m/Y H:i');
    }
    
    // Or for updated_at:
    
    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->subHours(0)->format('d/m/Y H:i');
    }
}
