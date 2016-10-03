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

            try {
              // Check for X-Access-Token header
              $user = JWTAuth::toUser($request->header('x-access-token'));
              // Set as 'token' request param
              $request->merge(['token' => $request->header('x-access-token')]);
            } catch (Exception $e) {
              $user = JWTAuth::toUser($request->input('token'));
            }

            $token = JWTAuth::getToken();

        } catch (Exception $e) {

            if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException){

                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Authentication failed; Token is invalid.'
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