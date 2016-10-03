<?php

namespace App\Http\Middleware;

use Closure;

use JWTAuth;

use Exception;

class checkPermission {
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next) {

        //return $next($request);
    	//$response = ;

        $user = JWTAuth::toUser($request->input('token'));
        //$user = JWTAuth::toUser(JWTAuth::getToken());

        if (!$user->is_admin) {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Forbidden.'
                ], 403);
        }

        return $next($request);
    }

}