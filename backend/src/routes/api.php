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

Route::post('/login', 'UserController@login');

Route::group(['middleware' => ['before' => 'jwt-auth']], function () {

	Route::get('/logout', 'UserController@logout');

});


Route::group(['middleware' => ['before' => 'jwt-auth']], function () {

	Route::group(['prefix' => '/admin', 'middleware' => 'permission'], function () {

		Route::post('/user', 'UserController@register_user');

		Route::patch('/user', 'UserController@update_user');

		Route::delete('/user', 'UserController@delete_user');

		Route::get('/user_list', 'UserController@user_list');

		Route::get('/user_stats', 'UserController@user_stats');

	});

	Route::group(['prefix' => '/session'], function () {
		
		Route::get('/userdata', 'UserController@get_user_details');

		Route::get('/reset', 'UserController@reset_session');
		
		Route::get('/refresh', 'UserController@refresh_session');

		Route::post('/images', 'APIController@add_images');

		Route::delete('/images', 'APIController@remove_image');

		Route::get('/images', 'APIController@get_images');

		Route::post('/cover', 'APIController@set_cover');

		Route::get('/cover', 'APIController@get_cover_settings');

		Route::get('/archive', 'APIController@get_image_archive');

	});	

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
