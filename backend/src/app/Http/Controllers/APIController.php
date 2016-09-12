<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use JWTAuth;

class APIController extends Controller {

	public function upload_images(Request $request) {

		$picture = '';
		if ($request->hasFile('images')) {
		    $files = $request->file('images');
		    foreach($files as $file){
		        $filename = $file->getClientOriginalName();
		        $extension = $file->getClientOriginalExtension();
		        $picture = date('His')."_".$filename;
		        $destinationPath = public_path().'/uploads/';
		        //$file->move($destinationPath, $picture);
		        Storage::disk('local') -> put($picture, file_get_contents($file -> getRealPath()));
		    }
		}

	    return response()->json(
			[
				'status' => 'success',
				'message' => 'Uploaded images.'
			], 200);
	}
}