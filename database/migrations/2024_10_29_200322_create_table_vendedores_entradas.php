<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableVendedoresEntradas extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vendedores_entradas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();

            $table->unsignedBigInteger('evento_id')->nullable();
            $table->foreign('evento_id')->references('id')->on('eventos');
            $table->foreign('user_id')->references('id')->on('users');

            $table->integer('entradas_vendidas');
            $table->string('email');

            $table->integer('limite_venta')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('table_vendedores_entradas');
    }
}
