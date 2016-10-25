<?php

namespace App\Http\Middleware;

use Closure;

use JWTAuth;

use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;

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
        $x_access_token = $request->header('x-access-token');
        $x_auth_token = $request->header('x-auth-token');
        $header_token = !empty($x_access_token) ? $x_access_token : $x_auth_token;
        if ( ! empty($header_token) ) {
          // Set as 'token' request param
          $request->merge(['token' => $header_token]);
        }
        $token = $request->input('token');
        JWTAuth::authenticate($token);
        JWTAuth::setToken($token);

      } catch (JWTException $e) {
        
        if ($e instanceof TokenInvalidException) {
          return response()->json([
            'status' => 'error',
            'message' => 'Authentication failed; Token is invalid.',
            'token_given' => $request->input('token')
          ], 401);

        } else if ($e instanceof TokenExpiredException) {
          return response()->json([
            'status' => 'error',
            'message' => 'Authentication failed; Token is expired.'
          ], 401);

        } else {
          return response()->json([
            'status' => 'error',
            'message' => 'Authentication failed; Something is wrong. Maybe no token provided.',
            'exception' => [
              'message' => $e->getMessage(),
    					'code' => $e->getCode(),
    					'file' => $e->getFile(),
    					'line' => $e->getLine()
            ],
            'tokens' => [
              'x-access-token' => $x_access_token,
              'x-auth-token' => $x_auth_token,
              'token' => $request->input('token')
            ]
          ], 401);
        }

      }
      
      return $next($request);

    }

}
