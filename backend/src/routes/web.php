<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();


Route::get('/home', 'HomeController@index');


/* DEV */

Route::get('/dbmigrate', function()
{
    $exitCode = Artisan::call('migrate');
});

Route::get('/dbreset', function()
{
    $exitCode = Artisan::call('migrate:reset');
});

Route::get('/cmd', function()
{
    $exitCode = Artisan::call('artisan vendor:publish --provider="Tymon\JWTAuth\Providers\JWTAuthServiceProvider"');
});
