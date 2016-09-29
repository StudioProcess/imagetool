<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Hash, Validator;
use JWTAuth, Auth, File;

class UserController extends Controller
{

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
        		'session_string' => 'session_'.date('y-m-d_H:i:s')
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
				'token' => $token
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

    public function register_user(Request $request) {        
    	$input = $request->all();
    	$input['password'] = Hash::make($input['password']);
    	$input['brands'] = json_encode($input['brands']);

		$validator = Validator::make($input,
			array(
				'email' => 'unique:users',
				'name' => 'unique:users'
			)
		);
		if ($validator->fails()) {
			$errors = $validator->errors();
			if ($errors->has('email')) {
			    return response()->json(
	            	[
						'status' => 'error',
						'message' => 'Registration failed; Email already in use.'
					], 200);
			}
			if ($errors->has('name')) {
			    return response()->json(
	            	[
						'status' => 'error',
						'message' => 'Registration failed; Name already in use.'
					], 200);
			}
			  
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

    	$new_token = JWTAuth::refresh($request->input('token'));
        return response()->json(
			[
				'status' => 'success',
				'message' => 'Registration was successful.',
				'token' => $new_token
			], 200);
    }
    
    public function get_user_details(Request $request) {
    	$user = JWTAuth::toUser($request->input('token'));

    	$user['brands'] = json_decode($user['brands']);

    	$new_token = JWTAuth::refresh($request->input('token'));
        return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user details.',
				'data' => $user,
				'token' => $new_token
			], 200);
    }

    public function update_user(Request $request) {        
    	$input = $request->all();

    	$validator = Validator::make($input,
			array(
				'id' => 'required'
			)
		);
		if ($validator->fails()) {
			return response()->json(
            	[
					'status' => 'error',
					'message' => 'Udpate user; An user id is missing.'
				], 200);
		}
    	
    	$user = User::where('id',$input['id'])->first();

    	if ($input['email'] != '') {
	    	if ($input['email'] != $user->email) {
		    	$validator = Validator::make($input,
					array(
						'email' => 'unique:users'
					)
				);
				if ($validator->fails()) {
					return response()->json(
		            	[
							'status' => 'error',
							'message' => 'Udpate user; Email already in use.'
						], 200);
				}
			}
		}

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

	    if ($input['name'] != '') {
	    	if ($input['name'] != $user->name) {
			    $validator = Validator::make($input,
					array(
						'name' => 'unique:users'
					)
				);
				if ($validator->fails()) {
					return response()->json(
		            	[
							'status' => 'error',
							'message' => 'Udpate user; Name already in use.'
						], 200);
				}
			}
		}

	    $input['brands'] = json_encode($input['brands']);

	    $user->fill($input);
	    $user->save();

	    $user['brands'] = json_decode($user['brands']);

	    $new_token = JWTAuth::refresh($request->input('token'));
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Udpate user; Updated user data.',
				'data' => $user,
				'token' => $new_token
			], 200);
	}

	public function reset_session(Request $request) {

    	$user = JWTAuth::toUser($request->input('token'));

        // set loginstat for this session
    	$user->loginstats()->create(
        	[
        		'session_string' => 'session_'.date('y-m-d_H:i:s')
        	]);

    	// clear old data
    	$user->last_uploaded_images = "";
		$user->save();

		$tempPath = 'temp/'.$user['id'];
		File::cleanDirectory($tempPath);
		$destinationPath = 'images/'.$user['id'];
		File::cleanDirectory($destinationPath);

		$new_token = JWTAuth::refresh($request->input('token'));
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Reset session.',
				'token' => $new_token
			], 200);
	}

	public function user_list(Request $request) {
    	$users = User::all();

    	foreach ($users as $user) {
    		$user['brands'] = json_decode($user['brands']);
    	}

    	$new_token = JWTAuth::refresh($request->input('token'));
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user statistics.',
				'data' => $users,
				'token' => $new_token
			], 200);
	}

	public function user_stats(Request $request) {
		$input = $request->all();

		$validator = Validator::make($input,
			array(
				'id' => 'required'
			)
		);
		if ($validator->fails()) {
			return response()->json(
            	[
					'status' => 'error',
					'message' => 'Get user statistics; An user id is missing.'
				], 200);
		}
    	
    	$user = User::where('id',$input['id'])->first();

    	$new_token = JWTAuth::refresh($request->input('token'));
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
