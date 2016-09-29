<?php

namespace App\Http\Middleware;
use Closure;

class CORS {
    public function handle($request, Closure $next) {
        header('Access-Control-Allow-Origin: *');
        
        $headers = [
            'Access-Control-Allow-Methods'=> 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers'=> 'Origin, Content-Type, X-Auth-Token, Authorization',
            'Access-Control-Max-Age'=> '28800'
        ];
        if($request->getMethod() == "OPTIONS") {
            return Response::make('OK', 200, $headers);
        }
        
        $response = $next($request);
        foreach($headers as $key => $value)
            $response->header($key, $value);
        return $response;
    }
}
