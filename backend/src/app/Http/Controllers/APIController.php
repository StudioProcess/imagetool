<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Http\Requests;

use JWTAuth, File, Validator, Imagick;

class APIController extends Controller {

	public function add_images(Request $request) {

		$bigSize = 2000;
		$smallSize = 300;

		$user = JWTAuth::toUser($request['token']);
		$tempPath = 'temp/'.$user['id'];
		$destinationPath = 'images/'.$user['id'];

		// check if image
		$validator = Validator::make(
		    ['images' => $request['images']],
			['images.*' => ['image']]
		);
		if ($validator->fails()) {
			return response()->json(
            	[
					'status' => 'error',
					'message' => 'Add images; File(s) must be an image.'
				], 200);  
		}

		// create user directory if it doesnt exist
		if(!File::exists($tempPath)) {
		    File::makeDirectory($tempPath, $mode = 0777, true, true);
		}
		if(!File::exists($destinationPath)) {
		    File::makeDirectory($destinationPath, $mode = 0777, true, true);
		}

		$total_upload_success = true;
		//$last_uploaded_images = $user->last_uploaded_images;
		$uploaded_images = json_decode($user->last_uploaded_images, true);
		if ($request->hasFile('images')) {
			$files = $request->file('images');
			foreach($files as $file){
				$originalname = $file->getClientOriginalName();
				$filename = pathinfo($originalname, PATHINFO_FILENAME);
				$extension = pathinfo($originalname, PATHINFO_EXTENSION);

				$imagename = $filename; //date('ymdHis')."_".$filename;
				
				$upload_success = $file->move($tempPath, $imagename.".".$extension);

				if ($upload_success) {
					$user->latest_loginstat->increment('uploads');
					$image_id = $user->latest_loginstat['uploads'];

					$imagick = new Imagick(public_path()."/".$tempPath."/".$imagename.".".$extension);

				    $imagick->normalizeImage(); // normalize image
				    $imagick->AutoGammaImage(); // auto gamma
					$imagick->autoLevelImage(); // adjust color channels
					$imagick->enhanceImage(); // remove noise
					//$imagick->contrastImage(0.5); // raise contrast / to strong??

					if ( $imagick->getImageWidth() > $bigSize || $imagick->getImageHeight() > $bigSize ) {
						$imagick->resizeImage($bigSize, $bigSize, imagick::FILTER_LANCZOS, 1, true);
					}
					$imagick->writeImage(public_path()."/".$destinationPath."/".$imagename."-full.".$extension);
					
					$imagick->resizeImage($smallSize, $smallSize, imagick::FILTER_LANCZOS, 1, true);
					$imagick->writeImage(public_path()."/".$destinationPath."/".$imagename."-thumb.".$extension);

					$uploaded_images[] = array(
							'id' => $image_id,
							'name' => $imagename,
							'extension' => $extension,
							'urls' => array(
									'full' => $destinationPath."/".$imagename."-full.".$extension,
									'thumb' => $destinationPath."/".$imagename."-thumb.".$extension
								)
						);
					
					File::cleanDirectory($tempPath);

				} else {
					$total_upload_success = false;
				}
			}
		} else {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Add images; No file(s) selected.'
				], 200);
		}

		$uploaded_images_json = json_encode($uploaded_images); //JSON_FORCE_OBJECT
		$user->last_uploaded_images = $uploaded_images_json;
		$user->save();

		if ($total_upload_success) {
			return response()->json(
				[
					'status' => 'success',
					'message' => 'Add images; Image(s) uploaded.',
					'data' => 
						[
							'last_uploaded_images' => $uploaded_images_json
						]
				], 200);
		} else {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Add images; There was an error with the upload.'
				], 200);
		}
		
	}

	public function remove_image(Request $request) {

		$user = JWTAuth::toUser($request['token']);
		$uploaded_images = json_decode($user->last_uploaded_images, true);
		$image_id = $request['image_id'];
		$found = false;

		if ( $image_id ) {

			foreach($uploaded_images as $image_key => $image){
				if ( $image['id'] == $image_id ) {
					$found = true;
					unset($uploaded_images[$image_key]);
				}
			}

			if ( $found ) {
				$uploaded_images_json = json_encode($uploaded_images); //JSON_FORCE_OBJECT
				$user->last_uploaded_images = $uploaded_images_json;
				$user->save();
			} else {
				return response()->json(
					[
						'status' => 'error',
						'message' => 'Remove image; image_id not found.'
					], 200);
			}
			
		} else {
			return response()->json(
				[
					'status' => 'error',
					'message' => 'Remove image; No image_id given.'
				], 200);
		}

		return response()->json(
			[
				'status' => 'success',
				'message' => 'Remove image; Images removed.',
				'data' => 
					[
						'last_uploaded_images' => $uploaded_images_json
					]
			], 200);

	}

	public function get_images(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get images; List of images.',
				'data' =>
					[
						'last_uploaded_images' => $user['last_uploaded_images']
					]
			], 200);

	}

	public function set_cover(Request $request) {

		$user = JWTAuth::toUser($request['token']);

		$image_id = $request['image_id'];

		$border_color1 = $request['border']['color1'];
		$border_color2 = $request['border']['color2'];
		$border_orientation = $request['border']['orientation'];

		$logos_position = $request['logos']['position'];
		$logos_brand = $request['logos']['brand'];

		$eyecatcher_position = $request['eyecatcher']['position'];
		$eyecatcher_form = $request['eyecatcher']['form'];
		$eyecatcher_text = $request['eyecatcher']['position'];




		return response()->json(
			[
				'status' => 'success',
				'message' => 'Set cover; Cover generated.',
				'data' => 
					[
						'test' => $image_id." ".$border_color1
					]
			], 200);

	}

	public function get_cover_settings(Request $request) {

		$user = JWTAuth::toUser($request['token']);	

		return response()->json(
			[
				'status' => 'success',
				'message' => 'Get cover settings.',
				'data' => 
					[
						'cover_settings' => $user['cover_settings']
					]
			], 200);

	}

}