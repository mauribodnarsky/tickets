<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Evento extends Model
{
    use HasFactory;

protected $fillable=['nombre','descripcion','fecha','user_id'];


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
}