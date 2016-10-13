<?php

namespace App\Http\Middleware;

use Closure;

use JWTAuth;

use Exception;

class authJWT {
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next) {

        try {
          // Check for X-Access-Token header
          $header_token = $request->header('x-access-token');
          if ( !empty($header_token) ) {
            // Set as 'token' request param
            $request->merge(['token' => $header_token]);
          }
          $user = JWTAuth::toUser($request->input('token'));

        } catch (Exception $e) {

            if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException){

                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Authentication failed; Token is invalid.',
                        'token_given' => $request->input('token')
                    ], 401);

            }else if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException){

                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Authentication failed; Token is expired.'
                    ], 401);

            }else{

                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Authentication failed; Something is wrong. Maybe no token provided.'
                    ], 401);

            }

        }

         return $next($request);

    }

}
