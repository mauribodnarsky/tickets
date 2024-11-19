<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableEventos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('eventos', function (Blueprint $table) {
 
            $table->id();
            $table->unsignedBigInteger('user_id');

            $table->string('nombre');
            $table->string('descripcion')->nullable();
            $table->dateTime('fecha');
            $table->string('ubicacion')->nullable();
            $table->string('diseno')->nullable()->default(null);

            $table->string('categoria')->nullable();   
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
      });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('eventos');
    }
}
