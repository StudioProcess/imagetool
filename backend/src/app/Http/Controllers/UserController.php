<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Hash, Validator;
use JWTAuth, Auth, File;
use Tymon\JWTAuth\Exceptions\JWTException;

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
		
		$session_data = app('App\Http\Controllers\APIController')
			->get_session_data($request)->getData()->data;
		
		return response()->json([
			'status' => 'success',
			'message' => 'Login was successful.',
			'data' => $session_data,
			'token' => $token
		], 200);
  }

	public function logout(Request $request) {
		$user = JWTAuth::toUser();
		
		// clear old data
		$user->last_uploaded_images = "";
		$user->cover_settings = "";
		$user->save();

		$tempPath = 'temp/'.$user['id'];
		File::cleanDirectory($tempPath);
		$destinationPath = 'images/'.$user['id'];
		File::cleanDirectory($destinationPath);
		
		// new stats session
		$user->loginstats()->create([
			'session_string' => 'session_'.date('y-m-d_H:i:s')
		]);

		try {
			JWTAuth::invalidate( JWTAuth::getToken() );
		} catch (JWTException $e) {
			return response()->json([
					'status' => 'error',
					'message' => 'Reset session; Error invalidating token.',
					'exception' => $e->getMessage()
				], 403);
		}

		return response()->json([
			'status' => 'success',
			'message' => 'Logged out.'
		], 200);
	}

    public function register_user(Request $request) {        
    	$input = $request->all();
    	$input['password'] = Hash::make($input['password']);
    	$input['brands'] = json_encode($input['brands']);
			$input['theme_color'] = json_encode($input['theme_color']);

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
					], 400);
			}
			if ($errors->has('name')) {
			    return response()->json(
	            	[
						'status' => 'error',
						'message' => 'Registration failed; Name already in use.'
					], 400);
			}
			  
		}

    	try {
	    	$user = User::create($input);
				
				// If truthy admin status is given, set it
				if ( $request->input('is_admin') ) {
					$user->is_admin = true;
					$user->save();
				}
    	} catch (Exception $e) {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Registration failed; Random problem.'
				], 500);
    	}

    	// $new_token = JWTAuth::refresh($request->input('token'));
        return response()->json(
			[
				'status' => 'success',
				'message' => 'Registration was successful.',
				// 'token' => $new_token
			], 200);
    }
		
		public function delete_user(Request $request) {
			$input = $request->all();
			
			$validator = Validator::make($input, array('id' => 'required'));
			if ($validator->fails()) {
				return response()->json([
					'status' => 'error',
					'message' => 'Delete user; An user id is missing.'
				], 400);
			}
			
			if ($input['id'] == 0 || $input['id'] == 1) {
				return response()->json([
					'status' => 'error',
					'message' => 'Delete user; Can\'t delete Super Admin.'
				], 403);
			}
			
			$user = User::where('id',$input['id'])->first();
			if (!$user) {
				return response()->json([
					'status' => 'error',
					'message' => 'Delete user; User not found.'
				], 404);
			}
			
			$user->delete();
			return response()->json([
				'status' => 'success',
				'message' => 'Deleted user.'
			], 200);
		}
    
    public function get_user_details(Request $request) {
    	$user = JWTAuth::toUser($request->input('token'));

    	$user['brands'] = json_decode($user['brands']);
			$user['theme_color'] = json_decode($user['theme_color']);

    	// $new_token = JWTAuth::refresh($request->input('token'));
        return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user details.',
				'data' => [
					'user' => $user
				],
				// 'token' => $new_token
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
					'message' => 'Update user; An user id is missing.'
				], 400);
		}
		
			if ( ($input['id'] == 0 || $input['id'] == 1) 
				&& isset($input['is_admin']) ) {
				return response()->json([
					'status' => 'error',
					'message' => 'Update user; Can\'t touch admin status of Super Admin.'
				], 403);
			}
    	
    	$user = User::where('id',$input['id'])->first();
			if (!$user) {
				return response()->json([
						'status' => 'error',
						'message' => 'Update user; User not found.'
					], 404);
			}

    	if ( $request->input('email') ) {
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
							'message' => 'Update user; Email already in use.'
						], 400);
				}
			}
		}

	    if ( $request->input('password') ) {
	    	if ( $input['password'] != $input['password_confirmation'] ) {
	    		return response()->json(
					[
						'status' => 'error',
						'message' => 'Update user; Passwords does not match.'
					], 400);
	    	}
	        $input['password'] = Hash::make($input['password']);
	    }

	    if ( $request->input('name') ) {
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
							'message' => 'Update user; Name already in use.'
						], 400);
				}
			}
		}

			if ( $request->input('brands') ) {
	    	$input['brands'] = json_encode($input['brands']);
			}
			if ( $request->input('theme_color') ) {
				$input['theme_color'] = json_encode($input['theme_color']);
			}
			
			// Allow change of admin status
			if ( isset($input['is_admin']) ) {
				$user->is_admin = $request->input('is_admin') ? true : false;
			}
	    $user->fill($input);
	    $user->save();

	    $user['brands'] = json_decode($user['brands']);
			$user['theme_color'] = json_decode($user['theme_color']);

	    // $new_token = JWTAuth::refresh($request->input('token'));
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Update user; Updated user data.',
				'data' => $user,
				// 'token' => $new_token
			], 200);
	}

	public function reset_session(Request $request) {
		$user = JWTAuth::toUser();

		// set loginstat for this session
		$user->loginstats()->create([
			'session_string' => 'session_'.date('y-m-d_H:i:s')
		]);

		// clear old data
		$user->last_uploaded_images = "";
		$user->cover_settings = "";
		$user->save();

		$tempPath = 'temp/'.$user['id'];
		File::cleanDirectory($tempPath);
		$destinationPath = 'images/'.$user['id'];
		File::cleanDirectory($destinationPath);
		
		// new stats session
		$user->loginstats()->create([
			'session_string' => 'session_'.date('y-m-d_H:i:s')
		]);

		try {
			$new_token = JWTAuth::refresh($request->input('token'));
		} catch (JWTException $e) {
			return response()->json([
					'status' => 'error',
					'message' => 'Reset session; Error refreshing token.',
					'exception' => $e->getMessage()
				], 403);
		}
		
		return response()->json([
				'status' => 'success',
				'message' => 'Reset session.',
				'token' => $new_token
			], 200);
	}

	public function refresh_session(Request $request) {
		$new_token = JWTAuth::refresh($request->input('token'));
		
		return response()->json([
			'status' => 'success',
			'message' => 'Refresh session token.',
			'token' => $new_token
		], 200);
	}

	public function user_list(Request $request) {
    	$users = User::all();

    	foreach ($users as $user) {
    		$user['brands'] = json_decode($user['brands']);
				$user['theme_color'] = json_decode($user['theme_color']);
    	}

    	// $new_token = JWTAuth::refresh($request->input('token'));
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user list.',
				'data' => $users,
				// 'token' => $new_token
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
				], 400);
		}
    	
    	$user = User::where('id',$input['id'])->first();
			if (!$user) {
				return response()->json([
						'status' => 'error',
						'message' => 'Get user statistics; User not found.'
					], 404);
			}

    	// $new_token = JWTAuth::refresh($request->input('token'));
	    return response()->json(
        	[
				'status' => 'success',
				'message' => 'Get user statistics.',
				'data' =>
					[
						'userstats' => $user->loginstats
					],
				// 'token' => $new_token
			], 200);
	}
}
