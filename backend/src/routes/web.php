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

Route::get('/dbnew', function()
{
    $exitCode = Artisan::call('migrate:reset');
    $exitCode = Artisan::call('migrate');
    $exitCode = Artisan::call('db:seed');
});

Route::get('/dbreset', function()
{
    $exitCode = Artisan::call('migrate:reset');
});

Route::get('/dbmigrate', function()
{
    $exitCode = Artisan::call('migrate');
});

Route::get('/dbseed', function()
{
    $exitCode = Artisan::call('db:seed');
});

Route::get('/ccache', function()
{
    $exitCode = Artisan::call('cache:clear');
});

Route::get('/cmd', function()
{
    //$exitCode = Artisan::call('make:middleware authJWTRefresh');
});
