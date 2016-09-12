<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth');


Route::group(['prefix' => '/user'], function () {

	Route::post('/register', 'UserController@register');

	Route::post('/login', 'UserController@login');

	Route::group(['middleware' => 'jwt-auth'], function () {

		Route::post('/get_user_details', 'UserController@get_user_details');

		Route::post('/update', 'UserController@update');

		Route::get('/logout', 'UserController@logout');

	});

});

Route::group(['middleware' => 'jwt-auth'], function () {

	Route::post('/upload_images', 'APIController@upload_images');

});

// Route::get('/user', function() {
//      // Only authenticated users may enter...
// 	return $request->user();
// })->middleware('auth.basic');

/*Route::group(['middleware' => 'auth:api'], function () { //'prefix' => 'api/v1', 
    Route::post('/short', 'UrlMapperController@store');
    Route::get('/ef', function () {
	    return view('welcome');
	});
});

Auth::guard('api')->user();*/