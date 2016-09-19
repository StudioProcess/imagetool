<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Hash, Validator;
use JWTAuth, Auth, File;

class UserController extends Controller
{

    public function register(Request $request) {        
    	$input = $request->all();
    	$input['password'] = Hash::make($input['password']);
    	$input['brands'] = json_encode($input['brands']);

    	$validator = Validator::make(
		    ['email' => $input['email']],
			['email' => ['unique:users']]
		);
		if ($validator->fails()) {
			return response()->json(
            	[
					'status' => 'error',
					'message' => 'Registration failed; Email already in use.'
				], 200);  
		}

    	try {
	    	User::create($input);
    	} catch (Exception $e) {
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

        $user = JWTAuth::toUser($token);

        // set loginstat for this session
    	$user->loginstats()->create(
        	[
        		'token' => $token
        	]);

    	// clear old data
    	$user->last_uploaded_images = "";
		$user->save();

		$tempPath = 'temp/'.$user['id'];
		File::cleanDirectory($tempPath);
		$destinationPath = 'images/'.$user['id'];
		File::cleanDirectory($destinationPath);

        return response()->json(
    		[
				'status' => 'success',
				'message' => 'Login was successful.',
				'data' =>
					[
						'access_token' => $token
					],
				'token' => $token
			], 200);
    }
    
    public function get_user_details(Request $request) {
    	$input = $request->all();
    	$user = JWTAuth::toUser($input['token']);

    	$new_token = JWTAuth::refresh($input['token']);
        return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user details.',
				'data' => $user,
				'token' => $new_token
			], 200);
    }

    public function update(Request $request) {        
    	$input = $request->all();
    	
    	$user = JWTAuth::toUser($input['token']);
	    //$user->username = $input('name');

	    if ($input['password'] != '') {
	    	if ( $input['password'] != $input['password_confirmation'] ) {
	    		return response()->json(
					[
						'status' => 'error',
						'message' => 'Udpate user; Passwords does not match.'
					], 200);
	    	}
	        $input['password'] = Hash::make($input['password']);
	    }

	    $input['brands'] = json_encode($input['brands']);

	    $user->fill($input);

	    $user->save();

	    $new_token = JWTAuth::refresh($input['token']);
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Udpate user; Updated user data.',
				'data' => $user,
				'token' => $new_token
			], 200);
	}

	public function logout(Request $request) {

    	JWTAuth::invalidate(JWTAuth::getToken());

	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Logged out.'
			], 200);
	}

	public function get_userstats(Request $request) {

    	$user = JWTAuth::toUser($request['token']);

    	$new_token = JWTAuth::refresh($request['token']);
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user statistics.',
				'data' =>
					[
						'userstats' => $user->loginstats
					],
				'token' => $new_token
			], 200);
	}
}
