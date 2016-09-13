<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Http\Requests;

use JWTAuth;

class APIController extends Controller {

	public function add_images(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		$total_upload_success = true;
		$uploaded_images = array();
		if ($request->hasFile('images')) {
			$files = $request->file('images');
			foreach($files as $file){
				$filename = $file->getClientOriginalName();
				//$extension = $file->getClientOriginalExtension();
				$picture = $user['id']."_".date('ymdHis')."_".$filename;
				$destinationPath = 'uploads';
				$upload_success = $file->move($destinationPath, $picture); // "normal" method
				//Storage::disk('public') -> put($picture, file_get_contents($file -> getRealPath())); //Filesystem method
				if ($upload_success) {
					$uploaded_images[] = $picture;
					$user->latest_loginstat->increment('uploads');
				} else {
					$total_upload_success = false;
				}
			}
		}

		$uploaded_images_json = json_encode($uploaded_images);

		$user->last_uploaded_images = $uploaded_images_json;

		$user->save();

		if ($total_upload_success) {
			return response()->json(
				[
					'status' => 'success',
					'message' => 'Image upload; Images uploaded.',
					'data' => 
						[
							'last_uploaded_images' => $uploaded_images_json
						]
				], 200);
		} else {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Image upload; There was an error with the upload.'
				], 200);
		}
		
	}

	public function process_images(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		if (!class_exists('Imagick'))
			throw new RuntimeException('Imagick not installed');

		return response()->json(
				[
					'status' => 'success',
					'message' => 'Process Images; Images processed. TEST',
					'data' => 
						[
							'last_uploaded_images' => $user['last_uploaded_images']
						]
				], 200);

	}
}