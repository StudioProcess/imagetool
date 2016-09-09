<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Hash;
use JWTAuth;

class APIController extends Controller {
	
    public function register(Request $request) {        
    	$input = $request->all();
    	$input['password'] = Hash::make($input['password']);
    	try {
	    	User::create($input);
    	} catch (Exception $e) {
    		if($e instanceof QueryException){
    			return response()->json(
					[
						'status' => 'error',
						'message' => 'Registration failed; Random problem.'
					], 500);
			}
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Registration failed; Random problem.'
				], 500);
    	}
        return response()->json(
			[
				'status' => 'success',
				'message' => 'Registration was successful.'
			], 200);
    }
    
    public function login(Request $request) {
        $input = $request->all();
        try {
            // verify the credentials and create a token for the user
            if (! $token = JWTAuth::attempt($input)) {
                return response()->json(
                	[
						'status' => 'error',
						'message' => 'Login failed; Invalid email or password.'
					], 401);
            }
        } catch (JWTException $e) {
            // something went wrong
            return response()->json(
            	[
					'status' => 'error',
					'message' => 'Login failed; Could not create token.'
				], 500);
        }
        return response()->json(
    		[
				'status' => 'success',
				'message' => 'Login was successful.',
				'data' =>
					[
						'access_token' => $token
					]
			], 200);
    }
    
    public function get_user_details(Request $request) {
    	$input = $request->all();
    	$user = JWTAuth::toUser($input['token']);
        return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user details.',
				'data' => $user
			], 200);
    }
    
}