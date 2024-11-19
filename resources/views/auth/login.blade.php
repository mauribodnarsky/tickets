@extends('layouts.app')

]                <x-application-logo class="w-20 h-20 fill-current text-gray-500" />

        <!-- Session Status -->
        <x-auth-session-status class="mb-4" :status="session('status')" />

        <!-- Validation Errors -->
        <x-auth-validation-errors class="mb-4" :errors="$errors" />
<div class="row">
        <form method="POST" class="col-6 text-center" action="{{ route('login') }}">
        <div class="row">
            <!-- Email Address -->
            <div class="col-12 col-md-6 offset-3">
            @csrf

                <x-label for="email" class="block mt-1 w-full" :value="__('Email')" />

                <x-input id="email" class="block mt-1 form-control" placeholder="fiestabum@gmail.com"  type="email" name="email" :value="old('email')" required autofocus />
            </div>

            <!-- Password -->
            <div class="mt-4 col-12 col-md-6 offset-3">
                <x-label for="password" :value="__('Password')" />

                <x-input id="password" class="block form-control mt-1 w-full"
                                type="password"
                                name="password"
                                required autocomplete="current-password" />
            </div>

            <!-- Remember Me -->
            <div class="mt-4 col-12 col-md-6 offset-3 ">
                <label for="remember_me" class="inline-flex items-center">
                    <input id="remember_me" type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="remember">
                    <span class="ml-2 text-sm text-gray-600">{{ __('Recordarme') }}</span>
                </label>
            </div>

            <div class="mt-4 col-12 col-md-6 offset-3">
                @if (Route::has('password.request'))
                    <a class="underline text-sm text-gray-600 hover:text-gray-900" href="{{ route('password.request') }}">
                        {{ __('olvidaste tu contraseña?') }}
                    </a>
                @endif
            </div>
                <div class="mt-4 col-12 col-md-6 offset-3">
                <x-button class=" btn btn-warning  w-50">
                    {{ __('Ingresar') }}
                </x-button>
            </div>
            </div>
        </form>
        <div class="col-12 col-md-6">
        @if (Route::has('register'))
                                    <a class="btn btn-primary" href="{{ route('register') }}">Registrarme</a>
                            @endif
        </div>
</div>